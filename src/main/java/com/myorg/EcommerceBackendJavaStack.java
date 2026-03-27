package com.myorg;

import java.util.Map;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.CfnOutputProps;
import software.amazon.awscdk.Duration;

import software.constructs.Construct;

import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Runtime;

import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Cors;
import software.amazon.awscdk.services.apigateway.CorsOptions;

import software.amazon.awscdk.services.dynamodb.ITable;
import software.amazon.awscdk.services.dynamodb.Table;

public class EcommerceBackendJavaStack extends Stack {

    public EcommerceBackendJavaStack(
            final Construct scope,
            final String id,
            final StackProps props) {

        super(scope, id, props);

        // ------------------------
        // DynamoDB Tables (Use Existing)
        // ------------------------
        ITable usersTable = Table.fromTableName(this, "UsersTable", "UsersTableV2");
        ITable tenantsTable = Table.fromTableName(this, "TenantsTable", "TenantsTable");
        ITable productsTable = Table.fromTableName(this, "ProductsTable", "ProductsTable");
        ITable cartsTable = Table.fromTableName(this, "CartsTable", "CartsTableV2");
        ITable ordersTable = Table.fromTableName(this, "OrdersTable", "OrdersTable");
        ITable subscriptionsTable = Table.fromTableName(this, "SubscriptionsTable", "SubscriptionsTableV2");

        

        // ------------------------
        // PRODUCT LAMBDAS
        // ------------------------
        Function getProductsLambda = Function.Builder.create(this, "GetProductsLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetProductsHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function createProductLambda = Function.Builder.create(this, "CreateProductLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateProductHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // TENANT LAMBDAS
        // ------------------------
        Function getTenantsLambda = Function.Builder.create(this, "GetTenantsLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetTenantsHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getTenantLambda = Function.Builder.create(this, "GetTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function createTenantLambda = Function.Builder.create(this, "CreateTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // USER LAMBDAS
        // ------------------------
        Function createUserLambda = Function.Builder.create(this, "CreateUserLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateUserHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function authCustomerLambda = Function.Builder.create(this, "AuthCustomerLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.AuthCustomerHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of(
                    "USERS_TABLE", usersTable.getTableName(),
                    "JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production-min-32-chars"
                ))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function authTenantLambda = Function.Builder.create(this, "AuthTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.AuthTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of(
                    "TENANTS_TABLE", tenantsTable.getTableName(),
                    "JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production-min-32-chars"
                ))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Password Migration Lambda (for one-time migration)
        Function passwordMigrationLambda = Function.Builder.create(this, "PasswordMigrationLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.PasswordMigrationHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of(
                    "USERS_TABLE", usersTable.getTableName(),
                    "TENANTS_TABLE", tenantsTable.getTableName()
                ))
                .timeout(Duration.minutes(5)) // Longer timeout for migration
                .memorySize(1024) // More memory for migration
                .build();

        Function getUsersLambda = Function.Builder.create(this, "GetUsersLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetUsersHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function updateUserLambda = Function.Builder.create(this, "UpdateUserLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.UpdateUserHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getUserByIdLambda = Function.Builder.create(this, "GetUserByIdLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetUserByIdHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getOrdersLambda = Function.Builder.create(this, "GetOrdersLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetOrdersHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("ORDERS_TABLE", ordersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // CART LAMBDAS
        // ------------------------
        Function addToCartLambda = Function.Builder.create(this, "AddToCartLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.AddToCartHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("CARTS_TABLE", cartsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getCartLambda = Function.Builder.create(this, "GetCartLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetCartHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of(
                    "CARTS_TABLE", cartsTable.getTableName(),
                    "JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production-min-32-chars"
                ))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function updateCartLambda = Function.Builder.create(this, "UpdateCartLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.UpdateCartHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("CARTS_TABLE", cartsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function deleteCartLambda = Function.Builder.create(this, "DeleteCartLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.DeleteCartHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("CARTS_TABLE", cartsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // ORDER LAMBDAS
        // ------------------------
        Function createOrderLambda = Function.Builder.create(this, "CreateOrderLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateOrderHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("ORDERS_TABLE", ordersTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // MARKETPLACE LAMBDAS
        // ------------------------
        Function getStoresLambda = Function.Builder.create(this, "GetStoresLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetStoresHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getStoreProductsLambda = Function.Builder.create(this, "GetStoreProductsLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetStoreProductsHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Delete Product Lambda
        Function deleteProductLambda = Function.Builder.create(this, "DeleteProductLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.DeleteProductHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Update Product Status Lambda
        Function updateProductStatusLambda = Function.Builder.create(this, "UpdateProductStatusLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.UpdateProductStatusHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Update All Products Status Lambda
        Function updateAllProductsStatusLambda = Function.Builder.create(this, "UpdateAllProductsStatusLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.UpdateAllProductsStatusHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.getTableName()))
                .timeout(Duration.seconds(30)) // Longer timeout for bulk operations
                .memorySize(1024) // More memory for bulk operations
                .build();

        // ------------------------
        // PERMISSIONS
        // ------------------------
        productsTable.grantReadData(getProductsLambda);
        productsTable.grantWriteData(createProductLambda);
        productsTable.grantReadWriteData(deleteProductLambda);
        productsTable.grantReadWriteData(updateProductStatusLambda);
        productsTable.grantReadWriteData(updateAllProductsStatusLambda);

        tenantsTable.grantReadData(getTenantsLambda);
        tenantsTable.grantReadData(getTenantLambda);
        tenantsTable.grantWriteData(createTenantLambda);
        tenantsTable.grantReadData(authTenantLambda);

        usersTable.grantWriteData(createUserLambda);
        usersTable.grantReadData(authCustomerLambda);
        usersTable.grantReadData(getUsersLambda);
        usersTable.grantReadWriteData(updateUserLambda);
        usersTable.grantReadData(getUserByIdLambda);

        cartsTable.grantReadData(getCartLambda);
        cartsTable.grantReadData(addToCartLambda);
        cartsTable.grantWriteData(addToCartLambda);
        cartsTable.grantWriteData(updateCartLambda);
        cartsTable.grantWriteData(deleteCartLambda);

        ordersTable.grantWriteData(createOrderLambda);
        ordersTable.grantReadData(getOrdersLambda);

        tenantsTable.grantReadData(getStoresLambda);
        productsTable.grantReadData(getStoreProductsLambda);

        // ------------------------
        // API GATEWAY
        // ------------------------
        RestApi api = RestApi.Builder.create(this, "EcommerceApi")
                .restApiName("EcommerceApi")
                .defaultCorsPreflightOptions(
                        CorsOptions.builder()
                                .allowOrigins(Cors.ALL_ORIGINS)
                                .allowMethods(Cors.ALL_METHODS)
                                .allowHeaders(Cors.DEFAULT_HEADERS)
                                .build())
                .build();

        // ---- /products
        var products = api.getRoot().addResource("products");
        products.addMethod("GET", new LambdaIntegration(getProductsLambda));
        products.addMethod("POST", new LambdaIntegration(createProductLambda));
        
        // ---- /products/{productId}
        var productResource = products.addResource("{productId}");
        productResource.addMethod("DELETE", new LambdaIntegration(deleteProductLambda));
        
        // ---- /products/{productId}/status
        var productStatus = productResource.addResource("status");
        productStatus.addMethod("PATCH", new LambdaIntegration(updateProductStatusLambda));
        
        // ---- /products/bulk-status
        var bulkStatus = products.addResource("bulk-status");
        bulkStatus.addMethod("PATCH", new LambdaIntegration(updateAllProductsStatusLambda));

        // ---- /tenants
        var tenants = api.getRoot().addResource("tenants");
        tenants.addMethod("GET", new LambdaIntegration(getTenantsLambda));
        tenants.addMethod("POST", new LambdaIntegration(createTenantLambda));
        
        // ---- /tenants/{tenantId}
        var tenant = tenants.addResource("{tenantId}");
        tenant.addMethod("GET", new LambdaIntegration(getTenantLambda));

        // ---- /users
        var users = api.getRoot().addResource("users");
        users.addMethod("GET", new LambdaIntegration(getUsersLambda));
        users.addMethod("POST", new LambdaIntegration(createUserLambda));
        
        // ---- /users/{userId} 
        var userResource = users.addResource("{userId}");
        userResource.addMethod("GET", new LambdaIntegration(getUserByIdLambda));
        userResource.addMethod("PATCH", new LambdaIntegration(updateUserLambda));
        
        // ---- /auth/users/{email} (Customer Authentication)
        var auth = api.getRoot().addResource("auth");
        var authUsers = auth.addResource("users");
        var userEmail = authUsers.addResource("{email}");
        userEmail.addMethod("POST", new LambdaIntegration(authCustomerLambda));
        
        // ---- /auth/tenants/{tenantId} (Tenant Authentication)
        var authTenants = auth.addResource("tenants");
        var tenantId = authTenants.addResource("{tenantId}");
        tenantId.addMethod("POST", new LambdaIntegration(authTenantLambda));
        
        // ---- /migrate-passwords (Password Migration - one-time use)
        var migratePasswords = api.getRoot().addResource("migrate-passwords");
        migratePasswords.addMethod("POST", new LambdaIntegration(passwordMigrationLambda));

        // ---- /cart
        var cart = api.getRoot().addResource("cart");
        cart.addMethod("POST", new LambdaIntegration(addToCartLambda));
        
        // ---- /cart/{userId}/{tenantId}
        var userCart = cart.addResource("{userId}");
        var tenantCart = userCart.addResource("{tenantId}");
        tenantCart.addMethod("GET", new LambdaIntegration(getCartLambda));
        tenantCart.addMethod("PUT", new LambdaIntegration(updateCartLambda));
        tenantCart.addMethod("DELETE", new LambdaIntegration(deleteCartLambda));

        // ---- /orders
        var orders = api.getRoot().addResource("orders");
        orders.addMethod("POST", new LambdaIntegration(createOrderLambda));
        orders.addMethod("GET", new LambdaIntegration(getOrdersLambda));
        
        // ---- /orders/{userId}
        var userOrders = orders.addResource("{userId}");
        userOrders.addMethod("GET", new LambdaIntegration(getOrdersLambda));

        // ---- /stores
        var stores = api.getRoot().addResource("stores");
        stores.addMethod("GET", new LambdaIntegration(getStoresLambda));

// ---- /store/{tenantId}/products
        var store = api.getRoot().addResource("store");
        var storeTenant = store.addResource("{tenantId}");
        var storeProducts = storeTenant.addResource("products");
        storeProducts.addMethod("GET", new LambdaIntegration(getStoreProductsLambda));

        // ------------------------
        // OUTPUT
        // ------------------------
        new CfnOutput(this, "EcommerceApiUrl",
                CfnOutputProps.builder()
                        .value(api.getUrl())
                        .build());
    }

    // Convenience constructor
    public EcommerceBackendJavaStack(final Construct scope, final String id) {
        this(scope, id, StackProps.builder().build());
   }
}