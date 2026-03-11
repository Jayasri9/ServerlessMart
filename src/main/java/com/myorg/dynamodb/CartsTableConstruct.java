package com.myorg.dynamodb;

import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.ITable;
import software.amazon.awscdk.services.dynamodb.Table;
import software.constructs.Construct;
import software.amazon.awscdk.services.dynamodb.BillingMode;

public class CartsTableConstruct extends Construct {

    public final ITable table;

    public CartsTableConstruct(final Construct scope, final String id) {
        super(scope, id);

        this.table = Table.Builder.create(this, "CartsTable")
                .tableName("CartsTableV2")
                .partitionKey(Attribute.builder()
                        .name("userId")
                        .type(software.amazon.awscdk.services.dynamodb.AttributeType.STRING)
                        .build())
                .sortKey(Attribute.builder()
                        .name("tenantId")
                        .type(software.amazon.awscdk.services.dynamodb.AttributeType.STRING)
                        .build())
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .build();
    }
}