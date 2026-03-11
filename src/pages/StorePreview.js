import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function StorePreview() {
  const navigate = useNavigate();
  const [tenantData, setTenantData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStoreData = useCallback(async () => {
    try {
      // Get tenant data from localStorage
      const tenantId = localStorage.getItem("tenantId");
      const storeName = localStorage.getItem("storeName");
      const tenantEmail = localStorage.getItem("tenantEmail");
      
      if (!tenantId) {
        navigate("/tenant-login");
        return;
      }

      setTenantData({
        tenantId,
        storeName,
        email: tenantEmail
      });
      
      // Load products for this tenant
      const productsResponse = await fetch(`https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/products`);
      if (productsResponse.ok) {
        const allProducts = await productsResponse.json();
        const tenantProducts = allProducts.filter(product => product.tenantId === tenantId);
        setProducts(tenantProducts);
      }
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  const getStoreUrl = () => {
    const tenantId = localStorage.getItem("tenantId");
    return `http://localhost:3000/store/${tenantId}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading store preview...</h2>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Store not found</h2>
        <button onClick={() => navigate("/tenant")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Store Preview</h2>
          <p style={{ color: "#666" }}>See how your store appears to customers</p>
        </div>
        <button
          onClick={() => navigate("/tenant")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Store Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "40px",
        borderRadius: "12px",
        marginBottom: "30px",
        textAlign: "center"
      }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "2.5em" }}>
          {tenantData.storeName}
        </h1>
        <p style={{ margin: "0", fontSize: "1.2em", opacity: 0.9 }}>
          Welcome to our store
        </p>
      </div>

      {/* Store Info */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div style={{ 
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Store Information</h4>
          <p style={{ margin: "5px 0", color: "#666" }}>
            <strong>Store ID:</strong> {tenantData.tenantId}
          </p>
          <p style={{ margin: "5px 0", color: "#666" }}>
            <strong>Email:</strong> {tenantData.email}
          </p>
          <p style={{ margin: "5px 0", color: "#666" }}>
            <strong>Total Products:</strong> {products.length}
          </p>
        </div>

        <div style={{ 
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Store URL</h4>
          <p style={{ margin: "5px 0", color: "#666" }}>
            Share this link with customers:
          </p>
          <div style={{ 
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "4px",
            wordBreak: "break-all",
            fontSize: "14px"
          }}>
            {getStoreUrl()}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(getStoreUrl())}
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Products Preview */}
      <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Products</h3>
        
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No products added yet.</p>
            <button
              onClick={() => navigate("/add-product")}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "20px" 
          }}>
            {products.map(product => (
              <div
                key={product.productId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "transform 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      background: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666"
                    }}
                  >
                    No Image
                  </div>
                )}
                <div style={{ padding: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>{product.name}</h4>
                  <p style={{ 
                    margin: "0 0 10px 0", 
                    color: "#666", 
                    fontSize: "14px",
                    lineHeight: "1.4"
                  }}>
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 ? "..." : ""}
                  </p>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <span style={{ 
                      fontSize: "1.2em", 
                      fontWeight: "bold", 
                      color: "#28a745" 
                    }}>
                      ${product.price}
                    </span>
                    <span style={{ 
                      fontSize: "0.9em", 
                      color: product.stock > 0 ? "#28a745" : "#dc3545" 
                    }}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer View Simulation */}
      <div style={{ 
        marginTop: "30px", 
        padding: "20px", 
        background: "#f8f9fa", 
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Customer View</h4>
        <p style={{ margin: "0 0 15px 0", color: "#666" }}>
          This is how customers will see your store. They can browse products and make purchases.
        </p>
        <button
          onClick={() => window.open(getStoreUrl(), '_blank')}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Open Store in New Tab
        </button>
      </div>
    </div>
  );
}

export default StorePreview;