import { useState, useEffect } from "react";
import { logout } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import { getTenantById } from "../api/api.js";

function TenantDashboard() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const tenantId = localStorage.getItem("tenantId");

  useEffect(() => {
  const loadTenantData = async () => {
    try {
      if (!tenantId) {
        console.error("No tenant ID found");
        navigate("/tenant-login");
        return;
      }

      const tenantData = await getTenantById(tenantId);
      setTenant(tenantData);
    } catch (err) {
      console.error("Failed to load tenant data:", err);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

    loadTenantData();
  }, [navigate, tenantId]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Tenant Dashboard</h2>
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

      {tenant && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
            <h3>Store Information</h3>
            <p><strong>Store Name:</strong> {tenant.storeName}</p>
            <p><strong>Tenant ID:</strong> {tenant.tenantId}</p>
            <p><strong>Email:</strong> {tenant.email}</p>
            <p><strong>Member Since:</strong> {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "N/A"}</p>
            <button
              onClick={() => navigate("/tenant-profile")}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Edit Profile
            </button>
          </div>

          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
            <h3>Subscription</h3>
            <p><strong>Plan:</strong> {(tenant.subscriptionPlan || "basic").toUpperCase()}</p>
            <p><strong>Status:</strong> 
              <span style={{ 
                color: (tenant.subscriptionStatus || "active") === "active" ? "green" : "red",
                fontWeight: "bold"
              }}>
                {(tenant.subscriptionStatus || "active").toUpperCase()}
              </span>
            </p>
            <button
              onClick={() => navigate("/subscription")}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <button
            onClick={() => navigate("/add-product")}
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
            Add New Product
          </button>
          
          <button
            onClick={() => navigate("/view-products")}
            style={{
              padding: "15px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            View Products
          </button>
          
          <button
            onClick={() => navigate("/tenant-orders")}
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
            View Orders
          </button>
          
          <button
            onClick={() => navigate("/view-analytics")}
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
            View Analytics
          </button>
          
          <button
            onClick={() => navigate("/store-preview")}
            style={{
              padding: "15px",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          >
            Store Preview
          </button>
        </div>
      </div>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#e9ecef" }}>
        <h4>Store Management</h4>
        <p>Manage your store appearance and performance:</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/store-preview")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            Preview Store
          </button>
          <button
            onClick={() => navigate("/view-analytics")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6f42c1",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;