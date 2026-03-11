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

public class GetStoresHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final ObjectMapper mapper = new ObjectMapper();
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String tableName = System.getenv("TENANTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            context.getLogger().log("Getting all stores");

            ScanRequest scanRequest = ScanRequest.builder()
                    .tableName(tableName)
                    .build();

            var response = dynamoDb.scan(scanRequest);
            
            List<Map<String, Object>> storesList = new ArrayList<>();
            
            for (Map<String, AttributeValue> item : response.items()) {
                Map<String, Object> storeData = new HashMap<>();
                item.forEach((k, v) -> {
                    if (v.s() != null) {
                        storeData.put(k, v.s());
                    } else if (v.n() != null) {
                        storeData.put(k, v.n());
                    } else if (v.bool() != null) {
                        storeData.put(k, v.bool());
                    }
                });

                // Remove password from response
                storeData.remove("password");

                storesList.add(storeData);
            }

            String jsonResponse = mapper.writeValueAsString(storesList);

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