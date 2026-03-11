package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.*;

public class GetProductsHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        try {
            String tableName = System.getenv("PRODUCTS_TABLE");

            ScanResponse response = dynamoDb.scan(
                    ScanRequest.builder()
                            .tableName(tableName)
                            .build()
            );

            List<Map<String, Object>> products = new ArrayList<>();

            response.items().forEach(item -> {
                Map<String, Object> product = new HashMap<>();
                product.put("productId", item.get("productId").s());
                product.put("name", item.get("name").s());
                product.put("tenantId", item.get("tenantId").s());
                product.put("price", Double.parseDouble(item.get("price").n()));

                if (item.containsKey("stock")) {
                    product.put("stock", Integer.parseInt(item.get("stock").n()));
                }
                if (item.containsKey("category")) {
                    product.put("category", item.get("category").s());
                }
                if (item.containsKey("imageUrl")) {
                    product.put("imageUrl", item.get("imageUrl").s());
                }
                if (item.containsKey("isActive")) {
                    product.put("isActive", item.get("isActive").bool());
                }
                if (item.containsKey("createdAt")) {
                    product.put("createdAt", item.get("createdAt").s());
                }
                if (item.containsKey("description")) {
                    product.put("description", item.get("description").s());
                }
                if (item.containsKey("weight")) {
                    product.put("weight", Double.parseDouble(item.get("weight").n()));
                }
                if (item.containsKey("brand")) {
                    product.put("brand", item.get("brand").s());
                }
                if (item.containsKey("tags")) {
                    product.put("tags", item.get("tags").s());
                }

                products.add(product);
            });

            return Map.of(
                    "statusCode", 200,
                    "headers", Map.of(
                            "Access-Control-Allow-Origin", "*",
                            "Access-Control-Allow-Headers", "*"
                    ),
                    "body", mapper.writeValueAsString(products)
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