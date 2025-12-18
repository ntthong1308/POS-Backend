package com.retail.application.service.report;

import com.retail.application.dto.TopProductDTO;
import com.retail.common.constant.Status;
import com.retail.persistence.repository.ChiTietHoaDonRepository;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service tạo báo cáo bán hàng Excel - Top sản phẩm bán chạy với định dạng tiếng Việt
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalesReportService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final SanPhamRepository sanPhamRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Tạo báo cáo bán hàng Excel - Top sản phẩm bán chạy
     */
    @Transactional(readOnly = true)
    public byte[] generateSalesReportExcel(LocalDate startDate, LocalDate endDate, int limit) {
        log.info("Generating sales report from {} to {}, top {} products", startDate, endDate, limit);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Lấy top sản phẩm bán chạy
        List<Object[]> results = chiTietHoaDonRepository.getTopSellingProductsReport(
                startDateTime, endDateTime, Status.COMPLETED);

        List<TopProductDTO> topProducts = results.stream()
                .limit(limit)
                .map(result -> {
                    Long productId = (Long) result[0];
                    String productCode = (String) result[1];  // maSanPham đã có trong query
                    String productName = (String) result[2];
                    Long totalQty = ((Number) result[3]).longValue();
                    BigDecimal totalRevenue = (BigDecimal) result[4];

                    return TopProductDTO.builder()
                            .sanPhamId(productId)
                            .maSanPham(productCode != null ? productCode : "N/A")
                            .tenSanPham(productName)
                            .totalQuantitySold(totalQty != null ? totalQty : 0L)
                            .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                            .build();
                })
                .toList();

        log.info("Found {} top selling products", topProducts.size());

        return generateExcelFile(topProducts, startDate, endDate);
    }

    /**
     * Generate Excel file with sales report data
     */
    private byte[] generateExcelFile(List<TopProductDTO> topProducts, 
                                     LocalDate startDate, 
                                     LocalDate endDate) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Báo cáo bán hàng");

            // Tạo styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);

            int rowNum = 0;

            // Thêm tiêu đề
            rowNum = addTitle(sheet, rowNum, titleStyle, startDate, endDate);
            
            // Thêm tổng kết
            rowNum = addSummary(sheet, rowNum, topProducts, summaryStyle, currencyStyle);
            
            // Thêm bảng dữ liệu
            rowNum = addDataTable(sheet, rowNum, topProducts, headerStyle, 
                    dataStyle, numberStyle, currencyStyle);

            // Tự động điều chỉnh độ rộng cột
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(baos);
            log.info("Sales report Excel generated, size: {} bytes", baos.size());

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating sales report Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo bán hàng: " + e.getMessage(), e);
        }
    }

    /**
     * Add title section
     */
    private int addTitle(Sheet sheet, int rowNum, CellStyle titleStyle,
                        LocalDate startDate, LocalDate endDate) {
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO BÁN HÀNG - TOP SẢN PHẨM BÁN CHẠY");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

        Row dateRow = sheet.createRow(rowNum++);
        Cell dateCell = dateRow.createCell(0);
        dateCell.setCellValue(String.format("Từ ngày %s đến %s",
                startDate.format(DATE_FORMATTER),
                endDate.format(DATE_FORMATTER)));
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

        Row createdRow = sheet.createRow(rowNum++);
        Cell createdCell = createdRow.createCell(0);
        createdCell.setCellValue("Ngày tạo: " + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

        rowNum++; // Dòng trống
        return rowNum;
    }

    /**
     * Add summary section
     */
    private int addSummary(Sheet sheet, int rowNum, List<TopProductDTO> topProducts,
                          CellStyle summaryStyle, CellStyle currencyStyle) {
        // Tính tổng
        long totalQuantitySold = topProducts.stream()
                .mapToLong(TopProductDTO::getTotalQuantitySold)
                .sum();
        
        BigDecimal totalRevenue = topProducts.stream()
                .map(TopProductDTO::getTotalRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tiêu đề phần tổng kết
        Row summaryHeaderRow = sheet.createRow(rowNum++);
        Cell summaryHeaderCell = summaryHeaderRow.createCell(0);
        summaryHeaderCell.setCellValue("TỔNG KẾT");
        summaryHeaderCell.setCellStyle(summaryStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 1));

        // Các dòng tổng kết
        Row totalQtyRow = sheet.createRow(rowNum++);
        totalQtyRow.createCell(0).setCellValue("Tổng số lượng bán:");
        totalQtyRow.createCell(1).setCellValue(totalQuantitySold);
        totalQtyRow.getCell(0).setCellStyle(summaryStyle);
        totalQtyRow.getCell(1).setCellStyle(summaryStyle);

        Row totalRevRow = sheet.createRow(rowNum++);
        totalRevRow.createCell(0).setCellValue("Tổng doanh thu:");
        Cell totalRevCell = totalRevRow.createCell(1);
        totalRevCell.setCellValue(totalRevenue.doubleValue());
        totalRevCell.setCellStyle(currencyStyle);
        totalRevRow.getCell(0).setCellStyle(summaryStyle);

        Row avgRevRow = sheet.createRow(rowNum++);
        BigDecimal avgRevenue = topProducts.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(topProducts.size()), 2, 
                        java.math.RoundingMode.HALF_UP);
        avgRevRow.createCell(0).setCellValue("Doanh thu trung bình/sản phẩm:");
        Cell avgRevCell = avgRevRow.createCell(1);
        avgRevCell.setCellValue(avgRevenue.doubleValue());
        avgRevCell.setCellStyle(currencyStyle);
        avgRevRow.getCell(0).setCellStyle(summaryStyle);

        rowNum++; // Dòng trống
        return rowNum;
    }

    /**
     * Add data table with top products
     */
    private int addDataTable(Sheet sheet, int rowNum, List<TopProductDTO> topProducts,
                            CellStyle headerStyle, CellStyle dataStyle,
                            CellStyle numberStyle, CellStyle currencyStyle) {
        // Dòng header
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"STT", "Mã sản phẩm", "Tên sản phẩm", "Số lượng bán", "Doanh thu"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Các dòng dữ liệu
        int stt = 1;
        for (TopProductDTO product : topProducts) {
            Row row = sheet.createRow(rowNum++);

            // STT
            Cell sttCell = row.createCell(0);
            sttCell.setCellValue(stt++);
            sttCell.setCellStyle(numberStyle);

            // Mã sản phẩm
            Cell codeCell = row.createCell(1);
            codeCell.setCellValue(product.getMaSanPham() != null ? product.getMaSanPham() : "N/A");
            codeCell.setCellStyle(dataStyle);

            // Tên sản phẩm
            Cell nameCell = row.createCell(2);
            nameCell.setCellValue(product.getTenSanPham());
            nameCell.setCellStyle(dataStyle);

            // Số lượng bán
            Cell qtyCell = row.createCell(3);
            qtyCell.setCellValue(product.getTotalQuantitySold());
            qtyCell.setCellStyle(numberStyle);

            // Doanh thu
            Cell revenueCell = row.createCell(4);
            revenueCell.setCellValue(product.getTotalRevenue().doubleValue());
            revenueCell.setCellStyle(currencyStyle);
        }

        return rowNum;
    }

    // ========== Style Creation Methods ==========

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 12);
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

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0\" VND\""));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}

