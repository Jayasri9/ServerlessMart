package com.myorg.dynamodb;

import software.amazon.awscdk.services.dynamodb.Table;
import software.constructs.Construct;
import software.amazon.awscdk.services.dynamodb.ITable;

public class ProductsTableConstruct extends Construct {

    public final ITable table;

    public ProductsTableConstruct(final Construct scope, final String id) {
        super(scope, id);

        this.table = Table.fromTableName(
                this,
                "ProductsTableImport",
                "ProductsTable"
        );
    }
}