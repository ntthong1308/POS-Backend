package com.retail.application.dto;

import com.retail.common.constant.PaymentMethod;
import com.retail.common.constant.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO phản hồi thanh toán
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long transactionId;
    private String transactionCode;
    private Long invoiceId;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String gatewayTransactionId;
    private String qrCode; // Cho thanh toán QR
    private String redirectUrl; // Cho thanh toán online
    private String paymentUrl; // URL để redirect đến payment gateway (VNPay, etc.)
    private String errorMessage;
    private Boolean requiresConfirmation; // Cho thanh toán offline
}

