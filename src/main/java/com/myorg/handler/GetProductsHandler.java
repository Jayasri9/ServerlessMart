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
            context.getLogger().log("Starting to scan table: " + tableName);

            // Use a Map to deduplicate by productId
            Map<String, Map<String, Object>> productMap = new HashMap<>();
            Map<String, software.amazon.awssdk.services.dynamodb.model.AttributeValue> lastEvaluatedKey = null;
            int scanCount = 0;
            
            do {
                scanCount++;
                ScanRequest.Builder scanBuilder = ScanRequest.builder()
                        .tableName(tableName)
                        .limit(50);
                
                if (lastEvaluatedKey != null) {
                    scanBuilder.exclusiveStartKey(lastEvaluatedKey);
                }
                
                ScanResponse response = dynamoDb.scan(scanBuilder.build());
                context.getLogger().log("Scan " + scanCount + ": got " + response.items().size() + " items");

                for (Map<String, software.amazon.awssdk.services.dynamodb.model.AttributeValue> item : response.items()) {
                    try {
                        String productId = item.get("productId").s();
                        
                        // Skip if we already have this product
                        if (productMap.containsKey(productId)) {
                            continue;
                        }
                        
                        Map<String, Object> product = new HashMap<>();
                        product.put("productId", productId);
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

                        productMap.put(productId, product);
                    } catch (Exception e) {
                        context.getLogger().log("Error processing product: " + e.getMessage());
                    }
                }
                
                lastEvaluatedKey = response.lastEvaluatedKey();
                
                // Safety limit
                if (scanCount > 10) {
                    context.getLogger().log("Safety limit reached");
                    break;
                }
                
            } while (lastEvaluatedKey != null);

            // Convert Map values to List
            List<Map<String, Object>> allProducts = new ArrayList<>(productMap.values());
            context.getLogger().log("Total unique products: " + allProducts.size());

            return Map.of(
                    "statusCode", 200,
                    "headers", Map.of(
                            "Access-Control-Allow-Origin", "*",
                            "Access-Control-Allow-Headers", "*",
                            "Content-Type", "application/json"
                    ),
                    "body", mapper.writeValueAsString(allProducts)
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