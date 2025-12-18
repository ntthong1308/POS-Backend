package com.retail.application.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueByMonthDTO {
    private String month;  // Format: "YYYY-MM" hoặc "Tháng MM/YYYY"
    private BigDecimal revenue;  // Doanh thu trong tháng
    private Long orders;  // Số đơn hàng trong tháng
}

