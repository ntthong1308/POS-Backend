package com.retail.admin.controller;

import com.retail.application.dto.ProductDTO;
import com.retail.application.dto.RevenueReportDTO;
import com.retail.application.dto.TopProductDTO;
import com.retail.application.service.report.ReportService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ReportAdminController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportDTO>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue report from {} to {}", startDate, endDate);
        RevenueReportDTO report = reportService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/revenue/branch/{chiNhanhId}")
    public ResponseEntity<ApiResponse<RevenueReportDTO>> getRevenueReportByBranch(
            @PathVariable Long chiNhanhId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting revenue report for branch {} from {} to {}", chiNhanhId, startDate, endDate);
        RevenueReportDTO report = reportService.getRevenueReportByBranch(chiNhanhId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductDTO>>> getTopSellingProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Getting top {} selling products from {} to {}", limit, startDate, endDate);
        List<TopProductDTO> products = reportService.getTopSellingProducts(startDate, endDate, limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts() {
        log.info("Getting low stock products");
        List<ProductDTO> products = reportService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}