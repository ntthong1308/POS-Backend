package com.retail.application.hardware;

import com.retail.common.exception.HardwareException;
import com.retail.domain.entity.HoaDon;

/**
 * Interface cho máy in hóa đơn - Abstraction layer cho tích hợp phần cứng
 */
public interface ReceiptPrinter {

    /**
     * Khởi tạo máy in
     */
    void initialize() throws HardwareException;

    /**
     * Kiểm tra máy in đã kết nối và sẵn sàng
     */
    boolean isConnected();

    /**
     * In hóa đơn - Trả về true nếu thành công
     */
    boolean printInvoice(HoaDon invoice) throws HardwareException;

    /**
     * In text thuần túy
     */
    void printText(String text) throws HardwareException;

    /**
     * In text với định dạng - Bold và font size
     */
    void printText(String text, boolean bold, int fontSize) throws HardwareException;

    /**
     * Cắt giấy
     */
    void cutPaper() throws HardwareException;

    /**
     * Mở ngăn kéo tiền - Nếu được kết nối với máy in
     */
    void openCashDrawer() throws HardwareException;

    /**
     * Lấy trạng thái máy in
     */
    String getStatus();

    /**
     * Kiểm tra giấy sắp hết hoặc hết
     */
    boolean isPaperLow();

    /**
     * Đóng và ngắt kết nối máy in
     */
    void close() throws HardwareException;
}

