package com.retail.persistence.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * DTO for Revenue Summary Statistics
 *
 */
@Data
public class RevenueSummaryDTO {

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal netRevenue;
    private Long totalCustomers;
    private BigDecimal averageOrderValue;

    /**
     * Default constructor (required by Lombok @Data)
     */
    public RevenueSummaryDTO() {
    }

    /**
     * Constructor for JPA query projection
     *
     * ✅ FIXED: Removed AVG parameter - calculates average in Java
     * This avoids SQL Server issues with AVG() in JPQL constructor queries
     *
     * @param startDate Start date
     * @param endDate End date
     * @param totalOrders Total number of invoices
     * @param totalRevenue Total revenue (from SUM)
     * @param totalDiscount Total discount (from SUM)
     * @param netRevenue Net revenue (from SUM)
     * @param totalCustomers Total customers (from COUNT)
     */
    public RevenueSummaryDTO(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long totalOrders,
            BigDecimal totalRevenue,
            BigDecimal totalDiscount,
            BigDecimal netRevenue,
            Long totalCustomers
    ) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalOrders = totalOrders != null ? totalOrders : 0L;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.totalDiscount = totalDiscount != null ? totalDiscount : BigDecimal.ZERO;
        this.netRevenue = netRevenue != null ? netRevenue : BigDecimal.ZERO;
        this.totalCustomers = totalCustomers != null ? totalCustomers : 0L;

        // Calculate average order value in Java (safe and portable)
        if (this.totalOrders > 0 && this.netRevenue != null) {
            this.averageOrderValue = this.netRevenue.divide(
                    BigDecimal.valueOf(this.totalOrders),
                    2,  // 2 decimal places
                    RoundingMode.HALF_UP
            );
        } else {
            this.averageOrderValue = BigDecimal.ZERO;
        }
    }
}