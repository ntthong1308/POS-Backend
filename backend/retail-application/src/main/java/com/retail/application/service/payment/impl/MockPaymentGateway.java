package com.retail.application.service.payment.impl;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.common.constant.PaymentMethod;
import com.retail.common.constant.PaymentStatus;
import com.retail.application.service.payment.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mock Payment Gateway - Mô phỏng xử lý thanh toán cho testing/demo
 */
@Component
@Slf4j
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        // Support payment methods for demo, except VNPAY (use VNPayPaymentGateway instead)
        return paymentMethod != null && paymentMethod != PaymentMethod.VNPAY;
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing mock payment: {} - Amount: {} - Method: {}",
                request.getInvoiceId(), request.getAmount(), request.getPaymentMethod());

        // Simulate payment processing delay
        try {
            Thread.sleep(500); // Simulate network delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Generate mock transaction ID
        String gatewayTransactionId = "MOCK_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentResponse.PaymentResponseBuilder builder = PaymentResponse.builder()
                .transactionCode("TXN" + System.currentTimeMillis())
                .invoiceId(request.getInvoiceId())
                .paymentMethod(request.getPaymentMethod())
                .amount(request.getAmount())
                .transactionDate(LocalDateTime.now())
                .gatewayTransactionId(gatewayTransactionId)
                .requiresConfirmation(request.getIsOffline() != null && request.getIsOffline());

        // Handle different payment methods
        switch (request.getPaymentMethod()) {
            case CASH:
                // Cash is always successful immediately
                builder.status(PaymentStatus.COMPLETED);
                log.info("Cash payment completed: {}", gatewayTransactionId);
                break;

            case VISA:
            case MASTER:
            case JCB:
                // Simulate card payment - always successful in mock
                builder.status(PaymentStatus.COMPLETED);
                if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
                    builder.status(PaymentStatus.COMPLETED);
                }
                log.info("Card payment ({}) completed: {}", request.getPaymentMethod(), gatewayTransactionId);
                break;

            case BANK_TRANSFER:
                // Bank transfer - generate QR code with amount
                String qrCode = generateBankTransferQRCode(request.getAmount());
                builder.qrCode(qrCode)
                        .status(PaymentStatus.PENDING_RECONCILIATION); // Pending until customer transfers and reconciles
                log.info("Bank transfer QR generated: {} - Amount: {} - QR Code: {}",
                        gatewayTransactionId, request.getAmount(), qrCode);
                break;

            default:
                builder.status(PaymentStatus.FAILED)
                        .errorMessage("Unsupported payment method");
        }

        return builder.build();
    }

    @Override
    public PaymentResponse verifyPayment(String transactionId) {
        log.info("Verifying payment: {}", transactionId);

        // Mock verification - always return completed
        return PaymentResponse.builder()
                .gatewayTransactionId(transactionId)
                .status(PaymentStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentResponse refund(String transactionId, BigDecimal amount) {
        log.info("Processing refund: {} - Amount: {}", transactionId, amount);

        // Mock refund - always successful
        return PaymentResponse.builder()
                .gatewayTransactionId("REFUND_" + transactionId)
                .status(PaymentStatus.COMPLETED)
                .amount(amount)
                .transactionDate(LocalDateTime.now())
                .build();
    }

    /**
     * Generate bank transfer QR code with amount
     * Format: VietQR standard with amount included
     */
    private String generateBankTransferQRCode(BigDecimal amount) {
        // Generate VietQR format QR code for bank transfer
        // Format: 00020101021238570010A00000072701270006{amount}53037045406{time}
        // In production, this would generate actual VietQR code
        
        String amountString = String.format("%010d", amount.multiply(BigDecimal.valueOf(100)).longValue());
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        // VietQR payload structure
        return "000201010212" +                      // QR header
               "38570010A00000072701270006" +       // Merchant info
               amountString +                        // Amount in VND (smallest unit)
               "5303704" +                           // Currency (VND)
               "5406" + amountString +              // Transaction amount
               "5802VN" +                           // Country code
               "6207" + timestamp;                  // Additional data
    }
}

