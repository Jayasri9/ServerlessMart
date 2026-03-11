package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;

public class CreateProductHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final DynamoDbClient dynamoDb = DynamoDbClient.create();

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        try {
            ObjectMapper mapper = new ObjectMapper();

            Object bodyObj = event.get("body");
            Map<String, Object> body;

            if (bodyObj instanceof String) {
                body = mapper.readValue((String) bodyObj, Map.class);
            } else {
                body = (Map<String, Object>) bodyObj;
            }

            String productId = body.containsKey("productId")
                    ? body.get("productId").toString()
                    : "P" + System.currentTimeMillis();

            String name = body.get("name").toString();

            String tenantId = body.containsKey("tenantId")
                    ? body.get("tenantId").toString()
                    : "default-tenant";

            Number price = (Number) body.get("price");
            Number stock = body.containsKey("stock") ? (Number) body.get("stock") : 0;
            String category = body.containsKey("category") ? body.get("category").toString() : "other";
            String imageUrl = body.containsKey("imageUrl") ? body.get("imageUrl").toString() : "";
            Boolean isActive = body.containsKey("isActive") ? (Boolean) body.get("isActive") : true;
            String description = body.containsKey("description") ? body.get("description").toString() : "";
            Number weight = body.containsKey("weight") ? (Number) body.get("weight") : 0.0;
            String brand = body.containsKey("brand") ? body.get("brand").toString() : "";
            String tags = body.containsKey("tags") ? body.get("tags").toString() : "";
            String createdAt = java.time.Instant.now().toString();

            String tableName = System.getenv("PRODUCTS_TABLE");
            context.getLogger().log("PRODUCTS_TABLE env value = " + tableName);

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("productId", AttributeValue.builder().s(productId).build());
            item.put("tenantId", AttributeValue.builder().s(tenantId).build());
            item.put("name", AttributeValue.builder().s(name).build());
            item.put("price", AttributeValue.builder().n(price.toString()).build());
            item.put("stock", AttributeValue.builder().n(stock.toString()).build());
            item.put("category", AttributeValue.builder().s(category).build());
            item.put("imageUrl", AttributeValue.builder().s(imageUrl).build());
            item.put("isActive", AttributeValue.builder().bool(isActive).build());
            item.put("createdAt", AttributeValue.builder().s(createdAt).build());
            item.put("description", AttributeValue.builder().s(description).build());
            item.put("weight", AttributeValue.builder().n(weight.toString()).build());
            item.put("brand", AttributeValue.builder().s(brand).build());
            item.put("tags", AttributeValue.builder().s(tags).build());

            dynamoDb.putItem(
                    PutItemRequest.builder()
                            .tableName(tableName)
                            .item(item)
                            .build()
            );

            return Map.of(
                    "statusCode", 200,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"message\":\"Product created successfully\"}"
            );

        } catch (Exception e) {
            context.getLogger().log("ERROR: " + e.getMessage());

            return Map.of(
                    "statusCode", 500,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"error\":\"" + e.getMessage() + "\"}"
            );
        }
    }
}