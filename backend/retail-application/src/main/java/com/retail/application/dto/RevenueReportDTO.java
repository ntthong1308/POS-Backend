package com.retail.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDTO {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal netRevenue;
    private BigDecimal totalProfit;  // Lợi nhuận (10% của netRevenue)
    private Long totalCustomers;
    private BigDecimal averageOrderValue;
    private List<RevenueByMonthDTO> revenueByMonth;  // Doanh thu theo tháng cho biểu đồ
}