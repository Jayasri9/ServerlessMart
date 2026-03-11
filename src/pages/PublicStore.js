import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoreProducts } from "../api/api";

function PublicStore() {
  const { tenantId } = useParams();
  const decodedTenantId = tenantId ? decodeURIComponent(tenantId) : "";
  const navigate = useNavigate();

  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const loadStoreData = useCallback(async () => {
    try {
      const tenantsResponse = await fetch(
        `https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/tenants`
      );
      if (tenantsResponse.ok) {
        const tenants = await tenantsResponse.json();
        let effectiveId = decodedTenantId;
        let tenant = tenants.find(
          (t) => t.tenantId.toLowerCase().trim() === effectiveId.toLowerCase().trim()
        );
        if (!tenant && window.location.hash) {
          const hashPart = window.location.hash.slice(1);
          effectiveId = `${decodedTenantId}#${hashPart}`;
          tenant = tenants.find(
            (t) => t.tenantId.toLowerCase().trim() === effectiveId.toLowerCase().trim()
          );
        }
        if (tenant) {
          setStoreData(tenant);
          try {
            const tenantProducts = await getStoreProducts(effectiveId);
            setProducts(tenantProducts);
          } catch (err) {
            console.error("Failed to fetch store products", err);
          }
        } else {
          setStoreData(null);
        }
      }
    } catch (err) {
      console.error("Failed to load store data:", err);
      setStoreData({});
    } finally {
      setLoading(false);
    }
  }, [decodedTenantId]);

  const loadCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
    loadCart();
  }, [loadStoreData, loadCart]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.productId === product.productId);
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name} added to cart!`);
  };

  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading store...</h2>
      </div>
    );
  }

  if (storeData === null) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Store not found</h2>
        <p>The store you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/marketplace")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Browse Other Stores
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Store Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "3em" }}>{storeData.storeName}</h1>
          <p style={{ margin: 0, fontSize: "1.3em", opacity: 0.9 }}>Welcome to our store</p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => navigate("/marketplace")}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              ← Back to Marketplace
            </button>
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              🛒 Cart ({getCartCount()})
            </button>
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Store Info */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>About This Store</h2>
          <p style={{ color: "#666", lineHeight: 1.6 }}>
            Welcome to {storeData.storeName}! We offer high-quality products with excellent customer service.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <strong>Store ID:</strong> {storeData.tenantId}
            </div>
            <div>
              <strong>Contact:</strong> {storeData.email}
            </div>
            <div>
              <strong>Products:</strong> {products.length} items
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 style={{ margin: "0 0 30px 0", color: "#333" }}>Our Products</h2>
          {products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "3em", marginBottom: "20px" }}>📦</div>
              <h3 style={{ color: "#666", margin: "0 0 10px 0" }}>No products available</h3>
              <p style={{ color: "#999" }}>This store hasn't added any products yet.</p>
              <button
                onClick={() => navigate("/marketplace")}
                style={{
                  marginTop: "20px",
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Browse Other Stores
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "30px" }}>
              {products.map((product) => (
                <div
                  key={product.productId}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "250px",
                        background: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: "1.2em",
                      }}
                    >
                      📷 No Image
                    </div>
                  )}
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>{product.name}</h3>
                    <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px", lineHeight: 1.5 }}>
                      {product.description?.substring(0, 120)}
                      {product.description?.length > 120 ? "..." : ""}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                      <span style={{ fontSize: "1.5em", fontWeight: "bold", color: "#28a745" }}>${product.price}</span>
                      <span style={{ fontSize: "0.9em", fontWeight: "bold", color: product.stock > 0 ? "#28a745" : "#dc3545" }}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: product.stock > 0 ? "#007bff" : "#6c757d",
                        color: "white",
                        border: "none",
                        cursor: product.stock > 0 ? "pointer" : "not-allowed",
                        borderRadius: "6px",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicStore;