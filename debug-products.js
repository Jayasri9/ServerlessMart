// Debug script to test product creation and check for limits
// Run this in browser console to test the product endpoints

const API_BASE = "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod";

// Test product creation
async function testProductCreation() {
  console.log("=== Testing Product Creation ===");
  
  const testProduct = {
    name: `Test Product ${Date.now()}`,
    price: 99.99,
    stock: 10,
    category: "food",
    tenantId: "coffee", // Change this to your tenant ID
    isActive: true,
    description: "Test product for debugging",
    weight: 0.5,
    brand: "Test Brand",
    tags: "test,debug"
  };

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProduct)
    });
    
    const result = await response.json();
    console.log("Product Creation Response:", response.status, result);
  } catch (error) {
    console.error("Product Creation Error:", error);
  }
}

// Get all products for a tenant
async function getTenantProducts(tenantId = "coffee") {
  console.log(`=== Getting Products for Tenant: ${tenantId} ===`);
  
  try {
    const response = await fetch(`${API_BASE}/store/${tenantId}/products`);
    const products = await response.json();
    
    console.log(`Found ${products.length} products for tenant ${tenantId}:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product.productId})`);
    });
    
    return products;
  } catch (error) {
    console.error("Get Products Error:", error);
    return [];
  }
}

// Get all products in the system
async function getAllProducts() {
  console.log("=== Getting All Products ===");
  
  try {
    const response = await fetch(`${API_BASE}/products`);
    console.log("Raw response status:", response.status);
    const responseText = await response.text();
    console.log("Raw response text:", responseText);
    
    // Try to parse as JSON
    let products;
    try {
      products = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      return [];
    }
    
    // Handle API Gateway response format
    if (products.statusCode && products.body) {
      console.log("Detected API Gateway response format");
      products = JSON.parse(products.body);
    }
    
    if (!Array.isArray(products)) {
      console.error("Products is not an array:", typeof products, products);
      return [];
    }
    
    console.log(`Total products in system: ${products.length}`);
    
    // Group by tenant and check isActive status
    const tenantCounts = {};
    const tenantActiveCounts = {};
    
    products.forEach(product => {
      const tenantId = product.tenantId;
      if (!tenantCounts[tenantId]) {
        tenantCounts[tenantId] = 0;
        tenantActiveCounts[tenantId] = 0;
      }
      tenantCounts[tenantId]++;
      if (product.isActive === true) {
        tenantActiveCounts[tenantId]++;
      }
    });
    
    console.log("Products per tenant:", tenantCounts);
    console.log("Active products per tenant:", tenantActiveCounts);
    
    // Show detailed product info
    products.forEach(product => {
      console.log(`Product: ${product.name} | Tenant: ${product.tenantId} | Active: ${product.isActive}`);
    });
    
    return products;
  } catch (error) {
    console.error("Get All Products Error:", error);
    return [];
  }
}

// Check tenant details
async function getTenantDetails(tenantId = "coffee") {
  console.log(`=== Getting Tenant Details: ${tenantId} ===`);
  
  try {
    const response = await fetch(`${API_BASE}/tenants/${tenantId}`);
    const tenant = await response.json();
    
    console.log("Tenant details:", tenant);
    return tenant;
  } catch (error) {
    console.error("Get Tenant Error:", error);
    return null;
  }
}

// Run diagnostic
async function runProductDiagnostic() {
  console.log("🧪 Running Product Diagnostic...");
  
  // Get tenant details
  const tenant = await getTenantDetails("coffee");
  
  // Get all products
  const allProducts = await getAllProducts();
  
  // Get tenant products
  const tenantProducts = await getTenantProducts("coffee");
  
  // Try to create a new product
  await testProductCreation();
  
  // Check products again
  await getTenantProducts("coffee");
}

// Uncomment to run diagnostic
runProductDiagnostic();

// Individual test functions
// testProductCreation();
// getTenantProducts("coffee");
// getAllProducts();
// getTenantDetails("coffee");
