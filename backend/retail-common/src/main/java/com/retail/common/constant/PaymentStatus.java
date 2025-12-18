package com.retail.common.constant;

/**
 * Enum trạng thái giao dịch thanh toán
 */
public enum PaymentStatus {
    /**
     * Đang chờ thanh toán
     */
    PENDING("Đang chờ"),

    /**
     * Đã thanh toán thành công
     */
    COMPLETED("Đã thanh toán"),

    /**
     * Thanh toán thất bại
     */
    FAILED("Thất bại"),

    /**
     * Đã hủy
     */
    CANCELLED("Đã hủy"),

    /**
     * Đang chờ xác nhận (cho offline transactions)
     */
    PENDING_RECONCILIATION("Chờ đối soát"),

    /**
     * Đã đối soát
     */
    RECONCILED("Đã đối soát");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

