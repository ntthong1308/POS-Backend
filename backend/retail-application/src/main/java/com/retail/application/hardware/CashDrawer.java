package com.retail.application.hardware;

import com.retail.common.exception.HardwareException;

/**
 * Interface cho ngăn kéo tiền - Abstraction layer cho tích hợp phần cứng
 */
public interface CashDrawer {

    /**
     * Khởi tạo ngăn kéo tiền
     */
    void initialize() throws HardwareException;

    /**
     * Kiểm tra ngăn kéo đã kết nối
     */
    boolean isConnected();

    /**
     * Mở ngăn kéo tiền
     */
    void open() throws HardwareException;

    /**
     * Kiểm tra ngăn kéo có đang mở
     */
    boolean isOpen();

    /**
     * Lấy trạng thái ngăn kéo
     */
    String getStatus();

    /**
     * Đóng và ngắt kết nối ngăn kéo
     */
    void close() throws HardwareException;
}

