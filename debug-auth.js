// Debug script to test authentication flow
// Run this in browser console to test the API endpoints

const API_BASE = "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod";

// Test user registration
async function testUserRegistration() {
  console.log("=== Testing User Registration ===");
  
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "test123456",
    phone: "1234567890",
    address: "Test Address"
  };

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    console.log("Registration Response:", response.status, await response.json());
  } catch (error) {
    console.error("Registration Error:", error);
  }
}

// Test user login
async function testUserLogin() {
  console.log("=== Testing User Login ===");
  
  const loginData = {
    password: "test123456"
  };

  try {
    const response = await fetch(`${API_BASE}/auth/users/test@example.com`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    console.log("Login Response:", response.status, result);
    
    if (result.token) {
      console.log("✅ JWT Token received:", result.token.substring(0, 50) + "...");
    }
  } catch (error) {
    console.error("Login Error:", error);
  }
}

// Test tenant registration
async function testTenantRegistration() {
  console.log("=== Testing Tenant Registration ===");
  
  const tenantData = {
    tenantId: "test-tenant-123",
    email: "tenant@example.com",
    password: "tenant123456",
    storeName: "Test Store"
  };

  try {
    const response = await fetch(`${API_BASE}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });
    
    console.log("Registration Response:", response.status, await response.json());
  } catch (error) {
    console.error("Registration Error:", error);
  }
}

// Test tenant login
async function testTenantLogin() {
  console.log("=== Testing Tenant Login ===");
  
  const loginData = {
    password: "tenant123456"
  };

  try {
    const response = await fetch(`${API_BASE}/auth/tenants/test-tenant-123`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    console.log("Login Response:", response.status, result);
    
    if (result.token) {
      console.log("✅ JWT Token received:", result.token.substring(0, 50) + "...");
    }
  } catch (error) {
    console.error("Login Error:", error);
  }
}

// Run all tests
console.log("🧪 Running Authentication Tests...");
console.log("Make sure to clear any existing test users/tenants first!");

// Uncomment to run tests
// testUserRegistration();
// setTimeout(() => testUserLogin(), 2000);
// testTenantRegistration();
// setTimeout(() => testTenantLogin(), 2000);
