package com.myorg.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import java.util.Map;

public class AuthMiddleware {
    
    public static class AuthResult {
        private final boolean isValid;
        private final String userId;
        private final String role;
        private final APIGatewayProxyResponseEvent errorResponse;
        
        public AuthResult(boolean isValid, String userId, String role, APIGatewayProxyResponseEvent errorResponse) {
            this.isValid = isValid;
            this.userId = userId;
            this.role = role;
            this.errorResponse = errorResponse;
        }
        
        public boolean isValid() { return isValid; }
        public String getUserId() { return userId; }
        public String getRole() { return role; }
        public APIGatewayProxyResponseEvent getErrorResponse() { return errorResponse; }
    }
    
    public static AuthResult validateToken(APIGatewayProxyRequestEvent request) {
        try {
            // Extract token from Authorization header
            String authHeader = request.getHeaders().get("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new AuthResult(false, null, null, 
                    createErrorResponse(401, "Missing or invalid Authorization header"));
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Validate token
            if (!JWTUtil.validateToken(token)) {
                return new AuthResult(false, null, null, 
                    createErrorResponse(401, "Invalid or expired token"));
            }
            
            // Extract user info
            String userId = JWTUtil.extractUserId(token);
            String role = JWTUtil.extractRole(token);
            
            return new AuthResult(true, userId, role, null);
            
        } catch (Exception e) {
            return new AuthResult(false, null, null, 
                createErrorResponse(401, "Token validation failed: " + e.getMessage()));
        }
    }
    
    public static APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withHeaders(Map.of(
                        "Content-Type", "application/json",
                        "Access-Control-Allow-Origin", "*"
                ))
                .withBody("{\"error\":\"" + message + "\"}");
    }
    
    public static APIGatewayProxyResponseEvent createForbiddenResponse(String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(403)
                .withHeaders(Map.of(
                        "Content-Type", "application/json",
                        "Access-Control-Allow-Origin", "*"
                ))
                .withBody("{\"error\":\"" + message + "\"}");
    }
}
