package com.retail.pos.controller;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.application.service.payment.PaymentService;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller xử lý thanh toán cho POS
 */
@RestController
@RequestMapping("/api/v1/pos/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Xử lý thanh toán cho hóa đơn
     */
    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        log.info("Processing payment request for invoice ID: {}", request.getInvoiceId());
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Xác minh trạng thái thanh toán
     */
    @GetMapping("/verify/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(@PathVariable String transactionId) {
        log.info("Verifying payment: {}", transactionId);
        PaymentResponse response = paymentService.verifyPayment(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Hoàn tiền
     */
    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @RequestParam String transactionId,
            @RequestParam BigDecimal amount) {
        log.info("Processing refund: {} - Amount: {}", transactionId, amount);
        PaymentResponse response = paymentService.refund(transactionId, amount);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy giao dịch thanh toán theo ID
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentTransaction(@PathVariable Long transactionId) {
        log.info("Getting payment transaction: {}", transactionId);
        PaymentResponse response = paymentService.getPaymentTransaction(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách giao dịch thanh toán cho hóa đơn
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentTransactionsByInvoice(
            @PathVariable Long invoiceId) {
        log.info("Getting payment transactions for invoice: {}", invoiceId);
        List<PaymentResponse> transactions = paymentService.getPaymentTransactionsByInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    /**
     * Đối soát thanh toán offline
     */
    @PostMapping("/reconcile/{transactionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> reconcilePayment(
            @PathVariable Long transactionId,
            @RequestParam String reconciliationStatus) {
        log.info("Reconciling payment: {} - Status: {}", transactionId, reconciliationStatus);
        PaymentResponse response = paymentService.reconcilePayment(transactionId, reconciliationStatus);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

