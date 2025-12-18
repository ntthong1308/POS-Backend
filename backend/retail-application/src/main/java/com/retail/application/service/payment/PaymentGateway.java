package com.retail.application.service.payment;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.common.constant.PaymentMethod;

/**
 * Interface cho payment gateway - Định nghĩa contract cho các implementation
 */
public interface PaymentGateway {

    /**
     * Kiểm tra gateway có hỗ trợ phương thức thanh toán
     */
    boolean supports(PaymentMethod paymentMethod);

    /**
     * Xử lý thanh toán
     */
    PaymentResponse processPayment(PaymentRequest request);

    /**
     * Xác minh trạng thái thanh toán - Cho đối soát
     */
    PaymentResponse verifyPayment(String transactionId);

    /**
     * Hoàn tiền
     */
    PaymentResponse refund(String transactionId, java.math.BigDecimal amount);
}

