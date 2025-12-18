package com.retail.pos.controller;

import com.retail.application.dto.InvoiceDTO;
import com.retail.application.service.pos.PosService;
import com.retail.common.constant.Status;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pos/invoices")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
public class PosInvoiceController {

    private final PosService posService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getInvoice(@PathVariable Long id) {
        log.info("Getting invoice by ID: {}", id);
        InvoiceDTO invoice = posService.getInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    @GetMapping("/by-date")
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getInvoicesByDate(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String status) {
        
        // Parse status nếu có
        Status invoiceStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                invoiceStatus = Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", 
                                "Trạng thái không hợp lệ: " + status + ". Các giá trị hợp lệ: COMPLETED, CANCELLED, PENDING"));
            }
        }
        
        // Nếu có status, dùng endpoint mới
        if (invoiceStatus != null) {
            if (date != null) {
                log.info("Getting invoices by date: {} and status: {}", date, invoiceStatus);
                List<InvoiceDTO> invoices = posService.getInvoicesByDateAndStatus(date, invoiceStatus);
                return ResponseEntity.ok(ApiResponse.success(invoices));
            } else if (fromDate != null && toDate != null) {
                log.info("Getting invoices by date range: {} to {} and status: {}", fromDate, toDate, invoiceStatus);
                List<InvoiceDTO> invoices = posService.getInvoicesByDateRangeAndStatus(fromDate, toDate, invoiceStatus);
                return ResponseEntity.ok(ApiResponse.success(invoices));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("BAD_REQUEST", 
                                "Cần cung cấp 'date' (single date) hoặc 'fromDate' và 'toDate' (date range)"));
            }
        }
        
        // Không có status, dùng logic cũ (mặc định COMPLETED)
        if (date != null) {
            // Single date
            log.info("Getting invoices by date: {}", date);
            List<InvoiceDTO> invoices = posService.getInvoicesByDate(date);
            return ResponseEntity.ok(ApiResponse.success(invoices));
        } else if (fromDate != null && toDate != null) {
            // Date range
            log.info("Getting invoices by date range: {} to {}", fromDate, toDate);
            List<InvoiceDTO> invoices = posService.getInvoicesByDateRange(fromDate, toDate);
            return ResponseEntity.ok(ApiResponse.success(invoices));
        } else {
            // Missing required parameters
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BAD_REQUEST", 
                            "Cần cung cấp 'date' (single date) hoặc 'fromDate' và 'toDate' (date range)"));
        }
    }

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getInvoicesByCustomer(
            @PathVariable Long customerId) {
        log.info("Getting invoices by customer ID: {}", customerId);
        List<InvoiceDTO> invoices = posService.getInvoicesByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(invoices));
    }

    /**
     * Xóa hóa đơn (soft delete - chuyển status sang CANCELLED)
     * - Trừ điểm khách hàng (nếu đã tích điểm)
     * - Trừ doanh thu (không tính vào báo cáo)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceDTO>> cancelInvoice(@PathVariable Long id) {
        log.info("Request to cancel invoice ID: {}", id);
        InvoiceDTO invoice = posService.cancelInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    /**
     * Lấy danh sách hóa đơn đang treo (PENDING) theo chi nhánh
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getPendingInvoices(
            @RequestParam Long chiNhanhId) {
        log.info("Getting pending invoices for branch: {}", chiNhanhId);
        List<InvoiceDTO> invoices = posService.getPendingInvoices(chiNhanhId);
        return ResponseEntity.ok(ApiResponse.success(invoices));
    }

    /**
     * Khôi phục đơn PENDING - Lấy chi tiết đơn để tiếp tục xử lý
     * - Trả về chi tiết đầy đủ (items, customer, total...)
     * - Frontend sẽ load vào màn hình bán hàng
     */
    @GetMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<InvoiceDTO>> resumePendingInvoice(@PathVariable Long id) {
        log.info("Resuming pending invoice ID: {}", id);
        InvoiceDTO invoice = posService.resumePendingInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    /**
     * Cập nhật đơn PENDING - Thêm/sửa/xóa sản phẩm
     * - Cho phép thêm hàng vào đơn PENDING
     * - Cho phép sửa số lượng
     * - Không trừ tồn kho (vẫn là PENDING)
     */
    @PutMapping("/{id}/update-pending")
    public ResponseEntity<ApiResponse<InvoiceDTO>> updatePendingInvoice(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody 
            @jakarta.validation.Valid com.retail.application.dto.HoldBillRequest request) {
        log.info("Updating pending invoice ID: {}", id);
        InvoiceDTO invoice = posService.updatePendingInvoice(id, request);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    /**
     * Hủy đơn PENDING - Chuyển từ PENDING sang CANCELLED
     * - Không trừ tồn kho
     * - Không trừ điểm
     */
    @PostMapping("/{id}/cancel-pending")
    public ResponseEntity<ApiResponse<InvoiceDTO>> cancelPendingInvoice(@PathVariable Long id) {
        log.info("Cancelling pending invoice ID: {}", id);
        InvoiceDTO invoice = posService.cancelPendingInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    /**
     * Thanh toán hóa đơn đã treo (chuyển từ PENDING sang COMPLETED)
     * - Trừ tồn kho
     * - Tích điểm khách hàng
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<InvoiceDTO>> completePendingInvoice(
            @PathVariable Long id,
            @RequestParam String phuongThucThanhToan) {
        log.info("Completing pending invoice ID: {} - Payment method: {}", id, phuongThucThanhToan);
        InvoiceDTO invoice = posService.completePendingInvoice(id, phuongThucThanhToan);
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }
}