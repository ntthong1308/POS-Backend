package com.retail.application.service.payment;

import com.retail.application.dto.PaymentRequest;
import com.retail.application.dto.PaymentResponse;
import com.retail.application.mapper.PaymentTransactionMapper;
import com.retail.common.constant.PaymentStatus;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.HoaDon;
import com.retail.domain.entity.PaymentTransaction;
import com.retail.persistence.repository.HoaDonRepository;
import com.retail.persistence.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service xử lý thanh toán - Tích hợp với payment gateway và lưu giao dịch
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final HoaDonRepository hoaDonRepository;
    private final PaymentTransactionMapper paymentTransactionMapper;
    private final List<PaymentGateway> paymentGateways;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for invoice ID: {} - Amount: {} - Method: {}",
                request.getInvoiceId(), request.getAmount(), request.getPaymentMethod());

        // Validate invoice exists
        HoaDon hoaDon = hoaDonRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", request.getInvoiceId()));

        // Validate amount matches invoice
        if (request.getAmount().compareTo(hoaDon.getThanhTien()) != 0) {
            throw new IllegalArgumentException(
                    String.format("Số tiền thanh toán (%s) không khớp với số tiền hóa đơn (%s)",
                            request.getAmount(), hoaDon.getThanhTien()));
        }

        // Find appropriate payment gateway
        PaymentGateway gateway = findPaymentGateway(request.getPaymentMethod());
        if (gateway == null) {
            throw new IllegalArgumentException(
                    "Không tìm thấy payment gateway cho phương thức thanh toán: " + request.getPaymentMethod());
        }

        // Process payment through gateway
        PaymentResponse gatewayResponse = gateway.processPayment(request);

        // Create payment transaction record
        PaymentTransaction transaction = PaymentTransaction.builder()
                .transactionCode(generateTransactionCode())
                .hoaDon(hoaDon)
                .paymentMethod(request.getPaymentMethod())
                .status(gatewayResponse.getStatus())
                .amount(request.getAmount())
                .transactionDate(LocalDateTime.now())
                .gatewayTransactionId(gatewayResponse.getGatewayTransactionId())
                .gatewayResponse(serializeGatewayResponse(gatewayResponse))
                .cardLast4(extractCardLast4(request))
                .cardType(determineCardType(request))
                .qrCode(gatewayResponse.getQrCode())
                .errorMessage(gatewayResponse.getErrorMessage())
                .notes(request.getNotes())
                .build();

        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

        log.info("Payment transaction created: {} - Status: {}", savedTransaction.getTransactionCode(), savedTransaction.getStatus());

        // Build response
        PaymentResponse response = paymentTransactionMapper.toResponse(savedTransaction);
        if (gatewayResponse.getQrCode() != null) {
            response.setQrCode(gatewayResponse.getQrCode());
        }
        if (gatewayResponse.getRedirectUrl() != null) {
            response.setRedirectUrl(gatewayResponse.getRedirectUrl());
        }
        if (gatewayResponse.getPaymentUrl() != null) {
            response.setPaymentUrl(gatewayResponse.getPaymentUrl());
        }
        response.setRequiresConfirmation(gatewayResponse.getRequiresConfirmation());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse verifyPayment(String transactionId) {
        log.info("Verifying payment: {}", transactionId);

        PaymentTransaction transaction = paymentTransactionRepository.findByGatewayTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", transactionId));

        // Find gateway and verify
        PaymentGateway gateway = findPaymentGateway(transaction.getPaymentMethod());
        if (gateway != null) {
            PaymentResponse verificationResult = gateway.verifyPayment(transactionId);
            // Update transaction status if changed
            if (verificationResult.getStatus() != transaction.getStatus()) {
                transaction.setStatus(verificationResult.getStatus());
                paymentTransactionRepository.save(transaction);
            }
        }

        return paymentTransactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public PaymentResponse refund(String transactionId, BigDecimal amount) {
        log.info("Processing refund: {} - Amount: {}", transactionId, amount);

        PaymentTransaction transaction = paymentTransactionRepository.findByGatewayTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", transactionId));

        if (transaction.getStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Chỉ có thể hoàn tiền cho giao dịch đã thành công");
        }

        // Find gateway and process refund
        PaymentGateway gateway = findPaymentGateway(transaction.getPaymentMethod());
        if (gateway == null) {
            throw new IllegalArgumentException("Không tìm thấy payment gateway");
        }

        PaymentResponse refundResponse = gateway.refund(transactionId, amount);

        // Create refund transaction record
        PaymentTransaction refundTransaction = PaymentTransaction.builder()
                .transactionCode(generateTransactionCode())
                .hoaDon(transaction.getHoaDon())
                .paymentMethod(transaction.getPaymentMethod())
                .status(refundResponse.getStatus())
                .amount(amount.negate()) // Negative amount for refund
                .transactionDate(LocalDateTime.now())
                .gatewayTransactionId(refundResponse.getGatewayTransactionId())
                .notes("Refund for transaction: " + transactionId)
                .build();

        paymentTransactionRepository.save(refundTransaction);

        return paymentTransactionMapper.toResponse(refundTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentTransaction(Long transactionId) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", transactionId));
        return paymentTransactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentTransactionsByInvoice(Long invoiceId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByHoaDonId(invoiceId);
        return paymentTransactionMapper.toResponseList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentTransactionsByStatus(PaymentStatus status) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByStatus(status);
        return paymentTransactionMapper.toResponseList(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByTransactionDateBetween(startDate, endDate);
        return paymentTransactionMapper.toResponseList(transactions);
    }

    @Override
    @Transactional
    public PaymentResponse reconcilePayment(Long transactionId, String reconciliationStatus) {
        log.info("Reconciling payment: {} - Status: {}", transactionId, reconciliationStatus);

        PaymentTransaction transaction = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", transactionId));

        transaction.setReconciliationDate(LocalDateTime.now());
        transaction.setReconciliationStatus(reconciliationStatus);
        transaction.setStatus(PaymentStatus.RECONCILED);

        PaymentTransaction saved = paymentTransactionRepository.save(transaction);
        return paymentTransactionMapper.toResponse(saved);
    }

    private PaymentGateway findPaymentGateway(com.retail.common.constant.PaymentMethod paymentMethod) {
        return paymentGateways.stream()
                .filter(gateway -> gateway.supports(paymentMethod))
                .findFirst()
                .orElse(null);
    }

    private String generateTransactionCode() {
        return "PAY" + System.currentTimeMillis();
    }

    private String serializeGatewayResponse(PaymentResponse response) {
        // Simple JSON serialization (in production, use proper JSON library)
        return String.format("{\"status\":\"%s\",\"gatewayTransactionId\":\"%s\"}",
                response.getStatus(), response.getGatewayTransactionId());
    }

    private String extractCardLast4(PaymentRequest request) {
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
            return request.getCardNumber().substring(request.getCardNumber().length() - 4);
        }
        return null;
    }

    private String determineCardType(PaymentRequest request) {
        if (request.getPaymentMethod() == com.retail.common.constant.PaymentMethod.VISA) {
            return "VISA";
        } else if (request.getPaymentMethod() == com.retail.common.constant.PaymentMethod.MASTER) {
            return "MASTER";
        } else if (request.getPaymentMethod() == com.retail.common.constant.PaymentMethod.JCB) {
            return "JCB";
        }
        return null;
    }
}

