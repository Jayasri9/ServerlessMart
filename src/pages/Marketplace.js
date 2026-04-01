import { useEffect, useState } from "react";
import { getStores, getStoreProducts, updateCart } from "../api/api";
import { refreshCart } from "../utils/dataSync";
import { getRole } from "../auth/auth";

function Marketplace() {
  const [stores, setStores] = useState([]);
  const [storeCounts, setStoreCounts] = useState({});
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Marketplace component mounted");
    console.log("Current user ID:", localStorage.getItem("userId"));
    console.log("Current user role:", localStorage.getItem("role"));
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setError(null);
      const data = await getStores();
      setStores(data);

      data.forEach(store => {
        getStoreProducts(store.tenantId)
          .then(products => {
            // Filter out deactivated products for count
            const activeProducts = products.filter(p => p.isActive !== false);
            setStoreCounts(prev => ({ ...prev, [store.tenantId]: activeProducts.length }));
          })
          .catch(err => {
            console.error("Failed to fetch count for", store.tenantId, err);
            setStoreCounts(prev => ({ ...prev, [store.tenantId]: 0 }));
          });
      });

      if (data.length === 0) {
        setError("No stores available");
      }
    } catch (err) {
      setError("Failed to load stores: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = async (store) => {
    setSelectedStore(store);
    localStorage.setItem("currentTenantId", store.tenantId);
    try {
      const products = await getStoreProducts(store.tenantId);
      // Filter out deactivated products (only show active products to users)
      const activeProducts = products.filter(p => p.isActive !== false);
      setStoreProducts(activeProducts);
    } catch (err) {
      setStoreProducts([]);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId")
        || localStorage.getItem("currentTenantId")
        || "default-tenant";
      
      if (!userId) {
        alert("Please login to add items to cart");
        return;
      }

      // Get current cart from DynamoDB
      const currentCart = await refreshCart(userId, tenantId, false);
      const existingItem = currentCart.find(
        item => item.productId === product.productId && item.tenantId === product.tenantId
      );
      
      let updatedCart;
      if (existingItem) {
        // Update quantity if item already exists
        updatedCart = currentCart.map(item => 
          item.productId === product.productId && item.tenantId === product.tenantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        updatedCart = [...currentCart, {
          ...product,
          tenantId: product.tenantId,
          quantity: 1
        }];
      }
      
      // Save to DynamoDB
      await updateCart(userId, tenantId, updatedCart);
      
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleBack = () => {
    setSelectedStore(null);
    setStoreProducts([]);
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading marketplace...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Error</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={loadStores} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>{selectedStore ? `${selectedStore.storeName} - Products` : "Marketplace"}</h2>
        {selectedStore && (
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
            ← Back to Stores
          </button>
        )}
      </div>

      {!selectedStore ? (
        <div>
          <h3>Browse Stores</h3>
          {stores.length === 0 ? (
            <p>No stores available yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {stores.map((store) => (
                <div
                  key={store.tenantId}
                  onClick={() => handleStoreClick(store)}
                  style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                >
                  <h4>{store.storeName}</h4>
                  <p style={{ color: "#666", margin: "10px 0" }}>
                    <strong>Store ID:</strong> {store.tenantId}
                  </p>
                  <p style={{ color: "#666", margin: "10px 0" }}>
                    <strong>Email:</strong> {store.email}
                  </p>
                  <p style={{ color: "#666", margin: "10px 0" }}>
                    <strong>Active Products:</strong> {storeCounts[store.tenantId] ?? 0} item{storeCounts[store.tenantId] === 1 ? "" : "s"}
                  </p>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Browse Products
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <h4>{selectedStore.storeName}</h4>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Store ID:</strong> {selectedStore.tenantId}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Email:</strong> {selectedStore.email}
            </p>
          </div>

          <h3>Products ({storeProducts.length})</h3>
          {storeProducts.length === 0 ? (
            <p>No products available in this store yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
              {storeProducts.map((product) => (
                <div
                  key={product.productId}
                  style={{
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "#fff"
                  }}
                >
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginBottom: "10px"
                    }}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"; }}
                  />
                  <h4>{product.name}</h4>
                  <p style={{ color: "#666", fontSize: "14px", margin: "5px 0" }}>
                    {product.category}
                  </p>
                  <p style={{ fontWeight: "bold", color: "#28a745", margin: "10px 0" }}>
                    ₹{product.price}
                  </p>
                  <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                    Stock: {product.stock}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px"
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Marketplace;