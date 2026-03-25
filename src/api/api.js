const API_BASE =
  "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod";

/* =======================
   PRODUCTS
   ======================= */

// GET products
export const getProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
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

  // make tenantId URL-safe
  const id = encodeURIComponent(tenantId);

  console.log("encoded tenantId for request:", id);

  const res = await fetch(`${API_BASE}/store/${id}/products`);
  if (!res.ok) throw new Error("Failed to fetch store products");
  return res.json();
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

// GET tenant by ID
export const getTenantById = async (tenantId) => {
  const res = await fetch(`${API_BASE}/tenants/${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error("Failed to fetch tenant");
  return res.json();
};
