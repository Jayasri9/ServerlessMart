import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { getOrders } from "../api/api";

function TenantOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const tenantId = localStorage.getItem("tenantId");

  const loadOrders = useCallback(async () => {
    try {
      const allOrders = await getOrders();
      // Filter orders by tenantId
      const tenantOrders = allOrders.filter(order => order.tenantId === tenantId);
      setOrders(tenantOrders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    const role = getRole();
    if (role !== "TENANT") {
      navigate("/tenant-login");
      return;
    }
    loadOrders();
  }, [loadOrders, navigate]);

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // TODO: Implement update order status API
      console.log("Update order status:", orderId, newStatus);
      alert("Order status update functionality coming soon!");
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
  };

  const calculateTotalRevenue = () => {
    return orders
      .filter(order => order.orderStatus !== "cancelled")
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getOrdersByStatus = () => {
    const statusCount = {};
    orders.forEach(order => {
      const status = order.orderStatus || order.status || "pending";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return statusCount;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  const statusCount = getOrdersByStatus();

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Orders ({orders.length})</h2>
        <button
          onClick={() => navigate("/tenant")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Order Statistics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#007bff" }}>Total Revenue</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>₹{calculateTotalRevenue().toFixed(2)}</div>
        </div>
        
        {Object.entries(statusCount).map(([status, count]) => (
          <div key={status} style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: getStatusColor(status) }}>{getStatusText(status)}</h3>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{count}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>No orders yet</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>When customers place orders, they will appear here!</p>
          <button
            onClick={() => navigate("/add-product")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px"
            }}
          >
            Add Products to Start Selling
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
              {/* Order Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #eee" }}>
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>Order #{order.orderId}</h4>
                  <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() + " at " + new Date(order.createdAt).toLocaleTimeString() : 
                     order.orderDate ? new Date(order.orderDate).toLocaleDateString() + " at " + new Date(order.orderDate).toLocaleTimeString() : 
                     "Date not available"}
                  </p>
                  <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
                    Customer: {order.customerInfo?.name} ({order.customerInfo?.email})
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

              {/* Order Items */}
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
                      <div style={{ color: "#666", fontSize: "14px" }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#007bff" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px", marginBottom: "15px" }}>
                <div>
                  <h5 style={{ margin: "0" }}>Payment Method</h5>
                  <p style={{ margin: "5px 0 0 0", textTransform: "capitalize" }}>{order.paymentMethod?.replace('_', ' ')}</p>
                  {order.paymentId && (
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
                      Payment ID: {order.paymentId}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>
                    Total: ₹{order.totalAmount?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ margin: "0 0 10px 0" }}>Delivery Information</h5>
                <p style={{ margin: "0 0 5px 0" }}><strong>Address:</strong> {order.customerInfo?.address}</p>
                <p style={{ margin: "0" }}><strong>Phone:</strong> {order.customerInfo?.phone}</p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <select
                  onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                  value={order.orderStatus || order.status || "pending"}
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "white"
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => updateOrderStatus(order.orderId, "processing")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TenantOrders;