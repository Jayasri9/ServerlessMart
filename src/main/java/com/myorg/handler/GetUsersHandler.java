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

public class GetUsersHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("USERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            context.getLogger().log("Getting all users");

            ScanRequest scanRequest = ScanRequest.builder()
                    .tableName(tableName)
                    .build();

            var response = dynamoDb.scan(scanRequest);
            
            List<Map<String, Object>> usersList = new ArrayList<>();
            
            for (Map<String, AttributeValue> item : response.items()) {
                Map<String, Object> userData = new HashMap<>();
                item.forEach((k, v) -> {
                    if (v.s() != null) {
                        userData.put(k, v.s());
                    } else if (v.n() != null) {
                        userData.put(k, v.n());
                    } else if (v.bool() != null) {
                        userData.put(k, v.bool());
                    }
                });
                // Remove password from response for security
                userData.remove("password");
                usersList.add(userData);
            }

            String jsonResponse = mapper.writeValueAsString(usersList);

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