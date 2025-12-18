package com.retail.common.constant;

public final class ErrorCode {
    // General
    public static final String BAD_REQUEST = "ERR_BAD_REQUEST";
    public static final String UNAUTHORIZED = "ERR_UNAUTHORIZED";
    public static final String FORBIDDEN = "ERR_FORBIDDEN";
    public static final String NOT_FOUND = "ERR_NOT_FOUND";
    public static final String INTERNAL_ERROR = "ERR_INTERNAL";

    // Business
    public static final String INSUFFICIENT_STOCK = "ERR_INSUFFICIENT_STOCK";
    public static final String INVALID_QUANTITY = "ERR_INVALID_QUANTITY";
    public static final String PRODUCT_NOT_FOUND = "ERR_PRODUCT_NOT_FOUND";
    public static final String CUSTOMER_NOT_FOUND = "ERR_CUSTOMER_NOT_FOUND";
    public static final String INVOICE_NOT_FOUND = "ERR_INVOICE_NOT_FOUND";
    public static final String DUPLICATE_BARCODE = "ERR_DUPLICATE_BARCODE";
    public static final String INVALID_RETURN = "ERR_INVALID_RETURN";
    public static final String EMPLOYEE_NOT_FOUND = "ERR_EMPLOYEE_NOT_FOUND";
    public static final String INVALID_CREDENTIALS = "ERR_INVALID_CREDENTIALS";
    public static final String HARDWARE_ERROR = "ERR_HARDWARE_ERROR";

    private ErrorCode() {}
}