package com.myorg.model;

import java.util.List;

public class Cart {

    private String userId;
    private String tenantId;
    private List<CartItem> items;
    private double totalAmount;
    private String updatedAt;

    public Cart() {}

    public static class CartItem {
        private String productId;
        private String name;
        private int quantity;
        private double price;
    }
}