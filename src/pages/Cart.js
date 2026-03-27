import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { addToCart, getCart, updateCart, clearCart } from "../api/api";
import { refreshCart } from "../utils/dataSync";
import { formatCurrency } from "../utils/currency";
import React from "react";

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
      
      console.log("Cart: Loading for userId:", userId, "tenantId:", tenantId);
      
      const items = await refreshCart(userId, tenantId, false);
      console.log("Cart: Loaded items:", items);
      setCartItems(items);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      if (userId) {
        await updateCart(userId, tenantId, updatedCart);
      }
      // Refresh to confirm
      const items = await refreshCart(userId, tenantId, false);
      setCartItems(items);
    } catch (err) {
      console.error("Failed to update cart:", err);
      // Rollback optimistic - need to get userId and tenantId again
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      const items = await refreshCart(userId, tenantId, false);
      setCartItems(items);
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
    
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      if (userId) {
        await updateCart(userId, tenantId, updatedCart);
      }
      // Refresh to confirm
      const items = await refreshCart(userId, tenantId, false);
      setCartItems(items);
    } catch (err) {
      console.error("Failed to update cart:", err);
      // Rollback - need to get userId and tenantId again
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      const items = await refreshCart(userId, tenantId, false);
      setCartItems(items);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        const userId = localStorage.getItem("userId");
        const tenantId = localStorage.getItem("tenantId")
          || localStorage.getItem("currentTenantId")
          || "default-tenant";
        
        if (userId) {
          await clearCart(userId, tenantId);
          setCartItems([]);
          alert("Cart cleared successfully!");
        }
      } catch (err) {
        console.error("Failed to clear cart:", err);
        alert("Failed to clear cart. Please try again.");
      }
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
        <div style={{ display: "flex", gap: "10px" }}>
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
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Clear Cart
            </button>
          )}
        </div>
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
        <React.Fragment>
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
                    {item.description ? `${item.description.substring(0, 100)}...` : "No description available"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>{formatCurrency(item.price)}</span>
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
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={() => handleRemoveFromCart(item.productId)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#f8f9fa", marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3>Total:</h3>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>{formatCurrency(calculateTotal())}</span>
            </div>
            <button
              onClick={handleCheckout}
              style={{ width: "100%", padding: "15px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "8px", fontSize: "18px" }}
            >
              Checkout
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default Cart;
