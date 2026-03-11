import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem("userProfile");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile({
          name: userName || "",
          email: userEmail || "",
          phone: "",
          address: ""
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      localStorage.setItem("userName", profile.name);
      localStorage.setItem("userEmail", profile.email);
      
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Profile</h2>
        <button
          onClick={() => navigate("/user")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "30px",
        backgroundColor: "white"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 20px 0", color: "#333" }}>Personal Information</h4>
          
          <div style={{ display: "grid", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: editing ? "1px solid #ddd" : "1px solid #eee",
                  borderRadius: "4px",
                  backgroundColor: editing ? "white" : "#f8f9fa"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: editing ? "1px solid #ddd" : "1px solid #eee",
                  borderRadius: "4px",
                  backgroundColor: editing ? "white" : "#f8f9fa"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your phone number"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: editing ? "1px solid #ddd" : "1px solid #eee",
                  borderRadius: "4px",
                  backgroundColor: editing ? "white" : "#f8f9fa"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Delivery Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your delivery address"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: editing ? "1px solid #ddd" : "1px solid #eee",
                  borderRadius: "4px",
                  backgroundColor: editing ? "white" : "#f8f9fa",
                  resize: "vertical"
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 20px",
                  backgroundColor: saving ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  borderRadius: "4px"
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "white",
        marginTop: "20px"
      }}>
        <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>Account Statistics</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}>
              {JSON.parse(localStorage.getItem("userOrders") || "[]").length}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Total Orders</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
              {JSON.parse(localStorage.getItem("cart") || "[]").reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Items in Cart</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;