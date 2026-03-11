import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { getOrders } from "../api/api";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const userId = localStorage.getItem("userId");
      console.log("Loading orders for user:", userId);
      
      const userOrders = await getOrders(userId);
      console.log("Orders received:", userOrders);
      
      setOrders(userOrders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      try {
        const savedOrders = localStorage.getItem("userOrders");
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (localErr) {
        console.error("Failed to load from localStorage:", localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#ffc107";
      case "processing": return "#17a2b8";
      case "shipped": return "#007bff";
      case "delivered": return "#28a745";
      case "cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "processing": return "Processing";
      case "shipped": return "Shipped";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Orders ({orders.length})</h2>
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

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>No orders yet</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>Start shopping to see your orders here!</p>
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
          {orders.map(order => (
            <div
              key={order.orderId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "white"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>Order #{order.orderId}</h4>
                  <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() + " at " + new Date(order.createdAt).toLocaleTimeString() : 
                     order.orderDate ? new Date(order.orderDate).toLocaleDateString() + " at " + new Date(order.orderDate).toLocaleTimeString() : 
                     "Date not available"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: getStatusColor(order.orderStatus || order.status || "pending")
                    }}
                  >
                    {getStatusText(order.orderStatus || order.status || "pending")}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Delivery Information</h5>
                <p style={{ margin: "0 0 5px 0" }}><strong>Name:</strong> {order.customerInfo?.name}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Email:</strong> {order.customerInfo?.email}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Phone:</strong> {order.customerInfo?.phone}</p>
                <p style={{ margin: "0" }}><strong>Address:</strong> {order.customerInfo?.address}</p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Order Items</h5>
                {order.items?.map(item => (
                  <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "15px", padding: "10px", borderBottom: "1px solid #eee" }}>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px"
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold" }}>{item.name}</div>
                      <div style={{ color: "#666", fontSize: "14px" }}>Store: {item.tenantId}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold" }}>₹{item.price}</div>
                      <div style={{ color: "#666", fontSize: "14px" }}>Qty: {item.quantity}</div>
                      <div style={{ fontWeight: "bold", color: "#007bff" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <div>
                  <h5 style={{ margin: "0" }}>Payment Method</h5>
                  <p style={{ margin: "5px 0 0 0", textTransform: "capitalize" }}>{order.paymentMethod?.replace('_', ' ')}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>
                    Total: ₹{order.totalAmount?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;