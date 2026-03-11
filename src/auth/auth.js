export const login = (role, userId = null) => {
  console.log("=== AUTH LOGIN ===");
  console.log("Role:", role);
  console.log("UserId:", userId);

  localStorage.setItem("role", role);
  if (userId) {
    localStorage.setItem("userId", userId);
  }

  console.log("Auth completed. Current localStorage:", {
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId")
  });
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const logout = () => {
  // only clear authentication-related values; leave cart/tenant data intact
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");

  // cart + tenant data intentionally preserved
  window.location.href = "/login";
};