package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.HashMap;
import java.util.Map;

public class GetUserByIdHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("USERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String userId = request.getPathParameters().get("userId");

            context.getLogger().log("USERS_TABLE env var = " + tableName);
            context.getLogger().log("Fetching user: " + userId);

            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());

            var response = dynamoDb.getItem(GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build());

            if (response.item() == null || response.item().isEmpty()) {
                return new APIGatewayProxyResponseEvent()
                        .withStatusCode(404)
                        .withHeaders(Map.of(
                                "Content-Type", "application/json",
                                "Access-Control-Allow-Origin", "*"
                        ))
                        .withBody("{\"error\":\"User not found\"}");
            }

            Map<String, Object> userData = new HashMap<>();
            response.item().forEach((k, v) -> {
                context.getLogger().log("Processing attribute: " + k + " = " + v);
                if (v.s() != null) {
                    userData.put(k, v.s());
                    context.getLogger().log("Added string attribute: " + k + " = " + v.s());
                } else if (v.n() != null) {
                    userData.put(k, v.n());
                    context.getLogger().log("Added number attribute: " + k + " = " + v.n());
                } else if (v.bool() != null) {
                    userData.put(k, v.bool());
                    context.getLogger().log("Added boolean attribute: " + k + " = " + v.bool());
                }
            });
            
            context.getLogger().log("Final userData map: " + userData.toString());

            // Remove password for security
            userData.remove("password");

            // Ensure address field exists (for backward compatibility)
            if (!userData.containsKey("address")) {
                userData.put("address", "");
            }

            String jsonResponse = mapper.writeValueAsString(userData);

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

