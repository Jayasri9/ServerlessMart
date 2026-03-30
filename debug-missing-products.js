const https = require('https');

const API_BASE = "https://apbxv61325.execute-api.ap-south-1.amazonaws.com/prod";

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function debugProducts() {
  try {
    console.log("=== API PRODUCTS DEBUG ===");
    
    // Get all products from API
    const allProducts = await makeRequest(`${API_BASE}/products`);
    
    console.log(`Total products returned by API: ${allProducts.length}`);
    
    // Filter for Home_Center
    const homeCenterProducts = allProducts.filter(p => p.tenantId === "Home_Center");
    console.log(`Home_Center products returned by API: ${homeCenterProducts.length}`);
    
    console.log("\n=== PRODUCTS RETURNED BY API ===");
    homeCenterProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productId} - ${product.name} - ₹${product.price} - Stock: ${product.stock}`);
    });
    
    // Expected products based on DynamoDB screenshot
    const expectedProductIds = [
      "P1774849801440", // Breakfast set
      "P1774849831592", // Table  
      "P1774849497544", // Decors
      "P1774849655648", // Pantry organisers
      "P1774849695031", // Pots
      // Add more IDs from your DynamoDB screenshot
    ];
    
    console.log("\n=== MISSING PRODUCTS ANALYSIS ===");
    const missingProducts = expectedProductIds.filter(id => 
      !homeCenterProducts.some(p => p.productId === id)
    );
    
    if (missingProducts.length > 0) {
      console.log("Missing product IDs:", missingProducts);
      console.log("These products exist in DynamoDB but not returned by API");
    } else {
      console.log("All expected products are returned by API");
    }
    
    // Check other tenants
    const tenants = [...new Set(allProducts.map(p => p.tenantId))];
    console.log("\n=== ALL TENANTS IN API ===");
    tenants.forEach(tenant => {
      const count = allProducts.filter(p => p.tenantId === tenant).length;
      console.log(`${tenant}: ${count} products`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugProducts();
