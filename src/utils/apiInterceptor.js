// API Interceptor for JWT token management
import { getAuthToken, isAuthenticated } from "../auth/auth";

// Store the original fetch function
const originalFetch = window.fetch;

// Override fetch to add JWT headers
window.fetch = function(url, options = {}) {
  // Only add JWT to API calls that need authentication
  if (shouldAddAuthHeader(url)) {
    const token = getAuthToken();
    
    if (token && isAuthenticated()) {
      // Clone the options object to avoid mutation
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': options.headers?.['Content-Type'] || 'application/json'
        }
      };
      
      console.log(`Adding JWT token to request: ${url}`);
      return originalFetch(url, newOptions);
    }
  }
  
  // For non-authenticated requests or when no token exists
  return originalFetch(url, options);
};

// Determine if a request needs authentication
function shouldAddAuthHeader(url) {
  // Don't add auth to login/signup endpoints
  const noAuthPatterns = [
    '/auth/users/',
    '/auth/tenants/',
    '/users/create',
    '/tenants/create',
    '/tenants/register'
  ];
  
  // Check if URL matches any no-auth pattern
  return !noAuthPatterns.some(pattern => url.includes(pattern));
}

// Export for testing or manual override
export { originalFetch };
