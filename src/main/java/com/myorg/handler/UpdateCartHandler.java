package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import java.util.*;

public class UpdateCartHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("CARTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            Map<String, Object> body = mapper.readValue(request.getBody(), Map.class);
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) body.get("items");

            String userId = request.getPathParameters().get("userId");
            String tenantId = request.getPathParameters().get("tenantId");
            context.getLogger().log("Updating cart for userId=" + userId + " tenantId=" + tenantId + " items count=" + itemsList.size());

            // Calculate totalAmount
            double totalAmount = 0.0;
            for (Map<String, Object> cartItem : itemsList) {
                Map<String, Object> product = (Map<String, Object>) cartItem.get("product");
                if (product != null) {
                    Object priceObj = product.get("price");
                    double price = priceObj instanceof Number ? ((Number) priceObj).doubleValue() : Double.parseDouble(priceObj.toString());
                    Integer quantity = (Integer) cartItem.get("quantity");
                    totalAmount += price * (quantity != null ? quantity : 1);
                }
            }

            Map<String, AttributeValue> keyItem = new HashMap<>();
            keyItem.put("userId", AttributeValue.builder().s(userId).build());
            keyItem.put("tenantId", AttributeValue.builder().s(tenantId).build());

            Map<String, AttributeValue> dynamoItem = new HashMap<>();
            dynamoItem.put("userId", AttributeValue.builder().s(userId).build());
            dynamoItem.put("tenantId", AttributeValue.builder().s(tenantId).build());
            dynamoItem.put("items", AttributeValue.builder().s(mapper.writeValueAsString(itemsList)).build());
            dynamoItem.put("totalAmount", AttributeValue.builder().n(String.valueOf(totalAmount)).build());
            dynamoItem.put("updatedAt", AttributeValue.builder().s(java.time.Instant.now().toString()).build());

            dynamoDb.putItem(PutItemRequest.builder()
                    .tableName(tableName)
                    .item(dynamoItem)
                    .build());

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody("{\"message\":\"Cart updated successfully\", \"totalAmount\": " + totalAmount + "}");

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
