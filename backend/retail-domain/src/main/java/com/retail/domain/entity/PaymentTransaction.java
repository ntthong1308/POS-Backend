package com.retail.domain.entity;

import com.retail.common.constant.PaymentMethod;
import com.retail.common.constant.PaymentStatus;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity lưu thông tin các giao dịch thanh toán
 */
@Entity
@Table(name = "payment_transaction", indexes = {
        @Index(name = "idx_payment_transaction_code", columnList = "transaction_code"),
        @Index(name = "idx_payment_transaction_invoice", columnList = "hoa_don_id"),
        @Index(name = "idx_payment_transaction_status", columnList = "status"),
        @Index(name = "idx_payment_transaction_date", columnList = "transaction_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 100)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_id", nullable = false)
    private HoaDon hoaDon;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "gateway_transaction_id", length = 200)
    private String gatewayTransactionId;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Column(name = "card_last4", length = 4)
    private String cardLast4;

    @Column(name = "card_type", length = 50)
    private String cardType;

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    @Column(name = "e_wallet_provider", length = 50)
    private String eWalletProvider;

    @Column(name = "e_wallet_account", length = 100)
    private String eWalletAccount;

    @Column(name = "reconciliation_date")
    private LocalDateTime reconciliationDate;

    @Column(name = "reconciliation_status", length = 50)
    private String reconciliationStatus;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

