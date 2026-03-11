import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { addToCart, getCart } from "../api/api";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    loadCart();
  }, [navigate]);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      if (userId) {
        console.log("Loading cart for user:", userId, "tenant:", tenantId);
        const cartData = await getCart(userId, tenantId);
        console.log("Cart data received:", cartData);
        
        if (cartData && cartData.items) {
          let items = cartData.items;
          if (typeof items === 'string') {
            items = JSON.parse(items);
          }
          setCartItems(items || []);
        } else {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) setCartItems(JSON.parse(savedCart));
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));
      } catch (localErr) {
        console.error("Failed to load from localStorage:", localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      if (userId && updatedCart.length > 0) {
        await addToCart({
          userId: userId,
          tenantId: tenantId,
          product: updatedCart[0],
          quantity: 1
        });
      }
    } catch (err) {
      console.error("Failed to sync cart with backend:", err);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      const updatedItem = updatedCart.find(item => item.productId === productId);
      if (userId && updatedItem) {
        await addToCart({
          userId: userId,
          tenantId: tenantId,
          product: updatedItem,
          quantity: newQuantity
        });
      }
    } catch (err) {
      console.error("Failed to update cart on backend:", err);
    }
  };

  const calculateTotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading cart...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Shopping Cart ({cartItems.length} items)</h2>
        <button
          onClick={() => navigate("/user")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Continue Shopping
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Your cart is empty</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>Add some products to your cart to get started!</p>
          <button
            onClick={() => navigate("/user")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px"
            }}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div>
          {cartItems.map(item => (
            <div
              key={item.productId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                display: "flex",
                gap: "15px",
                alignItems: "center"
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666"
                  }}>
                    No Image
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 5px 0" }}>{item.name}</h4>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0" }}>
                  Store: {item.tenantId}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>₹{item.price}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      style={{ width: "30px", height: "30px", border: "1px solid #ddd", backgroundColor: "white", cursor: "pointer", borderRadius: "4px" }}
                    >-</button>
                    <span style={{ minWidth: "40px", textAlign: "center" }}>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      style={{ width: "30px", height: "30px", border: "1px solid #ddd", backgroundColor: "white", cursor: "pointer", borderRadius: "4px" }}
                    >+</button>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => handleRemoveFromCart(item.productId)}
                    style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3>Total:</h3>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{ width: "100%", padding: "15px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "8px", fontSize: "18px" }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;