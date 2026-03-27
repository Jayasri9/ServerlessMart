import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/auth";

function UserLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  // Shared styles for form fields
  const fieldContainer = { display: "flex", alignItems: "center", gap: "10px" };
  const labelStyle = { width: "120px", fontWeight: "bold", display: "inline-block" };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("Please fill in all fields");
      return;
    }

    console.log("=== USER LOGIN DEBUG ===");
    console.log("Email:", trimmedEmail);
    console.log("Password:", trimmedPassword);

    try {
      const apiUrl = `https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/auth/users/${trimmedEmail}`;
      console.log("Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          password: trimmedPassword
        })
      });

      if (response.ok) {
        const user = await response.json();

        console.log("✅ Login successful! JWT token received:", user.token ? "✓" : "✗");
        
        // Login with JWT token
        login("USER", user.userId || user.email, user.token);
        localStorage.setItem("userEmail", trimmedEmail);
        localStorage.setItem("userName", user.name || "User");
        localStorage.setItem("userId", user.userId || user.email);

        alert(`Welcome back, ${user.name || "User"}!`);
        navigate("/user");
        
      } else if (response.status === 401) {
        console.log("❌ Invalid password");
        alert("Invalid password. Please try again.");
      } else if (response.status === 404) {
        console.log("❌ User not found");
        alert("User not found. Please check your email or register first.");
      } else {
        console.log("❌ API error:", response.status);
        let errorData;
        try { errorData = await response.json(); } 
        catch { errorData = { error: "Unknown error" }; }
        alert(`Login failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>User Login</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 }}
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
          Login
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>Don't have an account? 
          <button
            onClick={() => navigate("/user-signup")}
            style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
          >
            Register here
          </button>
        </p>
        <p style={{ marginTop: "10px" }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", textDecoration: "underline" }}
          >
            Back to Home
          </button>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;