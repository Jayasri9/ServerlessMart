import { useEffect, useState, useCallback } from "react";
import { addProduct, getProducts } from "../api/api";
import { logout, getRole } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";

function AddProduct() {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem("tenantId");
  const [products, setProducts] = useState([]);

  // Default form state
  const defaultForm = {
    name: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    description: "",
    weight: "",
    brand: "",
    tags: ""
  };
  const [form, setForm] = useState(defaultForm);

  // Redirect if not TENANT
  useEffect(() => {
    const role = getRole();
    if (role !== "TENANT") {
      navigate("/tenant-login");
    }
  }, [navigate]);

  // Load tenant products
  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      const tenantProducts = data.filter(p => p.tenantId === tenantId);
      setProducts(tenantProducts);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) loadProducts();
  }, [tenantId, loadProducts]);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageUpload = (imageUrl) => {
    setForm({ ...form, imageUrl });
  };

  // Add product
  const handleAdd = async () => {
    // Basic validation
    if (!form.name || !form.price || !form.stock || !form.category) {
      alert("Please fill in all required fields: Product Name, Price, Stock, and Category");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.stock) < 0 || Number(form.weight || 0) < 0) {
      alert("Price must be positive, stock and weight cannot be negative");
      return;
    }

    try {
      await addProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        weight: Number(form.weight) || 0.0,
        tenantId,
        isActive: true
      });

      alert("Product added successfully!");
      setForm(defaultForm);
      loadProducts();
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Failed to add product: " + err.message);
    }
  };

  const handleBack = () => navigate("/tenant");

  return (
    <div className="container" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>Add Product - {tenantId}</h2>
        <div>
          <button
            onClick={handleBack}
            style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={logout}
            style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        {/* Left Panel - Add Product */}
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>Add New Product</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Product Info */}
            <div>
              <div style={{ marginBottom: "15px" }}>
                <label>Product Name:</label>
                <input name="name" placeholder="Enter product name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Price (₹):</label>
                <input name="price" type="number" placeholder="0.00" value={form.price} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Stock Quantity:</label>
                <input name="stock" type="number" placeholder="0" value={form.stock} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Category:</label>
                <select name="category" value={form.category} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }}>
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverages</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="toys">Toys & Games</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Description:</label>
                <textarea name="description" placeholder="Detailed product description" value={form.description} onChange={handleChange} rows="3" style={{ width: "100%", padding: "8px", marginTop: "5px", resize: "vertical" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Weight (kg):</label>
                <input name="weight" type="number" step="0.1" placeholder="0.0" value={form.weight} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Brand:</label>
                <input name="brand" placeholder="e.g., Nike, Apple" value={form.brand} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tags (comma-separated):</label>
                <input name="tags" placeholder="e.g., trending, new, sale" value={form.tags} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
              </div>
            </div>

            {/* Product Image */}
            <div>
              <h4>Product Image</h4>
              <ImageUpload currentImage={form.imageUrl} onImageUpload={handleImageUpload} />
              {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ width: "100px", marginTop: "10px", borderRadius: "4px" }} />}
            </div>
          </div>

          <button
            onClick={handleAdd}
            style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "16px" }}
          >
            Add Product
          </button>
        </div>

        {/* Right Panel - Product List */}
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>Your Products ({products.length})</h3>
          {products.length === 0 ? (
            <p>No products added yet. Add your first product!</p>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {products.map((p) => (
                <div key={p.productId} style={{ padding: "10px", border: "1px solid #eee", marginBottom: "10px", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
                  <div style={{ fontWeight: "bold" }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    ₹{p.price} | Stock: {p.stock} | {p.category}
                  </div>
                  <div style={{ marginTop: "5px" }}>
                    <span style={{ padding: "2px 8px", backgroundColor: p.isActive ? "#d4edda" : "#f8d7da", color: p.isActive ? "#155724" : "#721c24", borderRadius: "12px", fontSize: "12px" }}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
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

export default AddProduct;