package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AddToCartHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("CARTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            Map<String, Object> body = mapper.readValue(request.getBody(), Map.class);

            String userId = body.get("userId").toString();
            String tenantId = body.get("tenantId").toString();
            Map<String, Object> product = (Map<String, Object>) body.get("product");
            Integer quantity = Integer.parseInt(body.getOrDefault("quantity", 1).toString());

            context.getLogger().log("CARTS_TABLE env var = " + tableName);
            context.getLogger().log("Adding item for userId=" + userId + " tenantId=" + tenantId);

            double productPrice;
            Object priceObj = product.get("price");
            if (priceObj instanceof Number) {
                productPrice = ((Number) priceObj).doubleValue();
            } else {
                productPrice = Double.parseDouble(priceObj.toString());
            }

            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());
            key.put("tenantId", AttributeValue.builder().s(tenantId).build());

            var getItemResponse = dynamoDb.getItem(GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build());

            Map<String, AttributeValue> item;

            if (getItemResponse.item() == null || getItemResponse.item().isEmpty()) {

                item = new HashMap<>();
                item.put("userId", AttributeValue.builder().s(userId).build());
                item.put("tenantId", AttributeValue.builder().s(tenantId).build());

                List<Map<String, Object>> itemsList = new ArrayList<>();
                itemsList.add(Map.of(
                        "product", product,
                        "quantity", quantity
                ));

                item.put("items", AttributeValue.builder().s(mapper.writeValueAsString(itemsList)).build());
                item.put("totalAmount", AttributeValue.builder().n(
                        String.valueOf(productPrice * quantity)
                ).build());
                item.put("updatedAt", AttributeValue.builder().s(java.time.Instant.now().toString()).build());

                dynamoDb.putItem(PutItemRequest.builder()
                        .tableName(tableName)
                        .item(item)
                        .build());

            } else {

                item = getItemResponse.item();

                double currentTotal = item.containsKey("totalAmount")
                        ? Double.parseDouble(item.get("totalAmount").n())
                        : 0.0;

                double newTotal = currentTotal + (productPrice * quantity);

                List<Map<String, Object>> existingItems = new ArrayList<>();

                if (item.containsKey("items")) {
                    String itemsJson = item.get("items").s();
                    existingItems = mapper.readValue(itemsJson, List.class);
                }

                existingItems.add(Map.of("product", product, "quantity", quantity));

                Map<String, AttributeValue> expressionValues = new HashMap<>();
                expressionValues.put(":newTotal", AttributeValue.builder().n(String.valueOf(newTotal)).build());
                expressionValues.put(":now", AttributeValue.builder().s(java.time.Instant.now().toString()).build());
                expressionValues.put(":items", AttributeValue.builder().s(mapper.writeValueAsString(existingItems)).build());

                dynamoDb.updateItem(UpdateItemRequest.builder()
                        .tableName(tableName)
                        .key(key)
                        .updateExpression("SET totalAmount = :newTotal, updatedAt = :now, items = :items")
                        .expressionAttributeValues(expressionValues)
                        .build());
            }

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody("{\"message\":\"Item added to cart successfully\"}");

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