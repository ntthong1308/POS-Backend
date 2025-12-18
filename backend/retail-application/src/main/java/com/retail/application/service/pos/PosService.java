package com.retail.application.service.pos;

import com.retail.application.dto.CartItemDTO;
import com.retail.application.dto.CheckoutRequest;
import com.retail.application.dto.InvoiceDTO;
import com.retail.application.dto.ProductDTO;
import com.retail.common.constant.Status;

import java.util.List;

public interface PosService {

    /**
     * Tìm sản phẩm bằng barcode để thêm vào giỏ hàng
     */
    ProductDTO scanProduct(String barcode);

    /**
     * Validate giỏ hàng trước khi thanh toán
     */
    void validateCart(List<CartItemDTO> items);

    /**
     * Thanh toán và tạo hóa đơn
     */
    InvoiceDTO checkout(CheckoutRequest request);

    /**
     * Lấy thông tin hóa đơn
     */
    InvoiceDTO getInvoice(Long invoiceId);

    /**
     * Lấy danh sách hóa đơn theo ngày (single date)
     */
    List<InvoiceDTO> getInvoicesByDate(String date);

    /**
     * Lấy danh sách hóa đơn theo khoảng ngày (date range)
     */
    List<InvoiceDTO> getInvoicesByDateRange(String fromDate, String toDate);

    /**
     * Lấy danh sách hóa đơn theo khách hàng
     */
    List<InvoiceDTO> getInvoicesByCustomer(Long customerId);

    /**
     * Xóa hóa đơn (soft delete - chuyển status sang CANCELLED)
     * Trừ điểm khách hàng, trừ doanh thu, giảm số hóa đơn
     */
    InvoiceDTO cancelInvoice(Long invoiceId);

    /**
     * Lấy danh sách hóa đơn theo ngày và trạng thái
     */
    List<InvoiceDTO> getInvoicesByDateAndStatus(String date, Status status);

    /**
     * Lấy danh sách hóa đơn theo khoảng ngày và trạng thái
     */
    List<InvoiceDTO> getInvoicesByDateRangeAndStatus(String fromDate, String toDate, Status status);

    /**
     * Treo bill - Tạo hóa đơn tạm thời (PENDING) chưa thanh toán
     * - Không trừ tồn kho
     * - Không tích điểm
     * - Status = PENDING
     * - Không yêu cầu phương thức thanh toán
     */
    InvoiceDTO holdBill(com.retail.application.dto.HoldBillRequest request);

    /**
     * Lấy danh sách hóa đơn đang treo (PENDING) theo chi nhánh
     */
    List<InvoiceDTO> getPendingInvoices(Long chiNhanhId);

    /**
     * Khôi phục đơn PENDING - Lấy chi tiết đơn để tiếp tục xử lý
     * - Kiểm tra đơn phải là PENDING
     * - Trả về chi tiết đầy đủ (items, customer, total...)
     */
    InvoiceDTO resumePendingInvoice(Long invoiceId);

    /**
     * Cập nhật đơn PENDING - Thêm/sửa/xóa sản phẩm
     * - Cho phép thêm hàng vào đơn PENDING
     * - Cho phép sửa số lượng
     * - Không trừ tồn kho (vẫn là PENDING)
     */
    InvoiceDTO updatePendingInvoice(Long invoiceId, com.retail.application.dto.HoldBillRequest request);

    /**
     * Hủy đơn PENDING - Chuyển từ PENDING sang CANCELLED
     * - Không trừ tồn kho (vì chưa trừ từ đầu)
     * - Không trừ điểm (vì chưa tích điểm)
     * - Chỉ đơn giản là chuyển trạng thái sang CANCELLED
     */
    InvoiceDTO cancelPendingInvoice(Long invoiceId);

    /**
     * Thanh toán hóa đơn đã treo (chuyển từ PENDING sang COMPLETED)
     * - Trừ tồn kho
     * - Tích điểm khách hàng
     * - Cập nhật status = COMPLETED
     */
    InvoiceDTO completePendingInvoice(Long invoiceId, String phuongThucThanhToan);
}