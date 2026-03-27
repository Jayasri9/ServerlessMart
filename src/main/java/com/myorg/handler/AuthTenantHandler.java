package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import org.mindrot.jbcrypt.BCrypt;
import com.myorg.util.JWTUtil;

import java.util.HashMap;
import java.util.Map;

public class AuthTenantHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("TENANTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            // Parse request body to get password
            Map<String, String> requestBody = mapper.readValue(request.getBody(), Map.class);
            String password = requestBody.get("password");
            
            String tenantId = request.getPathParameters().get("tenantId");
            context.getLogger().log("Authenticating tenant with ID: " + tenantId);

            Map<String, AttributeValue> key = new HashMap<>();
            key.put("tenantId", AttributeValue.builder().s(tenantId).build());

            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build();

            var response = dynamoDb.getItem(getItemRequest);

            if (response.item() == null || response.item().isEmpty()) {
                return new APIGatewayProxyResponseEvent()
                        .withStatusCode(404)
                        .withHeaders(Map.of(
                                "Content-Type", "application/json",
                                "Access-Control-Allow-Origin", "*"
                        ))
                        .withBody("{\"error\":\"Tenant not found\"}");
            }

            Map<String, Object> tenantData = new HashMap<>();
            response.item().forEach((k, v) -> {
                if (v.s() != null) {
                    tenantData.put(k, v.s());
                } else if (v.n() != null) {
                    tenantData.put(k, v.n());
                } else if (v.bool() != null) {
                    tenantData.put(k, v.bool());
                }
            });

            // Validate password
            String storedPassword = (String) tenantData.get("password");
            boolean passwordValid = false;
            
            if (storedPassword != null) {
                // Check if password is hashed (starts with $2a$, $2b$, etc.)
                if (storedPassword.startsWith("$2")) {
                    passwordValid = BCrypt.checkpw(password, storedPassword);
                } else {
                    // Legacy plain text password - for backward compatibility
                    passwordValid = password.equals(storedPassword);
                }
            }

            if (!passwordValid) {
                return new APIGatewayProxyResponseEvent()
                        .withStatusCode(401)
                        .withHeaders(Map.of(
                                "Content-Type", "application/json",
                                "Access-Control-Allow-Origin", "*"
                        ))
                        .withBody("{\"error\":\"Invalid password\"}");
            }

            // Generate JWT token
            String jwtToken = JWTUtil.generateToken(tenantId, "TENANT", tenantId);
            
            // Add token to response
            tenantData.put("token", jwtToken);
            tenantData.remove("password"); // Don't send password back to client

            String jsonResponse = mapper.writeValueAsString(tenantData);

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody(jsonResponse);

        } catch (Exception e) {
            context.getLogger().log("ERROR: " + e.getMessage());
            e.printStackTrace();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}