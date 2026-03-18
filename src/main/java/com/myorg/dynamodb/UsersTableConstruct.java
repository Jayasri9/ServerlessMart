package com.myorg.dynamodb;

import software.amazon.awscdk.services.dynamodb.ITable;
import software.amazon.awscdk.services.dynamodb.Table;
import software.constructs.Construct;

public class UsersTableConstruct extends Construct {

    public final ITable table;

    public UsersTableConstruct(final Construct scope, final String id) {
        super(scope, id);

        this.table = Table.fromTableName(this, "UsersTableImport", "UsersTableV2");
    }
}

