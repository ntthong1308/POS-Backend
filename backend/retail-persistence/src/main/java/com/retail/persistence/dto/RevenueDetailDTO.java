package com.retail.persistence.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Revenue Detail (per product per day)
 *
 * Used for Excel report generation
 * Simple POJO with getters/setters
 *
 */
@Data
public class RevenueDetailDTO {

    private LocalDate date;
    private String productName;
    private Long quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private BigDecimal discount;
    private BigDecimal netAmount;

    /**
     * Default constructor
     */
    public RevenueDetailDTO() {
    }
}