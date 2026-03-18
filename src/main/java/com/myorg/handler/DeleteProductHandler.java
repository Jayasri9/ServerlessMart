package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DeleteProductHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("PRODUCTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            String productId = request.getPathParameters().get("productId");

            // Decode productId if URL encoded
            try {
                productId = java.net.URLDecoder.decode(productId, StandardCharsets.UTF_8);
            } catch (Exception e) {
                context.getLogger().log("Failed to decode productId, using raw: " + productId);
            }

            // Parse body for tenantId
            Map<String, Object> body;
            if (request.getBody() != null) {
                body = mapper.readValue(request.getBody(), Map.class);
            } else {
                body = new HashMap<>();
            }
            String tenantId = body.containsKey("tenantId") ? body.get("tenantId").toString() : null;

            if (tenantId == null) {
                return createErrorResponse(400, "tenantId required in request body");
            }

            context.getLogger().log("Attempting to delete productId: " + productId + " for tenant: " + tenantId);

            // First, get the item to verify ownership
            GetItemRequest getRequest = GetItemRequest.builder()
                    .tableName(tableName)
                    .key(Map.of(
                            "productId", AttributeValue.builder().s(productId).build()
                    ))
                    .build();

            var getResponse = dynamoDb.getItem(getRequest);

            if (getResponse.item().isEmpty()) {
                return createErrorResponse(404, "Product not found");
            }

            String itemTenantId = getResponse.item().get("tenantId").s();
            if (!tenantId.equals(itemTenantId)) {
                return createErrorResponse(403, "Unauthorized: Product does not belong to this tenant");
            }

            // Delete the item
            DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName(tableName)
                    .key(Map.of(
                            "productId", AttributeValue.builder().s(productId).build()
                    ))
                    .build();

            dynamoDb.deleteItem(deleteRequest);

            Map<String, Object> responseBody = Map.of(
                    "message", "Product deleted successfully",
                    "productId", productId,
                    "tenantId", tenantId
            );

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody(mapper.writeValueAsString(responseBody));

        } catch (Exception e) {
            context.getLogger().log("ERROR: " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse(500, e.getMessage());
        }
    }

    private APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String message) {
        try {
            Map<String, Object> errorBody = Map.of("error", message);
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(statusCode)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody(mapper.writeValueAsString(errorBody));
        } catch (Exception e) {
            return new APIGatewayProxyResponseEvent().withStatusCode(500).withBody("{\"error\":\"Internal server error\"}");
        }
    }
}
