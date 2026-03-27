export const login = (role, userId = null, token = null) => {
  console.log("=== AUTH LOGIN ===");
  console.log("Role:", role);
  console.log("UserId:", userId);
  console.log("Token:", token ? "✓" : "✗");

  localStorage.setItem("role", role);
  if (userId) {
    localStorage.setItem("userId", userId);
  }
  if (token) {
    localStorage.setItem("jwtToken", token);
  }

  console.log("Auth completed. Current localStorage:", {
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId"),
    hasToken: !!localStorage.getItem("jwtToken")
  });
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const getAuthToken = () => {
  return localStorage.getItem("jwtToken");
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Basic JWT token validation (check expiration)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    console.error("Invalid JWT token:", e);
    return false;
  }
};

export const logout = () => {
  // Clear all authentication-related values
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("jwtToken");

  // cart + tenant data intentionally preserved
  window.location.href = "/login";
};