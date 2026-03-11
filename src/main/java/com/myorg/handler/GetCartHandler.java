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

public class GetCartHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("CARTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String userId = request.getPathParameters().get("userId");
            String tenantId = request.getPathParameters().get("tenantId");

            // Debug logs
            context.getLogger().log("CARTS_TABLE env var = " + tableName);
            context.getLogger().log("Fetching cart for userId=" + userId + " tenantId=" + tenantId);

            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());
            key.put("tenantId", AttributeValue.builder().s(tenantId).build());

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
                        .withBody("{\"error\":\"Cart not found\"}");
            }

            Map<String, Object> cartData = new HashMap<>();
            response.item().forEach((k, v) -> {
                if (v.s() != null) {
                    cartData.put(k, v.s());
                } else if (v.n() != null) {
                    cartData.put(k, v.n());
                } else if (v.bool() != null) {
                    cartData.put(k, v.bool());
                }
            });

            String jsonResponse = mapper.writeValueAsString(cartData);

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