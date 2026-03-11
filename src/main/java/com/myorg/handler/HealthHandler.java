package com.myorg.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import java.util.HashMap;
import java.util.Map;

public class HealthHandler implements RequestHandler<Object, Map<String, Object>> {

    @Override
    public Map<String, Object> handleRequest(Object input, Context context) {

        Map<String, Object> response = new HashMap<>();
        response.put("statusCode", 200);
        response.put("message", "Ecommerce backend is healthy 🚀");

        return response;
    }
}