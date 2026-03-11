package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
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

            // Decode tenantId in case it is URL encoded
            try {
                tenantId = java.net.URLDecoder.decode(
                        tenantId,
                        java.nio.charset.StandardCharsets.UTF_8
                );
            } catch (Exception e) {
                context.getLogger().log("Failed to decode tenantId, using raw value: " + tenantId);
            }

            context.getLogger().log("Getting products for store (decoded): " + tenantId);

            ScanRequest scanRequest = ScanRequest.builder()
                    .tableName(tableName)
                    .build();

            var response = dynamoDb.scan(scanRequest);

            List<Map<String, Object>> productsList = new ArrayList<>();

            for (Map<String, AttributeValue> item : response.items()) {

                String itemTenantId = item.get("tenantId").s();

                if (tenantId.equals(itemTenantId)) {

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

                    productsList.add(productData);
                }
            }

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