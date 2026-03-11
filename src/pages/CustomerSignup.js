import { useState } from "react";
import { createUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/auth";

function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
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

    console.log("Submitting customer registration:", form.name, form.email);

    try {
      // Create customer with credentials
      const customerData = {
        ...form,
        userId: "CUST" + Date.now()
      };

      console.log("Creating customer with data:", customerData);
      const response = await createUser(customerData);
      console.log("Registration response:", response);
      
      // Auto-login after successful registration
      login("USER");
      localStorage.setItem("userId", response.userId);
      localStorage.setItem("customerName", form.name);
      
      alert("Customer registered successfully!");
      navigate("/user");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h2>Customer Registration</h2>
      <p>Create your account to start shopping</p>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
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
          <label>Phone (Optional):</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
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
          {loading ? "Registering..." : "Register Account"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}

export default CustomerSignup;