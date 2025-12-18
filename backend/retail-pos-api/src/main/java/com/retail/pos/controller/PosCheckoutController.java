package com.retail.pos.controller;

import com.retail.application.dto.CheckoutRequest;
import com.retail.application.dto.HoldBillRequest;
import com.retail.application.dto.InvoiceDTO;
import com.retail.application.service.pos.PosService;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pos/checkout")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
public class PosCheckoutController {

    private final PosService posService;

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceDTO>> checkout(@Valid @RequestBody CheckoutRequest request) {
        log.info("Processing checkout request");
        InvoiceDTO invoice = posService.checkout(request);
        log.info("Checkout completed successfully: {}", invoice.getMaHoaDon());
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validateCart(@Valid @RequestBody CheckoutRequest request) {
        log.info("Validating cart with {} items", request.getItems().size());
        posService.validateCart(request.getItems());
        return ResponseEntity.ok(ApiResponse.success("Giỏ hàng hợp lệ"));
    }

    /**
     * Treo bill - Tạo hóa đơn tạm thời (PENDING) chưa thanh toán
     * - Không trừ tồn kho
     * - Không tích điểm
     * - Không yêu cầu phương thức thanh toán (chỉ cần sản phẩm và số tiền)
     */
    @PostMapping("/hold")
    public ResponseEntity<ApiResponse<InvoiceDTO>> holdBill(@Valid @RequestBody HoldBillRequest request) {
        log.info("Holding bill (treo bill) request - No payment method required");
        InvoiceDTO invoice = posService.holdBill(request);
        log.info("Bill held successfully: {} - Status: PENDING - No stock deducted - No points added", 
                invoice.getMaHoaDon());
        return ResponseEntity.ok(ApiResponse.success(invoice));
    }
}