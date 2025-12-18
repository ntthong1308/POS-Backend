package com.retail.common.constant;

/**
 * Enum các phương thức thanh toán
 */
public enum PaymentMethod {
    /**
     * Thanh toán bằng tiền mặt
     */
    CASH("Tiền mặt"),

    /**
     * Thanh toán bằng thẻ Visa
     */
    VISA("Thẻ Visa"),

    /**
     * Thanh toán bằng thẻ Mastercard
     */
    MASTER("Thẻ Mastercard"),

    /**
     * Thanh toán bằng thẻ JCB
     */
    JCB("Thẻ JCB"),

    /**
     * Chuyển khoản ngân hàng (hiển thị QR và số tiền)
     */
    BANK_TRANSFER("Chuyển khoản"),

    /**
     * Thanh toán qua VNPay
     */
    VNPAY("VNPay");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PaymentMethod fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return PaymentMethod.valueOf(value.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            for (PaymentMethod method : PaymentMethod.values()) {
                if (method.displayName.equalsIgnoreCase(value)) {
                    return method;
                }
            }
            return null;
        }
    }
}

