package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CreateOrderHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("ORDERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            Map<String, Object> body = mapper.readValue(request.getBody(), Map.class);

            String orderId = "ORD" + UUID.randomUUID().toString().substring(0, 8);
            String userId = body.get("userId").toString();
            String tenantId = body.get("tenantId").toString();
            Object items = body.get("items");
            Number totalAmount = (Number) body.get("totalAmount");
String paymentId = body.containsKey("paymentId")
                    ? body.get("paymentId").toString()
                    : "PAY" + UUID.randomUUID().toString().substring(0, 8);

            Object customerInfoObj = body.get("customerInfo");
            String customerInfoJson = null;
            if (customerInfoObj != null) {
                try {
                    customerInfoJson = mapper.writeValueAsString(customerInfoObj);
                } catch (Exception e) {
                    context.getLogger().log("Failed to serialize customerInfo: " + e.getMessage());
                }
            }

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("orderId", AttributeValue.builder().s(orderId).build());
            item.put("userId", AttributeValue.builder().s(userId).build());
            item.put("tenantId", AttributeValue.builder().s(tenantId).build());
            item.put("items", AttributeValue.builder().s(mapper.writeValueAsString(items)).build());
            if (customerInfoJson != null) {
                item.put("customerInfo", AttributeValue.builder().s(customerInfoJson).build());
            }
            item.put("totalAmount", AttributeValue.builder().n(totalAmount.toString()).build());
            item.put("orderStatus", AttributeValue.builder().s("PENDING").build());
            item.put("paymentId", AttributeValue.builder().s(paymentId).build());
            item.put("createdAt", AttributeValue.builder().s(java.time.Instant.now().toString()).build());

            dynamoDb.putItem(PutItemRequest.builder()
                    .tableName(tableName)
                    .item(item)
                    .build());

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("orderStatus", "PENDING");
            response.put("message", "Order created successfully");

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(201)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody(mapper.writeValueAsString(response));

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