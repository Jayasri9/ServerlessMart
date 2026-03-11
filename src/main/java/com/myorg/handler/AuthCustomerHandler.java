package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.HashMap;
import java.util.Map;

public class AuthCustomerHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("USERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            String email = request.getPathParameters().get("email");
            context.getLogger().log("Authenticating customer with email: " + email);

            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(email).build());

            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build();

            var response = dynamoDb.getItem(getItemRequest);

            if (response.item() == null || response.item().isEmpty()) {
                return new APIGatewayProxyResponseEvent()
                        .withStatusCode(404)
                        .withHeaders(Map.of(
                                "Content-Type", "application/json",
                                "Access-Control-Allow-Origin", "*"
                        ))
                        .withBody("{\"error\":\"Customer not found\"}");
            }

            Map<String, Object> customerData = new HashMap<>();
            response.item().forEach((k, v) -> {
                if (v.s() != null) {
                    customerData.put(k, v.s());
                } else if (v.n() != null) {
                    customerData.put(k, v.n());
                } else if (v.bool() != null) {
                    customerData.put(k, v.bool());
                }
            });

            String jsonResponse = mapper.writeValueAsString(customerData);

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