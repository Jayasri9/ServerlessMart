import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { getStoreProducts } from "../api/api"; // Fetch products for each store

function AllStores() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [storeCounts, setStoreCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }

    const loadTenants = async () => {
      try {
        const response = await fetch(
          "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/tenants"
        );
        let tenantsData = [];
        if (response.ok) {
          tenantsData = await response.json();
          setTenants(tenantsData);

          // Fetch product counts for each store
          tenantsData.forEach((t) => {
            getStoreProducts(t.tenantId)
              .then((products) => {
                setStoreCounts((prev) => ({ ...prev, [t.tenantId]: products.length }));
              })
              .catch((err) => {
                console.error("Failed to fetch products for tenant:", t.tenantId, err);
                setStoreCounts((prev) => ({ ...prev, [t.tenantId]: 0 }));
              });
          });
        }
      } catch (err) {
        console.error("Failed to load tenants:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [navigate]);

  const handleViewStore = (tenantId) => {
    navigate(`/store/${tenantId}`);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading stores...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2>All Stores ({filteredTenants.length})</h2>
        <button
          onClick={() => navigate("/marketplace")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Back to Marketplace
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search stores by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
      </div>

      {/* Stores Grid */}
      {filteredTenants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#666" }}>No stores found</h3>
          <p style={{ color: "#999" }}>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "25px",
          }}
        >
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.tenantId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "25px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onClick={() => handleViewStore(tenant.tenantId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                    fontSize: "32px",
                    color: "white",
                  }}
                >
                  🏪
                </div>
                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "20px" }}>
                  {tenant.storeName || `Store ${tenant.tenantId}`}
                </h3>
                <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
                  {tenant.email}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ color: "#666", fontSize: "14px" }}>Store ID:</span>
                  <span style={{ color: "#333", fontSize: "12px", fontFamily: "monospace" }}>
                    {tenant.tenantId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: "14px" }}>Products:</span>
                  <span style={{ color: "#007bff", fontWeight: "bold", fontSize: "16px" }}>
                    {storeCounts[tenant.tenantId] || 0}
                  </span>
                </div>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  marginTop: "20px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
              >
                Visit Store
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllStores;