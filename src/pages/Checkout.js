import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/api";
import { getRole } from "../auth/auth";
import PaymentForm from "../components/PaymentForm";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod"
  });

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    loadCart();
  }, [navigate]);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerInfoSubmit = (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!formData.name || !formData.email || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.paymentMethod === "cod") {
      handleCODOrder();
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const tenantId = cartItems[0]?.tenantId || "default-tenant";
      const userId = localStorage.getItem("userId") || "user123";

      const orderData = {
        userId,
        tenantId,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: calculateTotal(),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        paymentMethod: paymentResult.method,
        paymentId: paymentResult.paymentId,
        transactionId: paymentResult.transactionId
      };

      console.log("Creating order with data:", orderData);
      await createOrder(orderData);

      localStorage.removeItem("cart");
      alert(`Order placed successfully! Payment ID: ${paymentResult.paymentId}`);
      navigate("/orders");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order: " + err.message);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleCODOrder = async () => {
    try {
      const tenantId = cartItems[0]?.tenantId || "default-tenant";
      const userId = localStorage.getItem("userId") || "user123";

      const orderData = {
        userId,
        tenantId,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: calculateTotal(),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        paymentMethod: "cod",
        paymentId: null
      };

      console.log("Creating COD order with data:", orderData);
      await createOrder(orderData);

      localStorage.removeItem("cart");
      alert("Order placed successfully! You will pay on delivery.");
      navigate("/orders");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading checkout...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2>Checkout</h2>
        <button
          onClick={() => navigate("/cart")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Back to Cart
        </button>
      </div>

      {!showPayment ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          {/* Order Summary */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ marginTop: "0" }}>Order Summary</h3>
            {cartItems.map(item => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Qty: {item.quantity} × ₹{item.price}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: "bold" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "2px solid #333"
            }}>
              <h3>Total:</h3>
              <h3 style={{ color: "#007bff" }}>₹{calculateTotal().toFixed(2)}</h3>
            </div>
          </div>

          {/* Customer Information */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ marginTop: "0" }}>Customer Information</h3>
            <form onSubmit={handleCustomerInfoSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label>Delivery Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical" }}
                />
              </div>

              <div>
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  padding: "15px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  fontSize: "18px"
                }}
              >
                {formData.paymentMethod === "cod" ? "Place Order" : "Proceed to Payment"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <PaymentForm
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
          amount={calculateTotal()}
          orderData={{
            customerInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address
            },
            items: cartItems
          }}
        />
      )}
    </div>
  );
}

export default Checkout;