package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GetStoreProductsHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("PRODUCTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String tenantId = request.getPathParameters().get("tenantId");
            context.getLogger().log("Raw tenantId: " + tenantId);

            // Decode tenantId in case it is URL encoded
            try {
                tenantId = java.net.URLDecoder.decode(
                        tenantId,
                        java.nio.charset.StandardCharsets.UTF_8
                );
                context.getLogger().log("Decoded tenantId: " + tenantId);
            } catch (Exception e) {
                context.getLogger().log("Failed to decode tenantId, using raw value: " + tenantId);
            }

            // Use a Map to deduplicate by productId
            Map<String, Map<String, Object>> productMap = new HashMap<>();
            Map<String, AttributeValue> lastEvaluatedKey = null;
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

                for (Map<String, AttributeValue> item : response.items()) {
                    try {
                        String itemTenantId = item.get("tenantId").s();

                        if (tenantId.equals(itemTenantId)) {
                            // Only include active products
                            Boolean isActive = item.containsKey("isActive") ? item.get("isActive").bool() : true;
                            if (!isActive) {
                                continue;
                            }
                            
                            String productId = item.get("productId").s();
                            
                            // Skip if we already have this product
                            if (productMap.containsKey(productId)) {
                                continue;
                            }

                            Map<String, Object> productData = new HashMap<>();

                            item.forEach((k, v) -> {
                                if (v.s() != null) {
                                    productData.put(k, v.s());
                                } else if (v.n() != null) {
                                    productData.put(k, v.n());
                                } else if (v.bool() != null) {
                                    productData.put(k, v.bool());
                                }
                            });

                            productMap.put(productId, productData);
                        }
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
            List<Map<String, Object>> productsList = new ArrayList<>(productMap.values());
            context.getLogger().log("Total unique products for store " + tenantId + ": " + productsList.size());

            String jsonResponse = mapper.writeValueAsString(productsList);

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