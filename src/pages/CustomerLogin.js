import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/auth";

function CustomerLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("CustomerLogin component mounted");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Attempting customer login with:", form.email);
    console.log("Password provided:", form.password ? "✓" : "✗");

    try {
      // Send password in request body for validation
      const response = await fetch(`https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/auth/users/${form.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: form.password
        })
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        console.error("API response not OK:", response.status);
        if (response.status === 401) {
          setError("Invalid password. Please try again.");
        } else {
          setError("Email not found. Please check your email or register first.");
        }
        return;
      }
      
      const customer = await response.json();
      console.log("Customer data received:", customer);
      
      if (customer.error) {
        console.error("Customer error:", customer.error);
        setError("Customer not found. Please check your email or register first.");
        return;
      }
      
      console.log("Login successful! JWT token received:", customer.token ? "✓" : "✗");
      
      // Login with JWT token
      login("USER", customer.userId, customer.token);
      localStorage.setItem("userId", customer.userId);
      localStorage.setItem("customerName", customer.name);
      localStorage.setItem("customerEmail", customer.email);
      navigate("/user");
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Customer Login</h2>
      <p>Login to your shopping account</p>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
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
            backgroundColor: loading ? "#ccc" : "#28a745",
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
          Don't have an account? <a href="/customer-signup">Register here</a>
        </p>
        <p>
          <a href="/login">Back to main login</a>
        </p>
      </div>
    </div>
  );
}

export default CustomerLogin;