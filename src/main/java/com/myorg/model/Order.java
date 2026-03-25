package com.myorg.model;

import java.util.List;
import java.util.Map;

public class Order {

    private String orderId;
    private String userId;
    private String tenantId;
    private List<OrderItem> items;
    private double totalAmount;
    private String orderStatus;
    private String paymentId;
    private String createdAt;
    private Map<String, Object> customerInfo;

    public Map<String, Object> getCustomerInfo() {
        return customerInfo;
    }

    public void setCustomerInfo(Map<String, Object> customerInfo) {
        this.customerInfo = customerInfo;
    }

    public Order() {}

    public static class OrderItem {
        private String productId;
        private String name;
        private int quantity;
        private double price;
    }
}