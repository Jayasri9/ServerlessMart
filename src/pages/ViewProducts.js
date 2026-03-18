import { useState, useEffect, useCallback } from "react";
import { getProducts, deleteProduct } from "../api/api";
import { logout, getRole } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function ViewProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const tenantId = localStorage.getItem("tenantId");

  useEffect(() => {
    const role = getRole();
    if (role !== "TENANT") {
      navigate("/tenant-login");
      return;
    }
  }, [navigate]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      console.log("All products from DynamoDB:", data);
      
      let filteredProducts = data;
      if (tenantId) {
        filteredProducts = data.filter(p => p.tenantId === tenantId);
        console.log(`Products for tenant ${tenantId}:`, filteredProducts);
      }
      
      setProducts(filteredProducts);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products from DynamoDB");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) {
      loadProducts();
    }
  }, [tenantId, loadProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId, tenantId);
        alert("Product deleted successfully!");
        loadProducts(); // Refresh the products list
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product: " + err.message);
      }
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    alert("Toggle status functionality coming soon!");
  };

  const handleActivateAll = async () => {
    alert("Activate all functionality coming soon!");
  };

  const handleDeactivateAll = async () => {
    alert("Deactivate all functionality coming soon!");
  };

  const handleStockUpdate = async (productId) => {
    const newStockValue = prompt(
      `Enter new stock quantity for product:`,
      products.find(p => p.productId === productId)?.stock || 0
    );
    if (newStockValue !== null) {
      alert(`Stock update functionality coming soon! New stock: ${newStockValue}`);
    }
  };

  const handleBack = () => {
    navigate("/tenant");
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading products from DynamoDB...</h2>
        <div style={{ marginTop: "20px" }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Products {tenantId ? `- ${tenantId}` : "- All Tenants"}</h2>
        <div>
          <button
            onClick={() => navigate("/add-product")}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            Add Product
          </button>
          <button
            onClick={handleActivateAll}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            Activate All
          </button>
          <button
            onClick={handleDeactivateAll}
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
            Deactivate All
          </button>
          <button
            onClick={handleBack}
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

      {error && (
        <div style={{ padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
          <button
            onClick={loadProducts}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#721c24",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "3px"
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <strong>Total Products:</strong> {products.length}
        {tenantId && <span style={{ marginLeft: "10px", color: "#666" }}>(filtered for tenant: {tenantId})</span>}
      </div>

      {products.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", border: "2px dashed #ddd", borderRadius: "8px", backgroundColor: "#f8f9fa" }}>
          <h3>No Products Found</h3>
          <p>{tenantId ? "Your store has no products yet." : "No products found in DynamoDB."}</p>
          <button
            onClick={() => navigate("/add-product")}
            style={{
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {products.map((product) => (
            <div
              key={product.productId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"}
                  alt={product.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", backgroundColor: "#f8f9fa" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"; }}
                />
              </div>

              <div>
                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>{product.name}</h3>
                {product.description && (
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0", lineHeight: "1.4" }}>
                    {product.description.length > 100 ? `${product.description.substring(0, 100)}...` : product.description}
                  </p>
                )}

                <div style={{ marginBottom: "15px" }}>
                  {product.brand && <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}><strong>Brand:</strong> {product.brand}</div>}
                  {product.category && <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}><strong>Category:</strong> {product.category}</div>}
                  {product.weight && <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}><strong>Weight:</strong> {product.weight} kg</div>}
                  {product.tags && <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}><strong>Tags:</strong> {product.tags}</div>}
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                    <strong>Stock:</strong> 
                    <span onClick={() => handleStockUpdate(product.productId)} style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}>
                      {product.stock || 0}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#007bff" }}>₹{product.price}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>Stock: {product.stock || 0}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ padding: "4px 8px", backgroundColor: product.isActive ? "#d4edda" : "#f8d7da", color: product.isActive ? "#155724" : "#721c24", borderRadius: "12px", fontSize: "11px", marginBottom: "5px", display: "inline-block" }}>
                      {product.isActive ? "Active" : "Inactive"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999" }}>ID: {product.productId}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <button
                    onClick={() => handleToggleStatus(product.productId, product.isActive)}
                    style={{ flex: 1, padding: "8px", backgroundColor: product.isActive ? "#ffc107" : "#28a745", color: "black", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "14px" }}
                  >
                    {product.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    style={{ flex: 1, padding: "8px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "14px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewProducts;