import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/api";
import { getRole, logout } from "../auth/auth";

function UserDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantDetails, setTenantDetails] = useState({});
  // map tenantId -> total product count (unfiltered)
  const [storeCounts, setStoreCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    
    const loadData = async () => {
      try {
        // Fetch products
        const productsData = await getProducts();
        console.log("All products:", productsData);
        
        // Fetch tenant details
        const tenantsResponse = await fetch("https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/tenants");
        let tenantsData = [];
        
        if (tenantsResponse.ok) {
          tenantsData = await tenantsResponse.json();
          console.log("All tenants:", tenantsData);
          
          // Create tenant details map
          const tenantMap = {};
          tenantsData.forEach(tenant => {
            tenantMap[tenant.tenantId] = tenant;
          });
          setTenantDetails(tenantMap);
        }
        
        // Extract unique tenants from products
        const uniqueTenants = [...new Set(productsData.map(p => p.tenantId))];
        setTenants(uniqueTenants);

        // compute raw counts by tenant (before any UI filtering)
        const counts = {};
        productsData.forEach(p => {
          counts[p.tenantId] = (counts[p.tenantId] || 0) + 1;
        });
        setStoreCounts(counts);
        
        // Filter products
        let filteredProducts = productsData;
        if (selectedCategory !== "all") {
          filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setProducts(filteredProducts);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Failed to load cart items:", err);
      }
    };

    loadData();
    loadCartItems();
  }, [navigate, searchTerm, selectedCategory]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const handleViewProducts = (tenantId) => {
    // user should go to the public store page, not the tenant admin route
    navigate(`/store/${tenantId}`);
  };

  const handleAddToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = currentCart.find(
      item => item.productId === product.productId && item.tenantId === product.tenantId
    );
    
    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += 1;
    } else {
      // Add new item with quantity 1
      currentCart.push({
        ...product,
        tenantId: product.tenantId,
        quantity: 1
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(currentCart));
    alert(`${product.name} added to cart!`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading marketplace...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Marketplace ({products.length} products)</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/cart")}
            style={{
              padding: "8px 16px",
              backgroundColor: cartItems.length > 0 ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              position: "relative"
            }}
          >
            🛒 Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </button>
          <button
            onClick={() => navigate("/orders")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            📦 My Orders
          </button>
          <button
            onClick={() => navigate("/profile")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            👤 Profile
          </button>
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
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h3>Search Products</h3>
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1, 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "4px" 
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "4px" 
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Stores */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Featured Stores</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
          {tenants.slice(0, 6).map(tenantId => {
            const tenant = tenantDetails[tenantId];
            return (
              <div
                key={tenantId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onClick={() => handleViewProducts(tenantId)}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h4 style={{ margin: "0 0 10px 0", color: "#007bff" }}>
                  {tenant ? tenant.storeName : `Store ${tenantId}`}
                </h4>
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                  {tenant
                    ? `${storeCounts[tenantId] || 0} products`
                    : "Browse products from this store"}
                </p>
                <p style={{ margin: "5px 0 0 0", color: "#999", fontSize: "12px" }}>
                  Owner: {tenant ? tenant.email : "Unknown"}
                </p>
              </div>
            );
          })}
        </div>
        {tenants.length > 6 && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => navigate("/all-stores")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              View All {tenants.length} Stores
            </button>
          </div>
        )}
      </div>

      {/* All Products */}
      <div>
        <h3>All Products ({products.length})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {products.map(product => (
            <div
              key={product.productId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "white"
              }}
            >
              {/* Product Image */}
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "150px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666"
                  }}>
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>{product.name}</h4>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0" }}>
                  {product.description ? `${product.description.substring(0, 100)}...` : "No description available"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>
                    ₹{product.price}
                  </span>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Store: {tenantDetails[product.tenantId]?.storeName || product.tenantId}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => navigate(`/store/${product.tenantId}`)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  View Store
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px"
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

