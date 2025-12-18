package com.retail.common.constant;

/**
 * Enum các loại thiết bị phần cứng được hỗ trợ
 */
public enum HardwareType {
    /**
     * Máy quét mã vạch (Barcode Scanner)
     */
    BARCODE_SCANNER("Máy quét mã vạch"),

    /**
     * Máy in hóa đơn (Receipt Printer)
     */
    RECEIPT_PRINTER("Máy in hóa đơn"),

    /**
     * Két tiền (Cash Drawer)
     */
    CASH_DRAWER("Két tiền"),

    /**
     * Cân (Scale)
     */
    SCALE("Cân"),

    /**
     * POS Terminal (Payment Terminal)
     */
    POS_TERMINAL("Máy thanh toán POS");

    private final String displayName;

    HardwareType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

