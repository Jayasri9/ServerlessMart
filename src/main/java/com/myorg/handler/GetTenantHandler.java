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

public class GetTenantHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("TENANTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String tenantId = request.getPathParameters().get("tenantId");
            context.getLogger().log("Getting tenant with ID: " + tenantId);

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

            // Note: Including password for authentication - in production, use proper auth with tokens/hashing
            // tenantData.remove("password");

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