import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1 style={{ marginBottom: "40px", color: "#333" }}>Serverless Mart</h1>
      <p style={{ marginBottom: "30px", color: "#666", fontSize: "18px" }}>
        Multitenant E-commerce Platform
      </p>
      
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px"
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            width: "280px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}
        >
          <h3>Tenant (Store Owner)</h3>
          <p style={{ marginBottom: "15px", color: "#666" }}>
            Manage your store, products, and inventory
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/tenant-signup")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/tenant-login")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1e7e34"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
            >
              Login
            </button>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            width: "280px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}
        >
          <h3>User (Shopper)</h3>
          <p style={{ marginBottom: "15px", color: "#666" }}>
            Browse products from multiple stores
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/user-signup")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#117a8b"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#17a2b8"}
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/user-login")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "0.3s",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#5a6268"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;