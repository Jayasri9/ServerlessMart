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

import com.myorg.dynamodb.UsersTableConstruct;
import com.myorg.dynamodb.TenantsTableConstruct;
import com.myorg.dynamodb.ProductsTableConstruct;
import com.myorg.dynamodb.CartsTableConstruct;
import com.myorg.dynamodb.OrdersTableConstruct;
import com.myorg.dynamodb.SubscriptionsTableConstruct;

public class EcommerceBackendJavaStack extends Stack {

    public EcommerceBackendJavaStack(
            final Construct scope,
            final String id,
            final StackProps props) {

        super(scope, id, props);

        // ------------------------
        // DynamoDB Tables
        // ------------------------
        UsersTableConstruct usersTable = new UsersTableConstruct(this, "UsersTableConstruct");
        TenantsTableConstruct tenantsTable = new TenantsTableConstruct(this, "TenantsTableConstruct");
        ProductsTableConstruct productsTable = new ProductsTableConstruct(this, "ProductsTableConstruct");
        CartsTableConstruct cartsTable = new CartsTableConstruct(this, "CartsTableConstruct");
        OrdersTableConstruct ordersTable = new OrdersTableConstruct(this, "OrdersTableConstruct");
SubscriptionsTableConstruct subscriptionsTable = new SubscriptionsTableConstruct(this, "SubscriptionsTableConstruct");

        // ------------------------
        // SUBSCRIPTION LAMBDAS
        // ------------------------
        Function createSubscriptionLambda = Function.Builder.create(this, "CreateSubscriptionLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateSubscriptionHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("SUBSCRIPTIONS_TABLE", subscriptionsTable.table.getTableName()))
                .timeout(Duration.seconds(30))
                .memorySize(1024)
                .build();

        Function getSubscriptionLambda = Function.Builder.create(this, "GetSubscriptionLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetSubscriptionHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("SUBSCRIPTIONS_TABLE", subscriptionsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Grant permissions
        subscriptionsTable.table.grantReadWriteData(createSubscriptionLambda);
        subscriptionsTable.table.grantReadData(getSubscriptionLambda);


        // ------------------------
        // PRODUCT LAMBDAS
        // ------------------------
        Function getProductsLambda = Function.Builder.create(this, "GetProductsLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetProductsHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function createProductLambda = Function.Builder.create(this, "CreateProductLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateProductHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.table.getTableName()))
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
                .environment(Map.of("TENANTS_TABLE", tenantsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getTenantLambda = Function.Builder.create(this, "GetTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function createTenantLambda = Function.Builder.create(this, "CreateTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.CreateTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.table.getTableName()))
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
                .environment(Map.of("USERS_TABLE", usersTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function authCustomerLambda = Function.Builder.create(this, "AuthCustomerLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.AuthCustomerHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function authTenantLambda = Function.Builder.create(this, "AuthTenantLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.AuthTenantHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("TENANTS_TABLE", tenantsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getUsersLambda = Function.Builder.create(this, "GetUsersLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetUsersHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("USERS_TABLE", usersTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getOrdersLambda = Function.Builder.create(this, "GetOrdersLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetOrdersHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("ORDERS_TABLE", ordersTable.table.getTableName()))
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
                .environment(Map.of("CARTS_TABLE", cartsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getCartLambda = Function.Builder.create(this, "GetCartLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetCartHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("CARTS_TABLE", cartsTable.table.getTableName()))
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
                .environment(Map.of("ORDERS_TABLE", ordersTable.table.getTableName()))
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
                .environment(Map.of("TENANTS_TABLE", tenantsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        Function getStoreProductsLambda = Function.Builder.create(this, "GetStoreProductsLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.GetStoreProductsHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // Delete Product Lambda
        Function deleteProductLambda = Function.Builder.create(this, "DeleteProductLambda")
                .runtime(Runtime.JAVA_17)
                .handler("com.myorg.handler.DeleteProductHandler::handleRequest")
                .code(Code.fromAsset("target/ecommerce-backend-java-0.1.jar"))
                .environment(Map.of("PRODUCTS_TABLE", productsTable.table.getTableName()))
                .timeout(Duration.seconds(15))
                .memorySize(512)
                .build();

        // ------------------------
        // PERMISSIONS
        // ------------------------
        productsTable.table.grantReadData(getProductsLambda);
        productsTable.table.grantWriteData(createProductLambda);
        productsTable.table.grantReadWriteData(deleteProductLambda);

        tenantsTable.table.grantReadData(getTenantsLambda);
        tenantsTable.table.grantReadData(getTenantLambda);
        tenantsTable.table.grantWriteData(createTenantLambda);

        usersTable.table.grantWriteData(createUserLambda);
        usersTable.table.grantReadData(authCustomerLambda);
        usersTable.table.grantReadData(getUsersLambda);

        cartsTable.table.grantReadData(getCartLambda);
        cartsTable.table.grantReadData(addToCartLambda);
        cartsTable.table.grantWriteData(addToCartLambda);

        ordersTable.table.grantWriteData(createOrderLambda);
        ordersTable.table.grantReadData(getOrdersLambda);

        tenantsTable.table.grantReadData(getStoresLambda);
        productsTable.table.grantReadData(getStoreProductsLambda);

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
        
        // ---- /auth/users/{email} (Customer Authentication)
        var auth = api.getRoot().addResource("auth");
        var authUsers = auth.addResource("users");
        var userEmail = authUsers.addResource("{email}");
        userEmail.addMethod("GET", new LambdaIntegration(authCustomerLambda));
        
        // ---- /auth/tenants/{tenantId} (Tenant Authentication)
        var authTenants = auth.addResource("tenants");
        var tenantId = authTenants.addResource("{tenantId}");
        tenantId.addMethod("GET", new LambdaIntegration(authTenantLambda));

        // ---- /cart
        var cart = api.getRoot().addResource("cart");
        cart.addMethod("POST", new LambdaIntegration(addToCartLambda));
        
        // ---- /cart/{userId}/{tenantId}
        var userCart = cart.addResource("{userId}");
        var tenantCart = userCart.addResource("{tenantId}");
        tenantCart.addMethod("GET", new LambdaIntegration(getCartLambda));

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

        // ---- /subscriptions
        var subscriptions = api.getRoot().addResource("subscriptions");
        subscriptions.addMethod("POST", new LambdaIntegration(createSubscriptionLambda));
        
        // ---- /subscriptions/{tenantId}
        var subscriptionTenant = subscriptions.addResource("{tenantId}");
        subscriptionTenant.addMethod("GET", new LambdaIntegration(getSubscriptionLambda));


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