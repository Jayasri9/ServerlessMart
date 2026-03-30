const API_BASE =
  "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod";

/* =======================
   PRODUCTS
   ======================= */

// GET products
export const getProducts = async () => {
  const res = await fetch(`${API_BASE}/products`, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

// ADD product
export const addProduct = async (product) => {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to add product");
  }

  return res.json();
};

/* =======================
   USERS
   ======================= */

// CREATE user
export const createUser = async (user) => {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to create user");
  }

  return res.json();
};

// LOGIN user
export const loginUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to login user");
  }

  return res.json();
};

// UPDATE user
export const updateUser = async (userId, userData) => {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to update user");
  }

  return res.json();
};

/* =======================
   CART
   ======================= */

// ADD to cart
export const addToCart = async (cartItem) => {
  const res = await fetch(`${API_BASE}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cartItem),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to add to cart");
  }

  return res.json();
};

// GET cart
export const getCart = async (userId, tenantId) => {
  const res = await fetch(`${API_BASE}/cart/${userId}/${tenantId}`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

// UPDATE cart - PUT full items list
export const updateCart = async (userId, tenantId, items) => {
  const res = await fetch(`${API_BASE}/cart/${userId}/${tenantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to update cart");
  }
  return res.json();
};

// CLEAR cart - DELETE cart items
export const clearCart = async (userId, tenantId) => {
  const res = await fetch(`${API_BASE}/cart/${userId}/${tenantId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to clear cart");
  }
  return res.json();
};

/* =======================
   ORDERS
   ======================= */

// CREATE order
export const createOrder = async (order) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Failed to create order");
  }

  return res.json();
};

// GET orders
export const getOrders = async (userId = null) => {
  const url = userId ? `${API_BASE}/orders/${userId}` : `${API_BASE}/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

/* =======================
   MARKETPLACE
   ======================= */

// GET all stores
export const getStores = async () => {
  const res = await fetch(`${API_BASE}/stores`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};

// GET store products
export const getStoreProducts = async (tenantId) => {
  // debugging logs
  console.log("getStoreProducts called with tenantId:", tenantId);

  try {
    // First try the dedicated store endpoint
    const id = encodeURIComponent(tenantId);
    console.log("Trying store endpoint with encoded tenantId:", id);
    
    const res = await fetch(`${API_BASE}/store/${id}/products`);
    if (res.ok) {
      const data = await res.json();
      console.log("Store endpoint success, got products:", data);
      console.log("Product isActive status from store endpoint:", data.map(p => ({ id: p.productId, name: p.name, isActive: p.isActive })));
      return data;
    }
    
    // If store endpoint fails (403 auth error), fall back to public products endpoint
    console.log("Store endpoint failed, falling back to public products endpoint");
    const allProductsRes = await fetch(`${API_BASE}/products`, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    if (!allProductsRes.ok) throw new Error("Failed to fetch products");
    
    const allProducts = await allProductsRes.json();
    const filteredProducts = allProducts.filter(p => {
      // More robust filtering - handle different data types and potential issues
      const productTenantId = String(p.tenantId || '').trim();
      const currentTenantId = String(tenantId || '').trim();
      const match = productTenantId === currentTenantId;
      
      console.log(`Store filter - Product ${p.productId} (${p.name}):`);
      console.log(`  - Product tenantId: "${productTenantId}" (type: ${typeof p.tenantId})`);
      console.log(`  - Current tenantId: "${currentTenantId}"`);
      console.log(`  - Match: ${match}`);
      
      return match;
    });
    
    console.log(`Filtered ${allProducts.length} products for tenant ${tenantId}, got ${filteredProducts.length} products`);
    console.log("Product isActive status from fallback:", filteredProducts.map(p => ({ id: p.productId, name: p.name, isActive: p.isActive })));
    return filteredProducts;
  } catch (err) {
    console.error("getStoreProducts error:", err);
    throw err;
  }
};

// DELETE product
export const deleteProduct = async (productId, tenantId) => {
  const encodedProductId = encodeURIComponent(productId);
  const res = await fetch(`${API_BASE}/products/${encodedProductId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tenantId }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Delete error:", text);
    throw new Error("Failed to delete product");
  }
  return res.json();
};

// REGISTER tenant (Shop Owner)
export const registerTenant = async (tenant) => {
  const response = await fetch(`${API_BASE}/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tenant),
  });
  return response.json();
};

// GET tenants
export const getTenants = async () => {
  const response = await fetch(`${API_BASE}/tenants`);
  return response.json();
};

// GET logged-in tenant details
export const getTenant = async () => {
  const res = await fetch(`${API_BASE}/tenant`, {
    method: "GET",
    headers: {
      // Authorization: `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error("Failed to fetch tenant");

  return res.json();
};

// UPDATE product status (activate/deactivate)
export const updateProductStatus = async (productId, tenantId, isActive) => {
  const encodedProductId = encodeURIComponent(productId);
  const res = await fetch(`${API_BASE}/products/${encodedProductId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tenantId, isActive }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Update status error:", text);
    throw new Error("Failed to update product status");
  }
  return res.json();
};

// UPDATE all products status for a tenant (bulk activate/deactivate)
export const updateAllProductsStatus = async (tenantId, isActive) => {
  const res = await fetch(`${API_BASE}/products/bulk-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tenantId, isActive }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Bulk update status error:", text);
    throw new Error("Failed to update all products status");
  }
  return res.json();
};

// GET tenant by ID
export const getTenantById = async (tenantId) => {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error("Failed to fetch tenant");
  return res.json();
};
