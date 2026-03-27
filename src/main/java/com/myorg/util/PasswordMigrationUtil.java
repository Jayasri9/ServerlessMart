package com.myorg.util;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import org.mindrot.jbcrypt.BCrypt;
import java.util.HashMap;
import java.util.Map;

public class PasswordMigrationUtil {
    
    private final DynamoDbClient dynamoDb;
    private final String usersTable;
    private final String tenantsTable;
    
    public PasswordMigrationUtil(DynamoDbClient dynamoDb, String usersTable, String tenantsTable) {
        this.dynamoDb = dynamoDb;
        this.usersTable = usersTable;
        this.tenantsTable = tenantsTable;
    }
    
    /**
     * Migrates plain text passwords to BCrypt hashes for all users
     * This should be run once to update existing passwords
     */
    public void migrateUserPasswords() {
        try {
            // Scan all users
            ScanRequest scanRequest = ScanRequest.builder()
                    .tableName(usersTable)
                    .build();
            
            ScanResponse scanResponse = dynamoDb.scan(scanRequest);
            
            for (Map<String, AttributeValue> item : scanResponse.items()) {
                String userId = item.get("userId").s();
                String password = item.get("password").s();
                
                // Check if password is already hashed (starts with $2a$, $2b$, etc.)
                if (password != null && !password.startsWith("$2")) {
                    // Hash the plain text password
                    String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
                    
                    // Update the user record
                    Map<String, AttributeValue> key = new HashMap<>();
                    key.put("userId", AttributeValue.builder().s(userId).build());
                    
                    Map<String, AttributeValueUpdate> updates = new HashMap<>();
                    updates.put("password", AttributeValueUpdate.builder()
                            .value(AttributeValue.builder().s(hashedPassword).build())
                            .action(AttributeAction.PUT)
                            .build());
                    
                    UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                            .tableName(usersTable)
                            .key(key)
                            .attributeUpdates(updates)
                            .build();
                    
                    dynamoDb.updateItem(updateRequest);
                    System.out.println("Migrated password for user: " + userId);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error migrating user passwords: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Migrates plain text passwords to BCrypt hashes for all tenants
     * This should be run once to update existing passwords
     */
    public void migrateTenantPasswords() {
        try {
            // Scan all tenants
            ScanRequest scanRequest = ScanRequest.builder()
                    .tableName(tenantsTable)
                    .build();
            
            ScanResponse scanResponse = dynamoDb.scan(scanRequest);
            
            for (Map<String, AttributeValue> item : scanResponse.items()) {
                String tenantId = item.get("tenantId").s();
                String password = item.get("password").s();
                
                // Check if password is already hashed (starts with $2a$, $2b$, etc.)
                if (password != null && !password.startsWith("$2")) {
                    // Hash the plain text password
                    String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
                    
                    // Update the tenant record
                    Map<String, AttributeValue> key = new HashMap<>();
                    key.put("tenantId", AttributeValue.builder().s(tenantId).build());
                    
                    Map<String, AttributeValueUpdate> updates = new HashMap<>();
                    updates.put("password", AttributeValueUpdate.builder()
                            .value(AttributeValue.builder().s(hashedPassword).build())
                            .action(AttributeAction.PUT)
                            .build());
                    
                    UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                            .tableName(tenantsTable)
                            .key(key)
                            .attributeUpdates(updates)
                            .build();
                    
                    dynamoDb.updateItem(updateRequest);
                    System.out.println("Migrated password for tenant: " + tenantId);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error migrating tenant passwords: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Run both migrations
     */
    public void migrateAllPasswords() {
        System.out.println("Starting password migration...");
        migrateUserPasswords();
        migrateTenantPasswords();
        System.out.println("Password migration completed.");
    }
}
