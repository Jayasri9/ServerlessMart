package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GetOrdersHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("ORDERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String userId = request.getPathParameters() != null 
                ? request.getPathParameters().get("userId") 
                : null;

            ScanRequest.Builder scanBuilder = ScanRequest.builder()
                    .tableName(tableName);

            if (userId != null) {
                scanBuilder.filterExpression("userId = :userId");

                Map<String, AttributeValue> expressionValues = new HashMap<>();
                expressionValues.put(":userId", AttributeValue.builder().s(userId).build());

                scanBuilder.expressionAttributeValues(expressionValues);
            }

            ScanResponse response = dynamoDb.scan(scanBuilder.build());

            List<Map<String, Object>> orders = new ArrayList<>();

            for (Map<String, AttributeValue> item : response.items()) {

                Map<String, Object> order = new HashMap<>();

                item.forEach((key, value) -> {

                    if (value.s() != null) {

                        if (key.equals("items") || key.equals("customerInfo")) {
                            try {
                                order.put(key, mapper.readValue(value.s(), Object.class));
                            } catch (Exception e) {
                                order.put(key, value.s());
                            }
                        } else {
                            order.put(key, value.s());
                        }

                    } else if (value.n() != null) {
                        order.put(key, Double.parseDouble(value.n()));
                    } else if (value.bool() != null) {
                        order.put(key, value.bool());
                    }

                });

                orders.add(order);
            }

            String jsonResponse = mapper.writeValueAsString(orders);

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
                    .withBody("{\"error\":\"" + e.getMessage() + "\"});
        }
    }
}