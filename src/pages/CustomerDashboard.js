import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [userId] = useState("CUST" + Math.random().toString(36).substr(2, 9).toUpperCase());

  const handleLogout = () => {
    logout();
  };

  const handleMarketplace = () => {
    navigate("/marketplace");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const handleOrders = () => {
    alert("Orders feature coming soon!");
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Customer Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa", marginBottom: "20px" }}>
        <h3>Welcome, Customer!</h3>
        <p style={{ color: "#666" }}>Customer ID: {userId}</p>
        <p style={{ color: "#666" }}>Browse stores and shop from multiple tenants.</p>
      </div>

      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <button
            onClick={handleMarketplace}
            style={{
              padding: "15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            🛍️ Browse Marketplace
          </button>
          
          <button
            onClick={handleCart}
            style={{
              padding: "15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            🛒 My Cart
          </button>
          
          <button
            onClick={handleOrders}
            style={{
              padding: "15px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            📦 My Orders
          </button>
          
          <button
            onClick={() => alert("Profile feature coming soon!")}
            style={{
              padding: "15px",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            👤 My Profile
          </button>
        </div>
      </div>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#e9ecef" }}>
        <h4>Customer Features</h4>
        <ul style={{ lineHeight: "1.6" }}>
          <li>🛍️ Browse multiple stores</li>
          <li>🛒 Add products to cart</li>
          <li>📦 Place orders</li>
          <li>📊 Track order status</li>
          <li>⭐ Rate products and stores</li>
        </ul>
      </div>
    </div>
  );
}

export default CustomerDashboard;