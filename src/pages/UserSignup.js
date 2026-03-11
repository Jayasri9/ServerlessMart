import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/api";

function UserSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        createdAt: new Date().toISOString()
      };

      await createUser(userData);
      
      // Store in localStorage as backup
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      registeredUsers.push({ ...userData, userId: userData.email });
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
      
      alert("Registration successful! Please login.");
      navigate("/user-login");
    } catch (err) {
      alert("Registration failed: " + err.message);
      console.error(err);
    }
  };

  // Shared styles for form fields
  const fieldContainer = { display: "flex", alignItems: "center", gap: "10px" };
  const labelStyle = { width: "120px", fontWeight: "bold", display: "inline-block" };

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>User Registration</h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={fieldContainer}>
          <label style={labelStyle}>Full Name:</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
          />
        </div>

        <div style={fieldContainer}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
          />
        </div>

        <div style={fieldContainer}>
          <label style={labelStyle}>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
          />
        </div>

        <div style={fieldContainer}>
          <label style={labelStyle}>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
          />
        </div>

        <div style={fieldContainer}>
          <label style={labelStyle}>Phone (Optional):</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
          />
        </div>

        <div style={fieldContainer}>
          <label style={labelStyle}>Address (Optional):</label>
          <textarea
            name="address"
            placeholder="Enter your address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical", flex: 1 }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "16px"
          }}
        >
          Register
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Already have an account? 
          <button
            onClick={() => navigate("/user-login")}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default UserSignup;