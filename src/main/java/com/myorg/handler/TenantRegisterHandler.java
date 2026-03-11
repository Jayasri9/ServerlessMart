package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TenantRegisterHandler implements RequestHandler<Map<String, Object>, Map<String, Object>> {

    private static final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private static final String TABLE_NAME = "EcommerceTable";

    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {

        // Read request body
        Map<String, String> body = (Map<String, String>) event.get("body");

        String tenantName = body.get("tenantName");
        String email = body.get("email");
        String plan = body.get("subscriptionPlan");

        String tenantId = "TENANT#" + UUID.randomUUID();

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("PK", AttributeValue.builder().s(tenantId).build());
        item.put("SK", AttributeValue.builder().s("META").build());
        item.put("tenantName", AttributeValue.builder().s(tenantName).build());
        item.put("email", AttributeValue.builder().s(email).build());
        item.put("subscriptionPlan", AttributeValue.builder().s(plan).build());

        dynamoDb.putItem(
                PutItemRequest.builder()
                        .tableName(TABLE_NAME)
                        .item(item)
                        .build()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("tenantId", tenantId);
        response.put("message", "Tenant registered successfully");

        return response;
    }
}