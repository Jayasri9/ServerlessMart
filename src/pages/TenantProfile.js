import { useState, useEffect } from "react";
import { logout, getRole } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function TenantProfile() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const tenantId = localStorage.getItem("tenantId");

  const [form, setForm] = useState({
    storeName: "",
    email: "",
    subscriptionPlan: "basic"
  });

  useEffect(() => {
    const role = getRole();
    if (role !== "TENANT") {
      navigate("/tenant-login");
      return;
    }

    const loadTenantData = async () => {
      try {
        const response = await fetch(
          `https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/tenants`
        );
        if (response.ok) {
          const tenants = await response.json();
          const currentTenant = tenants.find((t) => t.tenantId === tenantId);
          if (currentTenant) {
            setTenant(currentTenant);
            setForm({
              storeName: currentTenant.storeName || "",
              email: currentTenant.email || "",
              subscriptionPlan: currentTenant.subscriptionPlan || "basic"
            });
          } else {
            console.error("Tenant not found");
          }
        }
      } catch (err) {
        console.error("Failed to load tenant data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTenantData();
  }, [navigate, tenantId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      alert("Profile updated successfully!");
      setEditing(false);
      setTenant({ ...tenant, ...form });
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setForm({
      storeName: tenant.storeName,
      email: tenant.email,
      subscriptionPlan: tenant.subscriptionPlan
    });
    setEditing(false);
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <h2>Tenant Profile</h2>
        <div>
          <button
            onClick={() => navigate("/tenant")}
            style={{
              marginRight: "10px",
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
          <button
            onClick={logout}
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
      </div>

      {tenant && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Store Information</h3>
            {!editing ? (
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Store Name:</strong> {tenant.storeName}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Email:</strong> {tenant.email}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Tenant ID:</strong> {tenant.tenantId}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Subscription Plan:</strong> {tenant.subscriptionPlan?.toUpperCase()}
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <strong>Member Since:</strong> {new Date(tenant.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label>Store Name:</label>
                  <input
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>Email:</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>Subscription Plan:</label>
                  <select
                    name="subscriptionPlan"
                    value={form.subscriptionPlan}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Tenant ID:</strong> {tenant.tenantId} (cannot be changed)
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Subscription Details</h3>
            <div style={{ marginBottom: "15px" }}>
              <strong>Current Plan:</strong> {tenant.subscriptionPlan?.toUpperCase()}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: tenant.subscriptionStatus === "active" ? "green" : "red",
                  fontWeight: "bold",
                  marginLeft: "5px"
                }}
              >
                {tenant.subscriptionStatus?.toUpperCase()}
              </span>
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                marginBottom: "15px"
              }}
            >
              <h4>Plan Features:</h4>
              {tenant.subscriptionPlan === "basic" && (
                <ul>
                  <li>Up to 50 products</li>
                  <li>Basic analytics</li>
                  <li>Email support</li>
                </ul>
              )}
              {tenant.subscriptionPlan === "premium" && (
                <ul>
                  <li>Up to 500 products</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                  <li>Custom branding</li>
                </ul>
              )}
              {tenant.subscriptionPlan === "enterprise" && (
                <ul>
                  <li>Unlimited products</li>
                  <li>Full analytics suite</li>
                  <li>24/7 phone support</li>
                  <li>Custom integrations</li>
                  <li>White-label options</li>
                </ul>
              )}
            </div>

            <button
              onClick={() => navigate("/subscription")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%"
              }}
            >
              Upgrade/Change Plan
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px"
        }}
      >
        <h3>Account Statistics</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px"
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>0</div>
            <div>Active Products</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px"
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>0</div>
            <div>Total Orders</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px"
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>0</div>
            <div>Total Revenue</div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px"
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#17a2b8" }}>0</div>
            <div>Customer Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantProfile;