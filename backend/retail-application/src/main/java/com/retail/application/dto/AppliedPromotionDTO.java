package com.retail.application.dto;

import com.retail.common.constant.PromotionType;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO khuyến mãi đã được áp dụng - Thông tin khuyến mãi áp dụng vào hóa đơn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppliedPromotionDTO {
    private Long promotionId;
    private String maKhuyenMai;
    private String tenKhuyenMai;
    private PromotionType loaiKhuyenMai;
    private BigDecimal discountAmount; // Số tiền đã giảm
    private BigDecimal originalAmount; // Số tiền gốc
    private BigDecimal finalAmount; // Số tiền sau khi giảm
    private String description; // Mô tả khuyến mãi đã áp dụng
}

