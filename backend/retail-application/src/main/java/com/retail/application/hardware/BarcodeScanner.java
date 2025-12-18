package com.retail.application.hardware;

import com.retail.common.exception.HardwareException;

/**
 * Interface cho máy quét barcode - Abstraction layer cho tích hợp phần cứng
 */
public interface BarcodeScanner {

    /**
     * Khởi tạo máy quét barcode
     */
    void initialize() throws HardwareException;

    /**
     * Kiểm tra máy quét đã kết nối và sẵn sàng
     */
    boolean isConnected();

    /**
     * Bật máy quét - Bắt đầu lắng nghe barcode
     */
    void enable() throws HardwareException;

    /**
     * Tắt máy quét - Dừng lắng nghe
     */
    void disable() throws HardwareException;

    /**
     * Đọc barcode đồng bộ - Trả về chuỗi barcode hoặc null nếu timeout
     */
    String readBarcode(int timeoutMs) throws HardwareException;

    /**
     * Đăng ký listener cho sự kiện barcode bất đồng bộ
     */
    void setBarcodeListener(BarcodeListener listener);

    /**
     * Lấy trạng thái máy quét
     */
    String getStatus();

    /**
     * Đóng và ngắt kết nối máy quét
     */
    void close() throws HardwareException;
}

