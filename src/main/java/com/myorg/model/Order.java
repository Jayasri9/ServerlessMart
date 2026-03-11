package com.myorg.model;

import java.util.List;

public class Order {

    private String orderId;
    private String userId;
    private String tenantId;
    private List<OrderItem> items;
    private double totalAmount;
    private String orderStatus;
    private String paymentId;
    private String createdAt;

    public Order() {}

    public static class OrderItem {
        private String productId;
        private String name;
        private int quantity;
        private double price;
    }
}