import { useState } from "react";
import { registerTenant } from "../api/api";
import { useNavigate } from "react-router-dom";

function TenantSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantId: "",
    email: "",
    password: "",
    storeName: "",
    subscriptionPlan: "basic"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await registerTenant(form);
      localStorage.setItem("tenantCreatedAt", new Date().toISOString());
      alert("Tenant registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Failed to register tenant. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h2>Tenant Registration</h2>
      <p>Register your store on Serverless Mart</p>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Store Name:</label>
          <input
            type="text"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
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
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Tenant ID (Unique identifier for your store):</label>
          <input
            type="text"
            name="tenantId"
            value={form.tenantId}
            onChange={handleChange}
            placeholder="e.g., my-store-123"
            required
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
            <option value="basic">Basic - Free</option>
            <option value="premium">Premium - $9.99/month</option>
            <option value="enterprise">Enterprise - $29.99/month</option>
          </select>
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
          {loading ? "Registering..." : "Register Store"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}

export default TenantSignup;