package com.retail.application.service.report;

import com.retail.application.dto.RevenueReportDTO;
import com.retail.application.dto.TopProductDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    /**
     * Báo cáo doanh thu theo khoảng thời gian
     */
    RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate);

    /**
     * Báo cáo doanh thu theo chi nhánh
     */
    RevenueReportDTO getRevenueReportByBranch(Long chiNhanhId, LocalDate startDate, LocalDate endDate);

    /**
     * Top sản phẩm bán chạy
     */
    List<TopProductDTO> getTopSellingProducts(LocalDate startDate, LocalDate endDate, int limit);

    /**
     * Danh sách sản phẩm sắp hết hàng
     */
    List<com.retail.application.dto.ProductDTO> getLowStockProducts();
}