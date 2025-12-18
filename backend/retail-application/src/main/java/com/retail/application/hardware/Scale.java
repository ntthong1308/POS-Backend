package com.retail.application.hardware;

import com.retail.common.exception.HardwareException;

import java.math.BigDecimal;

/**
 * Interface cho cân - Abstraction layer cho tích hợp phần cứng
 */
public interface Scale {

    /**
     * Khởi tạo cân
     */
    void initialize() throws HardwareException;

    /**
     * Kiểm tra cân đã kết nối
     */
    boolean isConnected();

    /**
     * Đọc trọng lượng từ cân - Trả về kg hoặc null nếu lỗi
     */
    BigDecimal readWeight() throws HardwareException;

    /**
     * Cân về 0
     */
    void tare() throws HardwareException;

    /**
     * Lấy trạng thái cân
     */
    String getStatus();

    /**
     * Đóng và ngắt kết nối cân
     */
    void close() throws HardwareException;
}

