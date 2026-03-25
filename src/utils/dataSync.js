import { getCart } from '../api/api';

// Get user by ID - assume endpoint exists (test needed)
export const getUserById = async (userId) => {
  const res = await fetch(`https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod/auth/users/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  const user = await res.json();
  // Remove password for security
  const { password, ...safeUser } = user;
  return safeUser;
};

// Refresh cart: API first, parse items JSON
export const refreshCart = async (userId, tenantId = 'default-tenant', syncLocal = false) => {
  try {
    console.log("refreshCart called:", userId, tenantId, "syncLocal:", syncLocal);
    const cartData = await getCart(userId, tenantId);
    console.log("Raw cartData:", cartData);
    
    let items = [];
    if (cartData && cartData.items) {
      if (typeof cartData.items === 'string') {
        items = JSON.parse(cartData.items);
      } else if (Array.isArray(cartData.items)) {
        items = cartData.items;
      }
    }
    console.log("Parsed items:", items);
    if (syncLocal) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
    return items;
  } catch (err) {
    console.error('refreshCart ERROR:', err);
    if (syncLocal) {
      localStorage.setItem('cart', '[]');
    }
    return [];
  }
};

// Refresh profile: API first
export const refreshProfile = async (userId) => {
  try {
    const user = await getUserById(userId);
    const profile = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('userEmail', profile.email);
    return profile;
  } catch (err) {
    console.warn('Profile API failed:', err);
    return null;
  }
};

// Combined refresh
export const refreshUserData = async (userId, tenantId) => {
  const [cart, profile] = await Promise.all([
    refreshCart(userId, tenantId),
    refreshProfile(userId)
  ]);
  return { cart, profile };
};
