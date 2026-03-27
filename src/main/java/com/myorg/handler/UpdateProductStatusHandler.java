package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemResponse;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;

import java.util.HashMap;
import java.util.Map;

public class UpdateProductStatusHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        try {
            String tableName = System.getenv("PRODUCTS_TABLE");
            
            // Extract path parameters
            Map<String, String> pathParameters = (Map<String, String>) event.get("pathParameters");
            String productId = pathParameters.get("productId");
            
            // Extract request body
            Map<String, Object> body = mapper.readValue((String) event.get("body"), Map.class);
            String tenantId = (String) body.get("tenantId");
            Boolean isActive = (Boolean) body.get("isActive");

            // Validate input
            if (productId == null || tenantId == null || isActive == null) {
                return Map.of(
                    "statusCode", 400,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"error\":\"Missing required parameters: productId, tenantId, isActive\"}"
                );
            }

            // First verify the product exists and belongs to the tenant
            GetItemResponse getResponse = dynamoDb.getItem(
                GetItemRequest.builder()
                    .tableName(tableName)
                    .key(Map.of(
                        "productId", AttributeValue.fromS(productId)
                    ))
                    .build()
            );

            if (!getResponse.hasItem()) {
                return Map.of(
                    "statusCode", 404,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"error\":\"Product not found\"}"
                );
            }

            String existingTenantId = getResponse.item().get("tenantId").s();
            if (!existingTenantId.equals(tenantId)) {
                return Map.of(
                    "statusCode", 403,
                    "headers", Map.of("Access-Control-Allow-Origin", "*"),
                    "body", "{\"error\":\"Product does not belong to this tenant\"}"
                );
            }

            // Update the product status
            UpdateItemResponse updateResponse = dynamoDb.updateItem(
                UpdateItemRequest.builder()
                    .tableName(tableName)
                    .key(Map.of(
                        "productId", AttributeValue.fromS(productId)
                    ))
                    .updateExpression("SET isActive = :isActive")
                    .expressionAttributeValues(Map.of(
                        ":isActive", AttributeValue.fromBool(isActive)
                    ))
                    .returnValues("ALL_NEW")
                    .build()
            );

            Map<String, Object> updatedProduct = new HashMap<>();
            updatedProduct.put("productId", updateResponse.attributes().get("productId").s());
            updatedProduct.put("name", updateResponse.attributes().get("name").s());
            updatedProduct.put("tenantId", updateResponse.attributes().get("tenantId").s());
            updatedProduct.put("price", Double.parseDouble(updateResponse.attributes().get("price").n()));
            updatedProduct.put("isActive", updateResponse.attributes().get("isActive").bool());

            if (updateResponse.attributes().containsKey("stock")) {
                updatedProduct.put("stock", Integer.parseInt(updateResponse.attributes().get("stock").n()));
            }
            if (updateResponse.attributes().containsKey("category")) {
                updatedProduct.put("category", updateResponse.attributes().get("category").s());
            }
            if (updateResponse.attributes().containsKey("imageUrl")) {
                updatedProduct.put("imageUrl", updateResponse.attributes().get("imageUrl").s());
            }
            if (updateResponse.attributes().containsKey("description")) {
                updatedProduct.put("description", updateResponse.attributes().get("description").s());
            }

            return Map.of(
                "statusCode", 200,
                "headers", Map.of(
                    "Access-Control-Allow-Origin", "*",
                    "Access-Control-Allow-Headers", "*"
                ),
                "body", mapper.writeValueAsString(Map.of(
                    "message", "Product status updated successfully",
                    "product", updatedProduct
                ))
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
