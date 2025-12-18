package com.retail.application.dto;

import com.retail.common.constant.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO yêu cầu thanh toán
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Hóa đơn ID không được để trống")
    private Long invoiceId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    // Chi tiết thanh toán bằng thẻ (VISA, MASTER, JCB)
    private String cardNumber;
    private String cardHolderName;
    private String cardExpiryDate;
    private String cardCvv;

    // Chi tiết chuyển khoản ngân hàng
    private String bankName;
    private String bankAccount;
    private String transactionReference;

    // Ghi chú thêm
    private String notes;

    // Cho thanh toán offline/đối soát
    @Builder.Default
    private Boolean isOffline = false;
}

