package com.retail.application.service.report;

import com.retail.common.constant.Status;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryReportService {

    private final SanPhamRepository sanPhamRepository;

    /**
     * Tạo báo cáo tồn kho dạng Excel
     */
    @Transactional(readOnly = true)
    public byte[] generateInventoryReportExcel() {
        log.info("Generating inventory report Excel");

        try {
            // Lấy dữ liệu
            List<InventoryReportDTO> reportData = getInventoryReportData();
            log.info("Retrieved {} products for inventory report", reportData.size());

            // Tạo Excel
            byte[] excelBytes = generateExcelFile(reportData);
            log.info("Inventory report Excel generated, size: {} bytes", excelBytes.length);

            return excelBytes;

        } catch (Exception e) {
            log.error("Error generating inventory report Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo tồn kho: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy dữ liệu báo cáo tồn kho từ database
     */
    private List<InventoryReportDTO> getInventoryReportData() {
        // ⭐ SỬA: Dùng Status.ACTIVE thay vì String
        List<SanPham> products = sanPhamRepository.findAllForInventoryReport(Status.ACTIVE);
        List<InventoryReportDTO> reportList = new ArrayList<>();

        for (SanPham product : products) {
            // Tính giá trị tồn kho
            BigDecimal inventoryValue = product.getGiaNhap()
                    .multiply(BigDecimal.valueOf(product.getTonKho()));

            // Xác định trạng thái
            String status = determineStockStatus(product);

            InventoryReportDTO dto = InventoryReportDTO.builder()
                    .productCode(product.getMaSanPham())
                    .productName(product.getTenSanPham())
                    .unit(product.getDonViTinh())
                    .currentStock(product.getTonKho())
                    .minimumStock(product.getTonKhoToiThieu())
                    .purchasePrice(product.getGiaNhap())
                    .inventoryValue(inventoryValue)
                    .status(status)
                    .branchName(product.getChiNhanh() != null ?
                            product.getChiNhanh().getTenChiNhanh() : "N/A")
                    .build();

            reportList.add(dto);
        }

        log.info("Processed {} inventory records", reportList.size());
        return reportList;
    }

    /**
     * Xác định trạng thái tồn kho
     */
    private String determineStockStatus(SanPham product) {
        int currentStock = product.getTonKho();
        Integer minimumStock = product.getTonKhoToiThieu();

        if (currentStock == 0) {
            return "HẾT HÀNG";
        } else if (minimumStock != null && currentStock <= minimumStock) {
            return "SẮP HẾT";
        } else {
            return "BÌNH THƯỜNG";
        }
    }

    /**
     * Tạo file Excel từ dữ liệu báo cáo
     */
    private byte[] generateExcelFile(List<InventoryReportDTO> reportData) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // Tạo sheet tổng quan
            createSummarySheet(workbook, reportData);

            // Tạo sheet chi tiết
            createDetailSheet(workbook, reportData);

            // Ghi vào output stream
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Create summary sheet
     */
    private void createSummarySheet(Workbook workbook, List<InventoryReportDTO> reportData) {
        Sheet sheet = workbook.createSheet("Tổng quan");

        // Tạo styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        int rowNum = 0;

        // Tiêu đề
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỒN KHO");
        titleCell.setCellStyle(headerStyle);

        // Ngày
        Row dateRow = sheet.createRow(rowNum++);
        Cell dateCell = dateRow.createCell(0);
        String currentDate = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        dateCell.setCellValue("Ngày tạo: " + currentDate);

        rowNum++; // Dòng trống

        // Tính tổng kết
        int totalProducts = reportData.size();
        long lowStockCount = reportData.stream()
                .filter(p -> "SẮP HẾT".equals(p.getStatus()) || "HẾT HÀNG".equals(p.getStatus()))
                .count();
        BigDecimal totalValue = reportData.stream()
                .map(InventoryReportDTO::getInventoryValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Các dòng tổng kết
        createSummaryRow(sheet, rowNum++, "Tổng số sản phẩm:", String.valueOf(totalProducts), dataStyle);
        createSummaryRow(sheet, rowNum++, "Sản phẩm cần nhập thêm:", String.valueOf(lowStockCount), dataStyle);
        createSummaryRow(sheet, rowNum++, "Tổng giá trị tồn kho:",
                String.format("%,.0f VND", totalValue), currencyStyle);

        // Tự động điều chỉnh độ rộng cột
        sheet.setColumnWidth(0, 8000);
        sheet.setColumnWidth(1, 6000);
    }

    /**
     * Tạo sheet chi tiết
     */
    private void createDetailSheet(Workbook workbook, List<InventoryReportDTO> reportData) {
        Sheet sheet = workbook.createSheet("Chi tiết tồn kho");

        // Tạo styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle lowStockStyle = createLowStockStyle(workbook);
        CellStyle outOfStockStyle = createOutOfStockStyle(workbook);

        int rowNum = 0;

        // Dòng header
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {
                "STT", "Mã SP", "Tên sản phẩm", "Đơn vị", "Tồn kho",
                "Tồn TT", "Giá nhập", "Giá trị", "Trạng thái", "Chi nhánh"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Các dòng dữ liệu
        int stt = 1;
        for (InventoryReportDTO dto : reportData) {
            Row row = sheet.createRow(rowNum++);

            // Chọn style dựa trên trạng thái
            CellStyle rowStyle = dataStyle;
            if ("HẾT HÀNG".equals(dto.getStatus())) {
                rowStyle = outOfStockStyle;
            } else if ("SẮP HẾT".equals(dto.getStatus())) {
                rowStyle = lowStockStyle;
            }

            createCell(row, 0, stt++, rowStyle);
            createCell(row, 1, dto.getProductCode(), rowStyle);
            createCell(row, 2, dto.getProductName(), rowStyle);
            createCell(row, 3, dto.getUnit(), rowStyle);
            createCell(row, 4, dto.getCurrentStock(), rowStyle);
            createCell(row, 5, dto.getMinimumStock(), rowStyle);
            createCell(row, 6, String.format("%,.0f", dto.getPurchasePrice()), currencyStyle);
            createCell(row, 7, String.format("%,.0f", dto.getInventoryValue()), currencyStyle);
            createCell(row, 8, dto.getStatus(), rowStyle);
            createCell(row, 9, dto.getBranchName(), rowStyle);
        }

        // Tự động điều chỉnh độ rộng cột
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
        }
    }

    // ========== Helper methods for creating styles ==========

    private void createSummaryRow(Sheet sheet, int rowNum, String label, String value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(style);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(style);
    }

    private void createCell(Row row, int column, Object value, CellStyle style) {
        Cell cell = row.createCell(column);
        if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        }
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createLowStockStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createOutOfStockStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.RED.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }
}