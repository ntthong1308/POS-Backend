package com.retail.api.controller;

import com.retail.application.service.report.RevenueReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Controller REST API cho xuất báo cáo Excel - Doanh thu
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final RevenueReportService revenueReportService;

    /**
     * Tải xuống báo cáo doanh thu dạng Excel
     * 
     * Supports both parameter names:
     * - fromDate/toDate (new, recommended)
     * - startDate/endDate (backward compatible)
     */
    @GetMapping("/revenue/excel")
    public ResponseEntity<byte[]> downloadRevenueReportExcel(
            @RequestParam(name = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(name = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        // Use new parameter names if provided, otherwise fallback to old names
        LocalDate actualStartDate = fromDate != null ? fromDate : startDate;
        LocalDate actualEndDate = toDate != null ? toDate : endDate;
        
        if (actualStartDate == null || actualEndDate == null) {
            throw new IllegalArgumentException("Missing required parameters: fromDate/toDate or startDate/endDate");
        }
        
        log.info("Request to download revenue report from {} to {}", actualStartDate, actualEndDate);
        log.debug("Received parameters - fromDate: {}, toDate: {}, startDate: {}, endDate: {}", 
                fromDate, toDate, startDate, endDate);
        
        // Validate date range
        if (actualStartDate.isAfter(actualEndDate)) {
            log.warn("Start date {} is after end date {}, swapping them", actualStartDate, actualEndDate);
            LocalDate temp = actualStartDate;
            actualStartDate = actualEndDate;
            actualEndDate = temp;
        }

        try {
            // Generate Excel file
            byte[] excelData = revenueReportService.generateRevenueReportExcel(actualStartDate, actualEndDate);

            // Create filename with date range
            String filename = String.format("BaoCaoDoanhThu_%s_den_%s.xlsx",
                    actualStartDate.format(DateTimeFormatter.ofPattern("ddMMyyyy")),
                    actualEndDate.format(DateTimeFormatter.ofPattern("ddMMyyyy"))
            );

            log.info("Revenue report generated successfully, size: {} bytes, filename: {}",
                    excelData.length, filename);

            // Return file with headers
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelData);

        } catch (Exception e) {
            log.error("Error generating revenue report from {} to {}", actualStartDate, actualEndDate, e);
            // Return detailed error for debugging
            throw new RuntimeException("Lỗi khi tạo báo cáo doanh thu: " + e.getMessage(), e);
        }
    }

    /**
     * Kiểm tra trạng thái API
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Report service is running!");
    }
}