package com.retail.common.constant;

/**
 * Enum các loại khuyến mãi được hỗ trợ
 */
public enum PromotionType {
    /**
     * Giảm giá theo phần trăm
     */
    PERCENTAGE("Giảm giá %"),

    /**
     * Giảm giá theo số tiền cố định
     */
    FIXED_AMOUNT("Giảm giá cố định"),

    /**
     * Mua 1 tặng 1
     */
    BOGO("Mua 1 tặng 1"),

    /**
     * Combo sản phẩm với giá đặc biệt
     */
    BUNDLE("Combo sản phẩm"),

    /**
     * Miễn phí vận chuyển
     */
    FREE_SHIPPING("Miễn phí vận chuyển"),

    /**
     * Mua X sản phẩm tặng Y sản phẩm
     */
    BUY_X_GET_Y("Mua X tặng Y");

    private final String displayName;

    PromotionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

