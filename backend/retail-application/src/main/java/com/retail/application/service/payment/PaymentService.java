package com.retail.application.service.payment;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.common.constant.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface service xử lý thanh toán - Tích hợp với payment gateway và quản lý giao dịch
 */
public interface PaymentService {

    /**
     * Xử lý thanh toán cho hóa đơn
     */
    PaymentResponse processPayment(PaymentRequest request);

    /**
     * Xác minh trạng thái thanh toán
     */
    PaymentResponse verifyPayment(String transactionId);

    /**
     * Hoàn tiền
     */
    PaymentResponse refund(String transactionId, BigDecimal amount);

    /**
     * Lấy giao dịch thanh toán theo ID
     */
    PaymentResponse getPaymentTransaction(Long transactionId);

    /**
     * Lấy danh sách giao dịch thanh toán cho hóa đơn
     */
    List<PaymentResponse> getPaymentTransactionsByInvoice(Long invoiceId);

    /**
     * Lấy danh sách giao dịch thanh toán theo trạng thái
     */
    List<PaymentResponse> getPaymentTransactionsByStatus(PaymentStatus status);

    /**
     * Lấy danh sách giao dịch thanh toán theo khoảng thời gian
     */
    List<PaymentResponse> getPaymentTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Đối soát thanh toán offline
     */
    PaymentResponse reconcilePayment(Long transactionId, String reconciliationStatus);
}

