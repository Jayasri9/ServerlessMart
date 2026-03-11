package com.myorg;

import software.amazon.awscdk.App;

public class EcommerceBackendJavaApp {
    public static void main(final String[] args) {
        App app = new App();

        new EcommerceBackendJavaStack(
                app,
                "EcommerceBackendJavaStack"
        );

        app.synth();
    }
}