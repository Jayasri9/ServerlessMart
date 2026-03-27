import { useState } from "react";
import { login } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function TenantLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tenantId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting tenant login with:", form.tenantId);
      
      // Send password in request body for validation
      const response = await fetch(`https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/auth/tenants/${form.tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: form.password
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid password. Please try again.");
        } else {
          setError("Login failed. Please try again.");
        }
        return;
      }
      
      const tenant = await response.json();
      console.log("Tenant found:", tenant);
      
      if (tenant.error) {
        setError("Tenant ID not found. Please check your tenant ID or register first.");
        return;
      }
      
      console.log("Login successful! JWT token received:", tenant.token ? "✓" : "✗");
      
      // Store tenant info and login with JWT token
      login("TENANT", form.tenantId, tenant.token);
      localStorage.setItem("tenantId", form.tenantId);
      localStorage.setItem("storeName", tenant.storeName || `Store ${form.tenantId}`);
      localStorage.setItem("tenantEmail", tenant.email || `${form.tenantId}@store.com`);
      
      alert(`Welcome back, ${tenant.storeName || `Store ${form.tenantId}`}!`);
      navigate("/tenant");
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your tenant ID and password, or register first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Tenant Login</h2>
      <p>Login to manage your store</p>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label>Tenant ID:</label>
          <input
            type="text"
            name="tenantId"
            value={form.tenantId}
            onChange={handleChange}
            placeholder="Enter your tenant ID"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>
          Don't have an account? <a href="/tenant-signup">Register here</a>
        </p>
        <p>
          <a href="/login">Back to main login</a>
        </p>
      </div>
    </div>
  );
}

export default TenantLogin;