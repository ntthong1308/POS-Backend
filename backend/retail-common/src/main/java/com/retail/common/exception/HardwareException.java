package com.retail.common.exception;

/**
 * Exception khi các thao tác phần cứng thất bại
 */
public class HardwareException extends RuntimeException {

    private final String deviceName;
    private final String operation;

    public HardwareException(String deviceName, String operation, String message) {
        super(String.format("[%s] %s failed: %s", deviceName, operation, message));
        this.deviceName = deviceName;
        this.operation = operation;
    }

    public HardwareException(String deviceName, String operation, String message, Throwable cause) {
        super(String.format("[%s] %s failed: %s", deviceName, operation, message), cause);
        this.deviceName = deviceName;
        this.operation = operation;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getOperation() {
        return operation;
    }
}

