import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";

// Background image for hero section
const bgImage = process.env.PUBLIC_URL + "/MP_FP.png";

function Home() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    // Get store information if logged in as tenant
    const role = getRole();
    if (role === "TENANT") {
      const storedStoreName = localStorage.getItem("storeName");
      setStoreName(storedStoreName || "Your Store");
    }
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "80px 20px",
          color: "white",
          textAlign: "left",
        }}
      >
        {storeName ? (
          <button onClick={() => navigate("/tenant-dashboard")}>Manage Products</button>
        ) : (
          <div className="role-select" style={{ display: "flex", justifyContent: "flex-start", gap: "20px", marginTop: "60px" }}>
            <div
              className="role-card"
              onClick={() => navigate("/user-login")}
              style={{
                padding: "20px",
                backgroundColor: "white",
                color: "#333",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <h3>User</h3>
            </div>
            <div
              className="role-card"
              onClick={() => navigate("/tenant-login")}
              style={{
                padding: "20px",
                backgroundColor: "white",
                color: "#333",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <h3>Tenant</h3>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Home;

