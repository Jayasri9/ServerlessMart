package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateAllProductsStatusHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        try {
            String tableName = System.getenv("PRODUCTS_TABLE");
            
            // Extract request body
            Map<String, Object> body = mapper.readValue((String) event.get("body"), Map.class);
            String tenantId = (String) body.get("tenantId");
            Boolean isActive = (Boolean) body.get("isActive");

            // Validate input
            if (tenantId == null || isActive == null) {
                return Map.of(
                    "statusCode", 400,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"error\":\"Missing required parameters: tenantId, isActive\"}"
                );
            }

            // Scan all products for the tenant
            ScanResponse scanResponse = dynamoDb.scan(
                ScanRequest.builder()
                    .tableName(tableName)
                    .filterExpression("tenantId = :tenantId")
                    .expressionAttributeValues(Map.of(
                        ":tenantId", AttributeValue.fromS(tenantId)
                    ))
                    .build()
            );

            List<String> updatedProducts = new ArrayList<>();
            List<String> failedProducts = new ArrayList<>();

            // Update each product
            for (Map<String, AttributeValue> item : scanResponse.items()) {
                String productId = item.get("productId").s();
                
                try {
                    dynamoDb.updateItem(
                        UpdateItemRequest.builder()
                            .tableName(tableName)
                            .key(Map.of(
                                "productId", AttributeValue.fromS(productId)
                            ))
                            .updateExpression("SET isActive = :isActive")
                            .expressionAttributeValues(Map.of(
                                ":isActive", AttributeValue.fromBool(isActive)
                            ))
                            .build()
                    );
                    updatedProducts.add(productId);
                } catch (Exception e) {
                    context.getLogger().log("Failed to update product " + productId + ": " + e.getMessage());
                    failedProducts.add(productId);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk update completed");
            response.put("tenantId", tenantId);
            response.put("isActive", isActive);
            response.put("updatedCount", updatedProducts.size());
            response.put("failedCount", failedProducts.size());
            
            if (!failedProducts.isEmpty()) {
                response.put("failedProducts", failedProducts);
            }

            return Map.of(
                "statusCode", failedProducts.isEmpty() ? 200 : 207, // 207 Multi-Status for partial success
                "headers", Map.of(
                    "Access-Control-Allow-Origin", "*",
                    "Access-Control-Allow-Headers", "*"
                ),
                "body", mapper.writeValueAsString(response)
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
