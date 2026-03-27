package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.myorg.util.PasswordMigrationUtil;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.Map;

public class PasswordMigrationHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent request,
            Context context) {

        try {
            // Get table names from environment variables
            String usersTable = System.getenv("USERS_TABLE");
            String tenantsTable = System.getenv("TENANTS_TABLE");
            
            if (usersTable == null || tenantsTable == null) {
                return new APIGatewayProxyResponseEvent()
                        .withStatusCode(500)
                        .withHeaders(Map.of(
                                "Content-Type", "application/json",
                                "Access-Control-Allow-Origin", "*"
                        ))
                        .withBody("{\"error\":\"Missing table names in environment variables\"}");
            }
            
            // Initialize migration utility
            PasswordMigrationUtil migrationUtil = new PasswordMigrationUtil(
                DynamoDbClient.create(), 
                usersTable, 
                tenantsTable
            );
            
            // Run migration
            migrationUtil.migrateAllPasswords();
            
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody("{\"message\":\"Password migration completed successfully\"}");

        } catch (Exception e) {
            context.getLogger().log("ERROR: " + e.getMessage());
            e.printStackTrace();

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withHeaders(Map.of(
                            "Content-Type", "application/json",
                            "Access-Control-Allow-Origin", "*"
                    ))
                    .withBody("{\"error\":\"Migration failed: " + e.getMessage() + "\"}");
        }
    }
}
