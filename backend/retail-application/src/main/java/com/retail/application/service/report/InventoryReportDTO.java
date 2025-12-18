package com.retail.application.service.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportDTO {

    // Dữ liệu tổng kết
    private Integer totalProducts;
    private BigDecimal totalInventoryValue;
    private Integer lowStockProducts;

    // Dữ liệu chi tiết
    private String productCode;
    private String productName;
    private String unit;
    private Integer currentStock;
    private Integer minimumStock;
    private BigDecimal purchasePrice;
    private BigDecimal inventoryValue; // currentStock * purchasePrice
    private String status; // OK, LOW_STOCK, OUT_OF_STOCK - Trạng thái tồn kho
    private String branchName;
}