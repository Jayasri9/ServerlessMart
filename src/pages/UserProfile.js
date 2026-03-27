import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole } from "../auth/auth";
import { updateUser, getOrders } from "../api/api";
import { getUserById, refreshCart } from "../utils/dataSync";

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
  const [stats, setStats] = useState({
    totalOrders: 0,
    cartItems: 0
  });

  useEffect(() => {
    const role = getRole();
    if (role !== "USER") {
      navigate("/user-login");
      return;
    }
    loadProfile();
    loadStats();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      
      if (!userEmail && !userId) {
        console.error("No user email or ID found in localStorage");
        setProfile({
          name: "",
          email: "",
          phone: "",
          address: ""
        });
        return;
      }

      // Use email as userId since that's how the auth system works
      const lookupId = userEmail || userId;
      console.log("Fetching user data for:", lookupId);
      
      try {
        const userData = await getUserById(lookupId);
        console.log("User data received:", userData);
        
        if (userData) {
          const profileData = {
            name: userData.name || userName || "",
            email: userData.email || lookupId || "",
            phone: userData.phone || "",
            address: userData.address || ""
          };
          console.log("Setting profile:", profileData);
          setProfile(profileData);
        } else {
          console.error("No user data received");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        // Fallback to localStorage data
        setProfile({
          name: userName || "",
          email: userEmail || userId || "",
          phone: "",
          address: ""
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfile({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || localStorage.getItem("userId") || "",
        phone: "",
        address: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId") 
        || localStorage.getItem("currentTenantId") 
        || "default-tenant";

      console.log("Loading stats for userId:", userId, "tenantId:", tenantId);

      // Get orders count
      console.log("Fetching orders...");
      const orders = await getOrders(userId);
      const totalOrders = orders ? orders.length : 0;
      console.log("Orders fetched:", orders);

      // Get cart items count
      console.log("Fetching cart items...");
      const cartItems = await refreshCart(userId, tenantId, false);
      const cartItemsCount = cartItems ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
      console.log("Cart items fetched:", cartItems);

      setStats({
        totalOrders,
        cartItems: cartItemsCount
      });
      console.log("Stats set:", { totalOrders, cartItems: cartItemsCount });
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats({
        totalOrders: 0,
        cartItems: 0
      });
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        alert("User not found. Please login again.");
        return;
      }

      // Create a copy of current profile state to preserve it
      const currentProfile = { ...profile };
      
      // Update user data in DynamoDB
      await updateUser(userId, currentProfile);
      
      alert("Profile updated successfully!");
      setEditing(false);
      // Reload stats to reflect any changes
      await loadStats();
      // Don't reload profile - trust the local state which has the latest changes
      console.log("Profile saved successfully, keeping current state:", currentProfile);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile: " + err.message);
      // On error, reload the profile to restore original state
      await loadProfile();
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
              {stats.totalOrders}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Total Orders</div>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
              {stats.cartItems}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>Items in Cart</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;