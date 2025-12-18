package com.retail.application.service.report;

import com.retail.common.constant.Status;
import com.retail.domain.entity.ChiTietHoaDon;
import com.retail.domain.entity.HoaDon;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service tạo báo cáo doanh thu Excel với 6 sheets:
 * 1. Tổng quan (Overview)
 * 2. Doanh thu theo tháng (Monthly Revenue)
 * 3. Doanh số theo danh mục (Sales by Category)
 * 4. Sản phẩm bán chạy (Top Products)
 * 5. Chi tiết đơn hàng (Order Details)
 * 6. Thống kê theo ngày (Daily Statistics)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueReportService {

    private final HoaDonRepository hoaDonRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final BigDecimal PROFIT_PERCENTAGE = BigDecimal.valueOf(0.1); // 10%

    public byte[] generateRevenueReportExcel(LocalDate startDate, LocalDate endDate) {
        log.info("Generating revenue report Excel from {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Lấy tất cả hóa đơn với chi tiết
        log.info("Querying invoices from {} to {} with status COMPLETED", startDateTime, endDateTime);
        List<HoaDon> invoices = hoaDonRepository.getInvoicesForRevenueReport(
                startDateTime, endDateTime, Status.COMPLETED
        );

        log.info("Found {} invoices to process", invoices.size());
        // Log dates of all invoices for debugging
        if (!invoices.isEmpty()) {
            Map<LocalDate, Long> invoicesByDate = invoices.stream()
                    .filter(inv -> inv.getNgayTao() != null)
                    .collect(Collectors.groupingBy(
                            inv -> inv.getNgayTao().toLocalDate(),
                            Collectors.counting()
                    ));
            log.info("Invoices by date: {}", invoicesByDate);
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // Tạo styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle percentageStyle = createPercentageStyle(workbook);
            CellStyle textStyle = createTextStyle(workbook);

            // Sheet 1: Tổng quan
            createOverviewSheet(workbook, invoices, startDate, endDate,
                    headerStyle, currencyStyle, numberStyle, dateStyle, textStyle);

            // Sheet 2: Doanh thu theo tháng
            createMonthlyRevenueSheet(workbook, invoices,
                    headerStyle, currencyStyle, numberStyle, textStyle);

            // Sheet 3: Doanh số theo danh mục
            createCategorySalesSheet(workbook, invoices,
                    headerStyle, currencyStyle, numberStyle, percentageStyle, textStyle);

            // Sheet 4: Sản phẩm bán chạy
            createTopProductsSheet(workbook, invoices,
                    headerStyle, currencyStyle, numberStyle, textStyle);

            // Sheet 5: Chi tiết đơn hàng
            createOrderDetailsSheet(workbook, invoices,
                    headerStyle, currencyStyle, numberStyle, dateStyle, textStyle);

            // Sheet 6: Thống kê theo ngày
            log.debug("Creating daily statistics sheet with {} invoices", invoices.size());
            createDailyStatisticsSheet(workbook, invoices,
                    headerStyle, currencyStyle, numberStyle, dateStyle, textStyle);

            workbook.write(baos);
            log.info("Revenue report Excel generated successfully, size: {} bytes", baos.size());

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating revenue report Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo doanh thu: " + e.getMessage(), e);
        }
    }

    // ========== SHEET 1: TỔNG QUAN ==========

    private void createOverviewSheet(Workbook workbook, List<HoaDon> invoices,
                                     LocalDate startDate, LocalDate endDate,
                                     CellStyle headerStyle, CellStyle currencyStyle,
                                     CellStyle numberStyle, CellStyle dateStyle, CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Tổng quan");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Chỉ số", "Giá trị"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Tính toán dữ liệu
        long totalOrders = invoices.size();
        BigDecimal totalRevenue = invoices.stream()
                .map(HoaDon::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDiscount = invoices.stream()
                .map(h -> h.getGiamGia() != null ? h.getGiamGia() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netRevenue = invoices.stream()
                .map(HoaDon::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalProfit = netRevenue.multiply(PROFIT_PERCENTAGE)
                .setScale(2, RoundingMode.HALF_UP);
        long totalCustomers = invoices.stream()
                .map(HoaDon::getKhachHang)
                .filter(Objects::nonNull)
                .map(kh -> kh.getId())
                .distinct()
                .count();
        BigDecimal averageOrderValue = totalOrders > 0
                ? netRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Data rows
        int rowNum = 1;
        rowNum = addOverviewRow(sheet, rowNum++, "Ngày bắt đầu", startDate.format(DATE_FORMATTER), textStyle, dateStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Ngày kết thúc", endDate.format(DATE_FORMATTER), textStyle, dateStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Tổng số đơn hàng", String.valueOf(totalOrders), textStyle, numberStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Tổng doanh thu", totalRevenue, textStyle, currencyStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Tổng giảm giá", totalDiscount, textStyle, currencyStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Doanh thu thực tế", netRevenue, textStyle, currencyStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Tổng lợi nhuận", totalProfit, textStyle, currencyStyle);
        rowNum = addOverviewRow(sheet, rowNum++, "Tổng số khách hàng", String.valueOf(totalCustomers), textStyle, numberStyle);
        addOverviewRow(sheet, rowNum, "Giá trị đơn hàng trung bình", averageOrderValue, textStyle, currencyStyle);

        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private int addOverviewRow(Sheet sheet, int rowNum, String label, Object value,
                               CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);

        Cell valueCell = row.createCell(1);
        if (value instanceof BigDecimal) {
            valueCell.setCellValue(((BigDecimal) value).doubleValue());
            valueCell.setCellStyle(valueStyle);
        } else {
            valueCell.setCellValue(value.toString());
            valueCell.setCellStyle(valueStyle);
        }
        return rowNum;
    }

    // ========== SHEET 2: DOANH THU THEO THÁNG ==========

    private void createMonthlyRevenueSheet(Workbook workbook, List<HoaDon> invoices,
                                           CellStyle headerStyle, CellStyle currencyStyle,
                                           CellStyle numberStyle, CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Doanh thu theo tháng");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Tháng", "Doanh thu", "Số đơn hàng", "Lợi nhuận"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Nhóm theo tháng
        Map<String, MonthlyData> monthlyData = new TreeMap<>();
        for (HoaDon invoice : invoices) {
            String month = invoice.getNgayTao().format(MONTH_FORMATTER);
            MonthlyData data = monthlyData.computeIfAbsent(month, k -> new MonthlyData());
            data.revenue = data.revenue.add(invoice.getThanhTien());
            data.orders++;
            data.profit = data.profit.add(invoice.getThanhTien().multiply(PROFIT_PERCENTAGE));
        }

        // Data rows
        int rowNum = 1;
        for (Map.Entry<String, MonthlyData> entry : monthlyData.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Tháng " + entry.getKey());
            row.getCell(0).setCellStyle(textStyle);

            MonthlyData data = entry.getValue();
            Cell revenueCell = row.createCell(1);
            revenueCell.setCellValue(data.revenue.doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            Cell ordersCell = row.createCell(2);
            ordersCell.setCellValue(data.orders);
            ordersCell.setCellStyle(numberStyle);

            Cell profitCell = row.createCell(3);
            profitCell.setCellValue(data.profit.setScale(2, RoundingMode.HALF_UP).doubleValue());
            profitCell.setCellStyle(currencyStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private static class MonthlyData {
        BigDecimal revenue = BigDecimal.ZERO;
        int orders = 0;
        BigDecimal profit = BigDecimal.ZERO;
    }

    // ========== SHEET 3: DOANH SỐ THEO DANH MỤC ==========

    private void createCategorySalesSheet(Workbook workbook, List<HoaDon> invoices,
                                          CellStyle headerStyle, CellStyle currencyStyle,
                                          CellStyle numberStyle, CellStyle percentageStyle,
                                          CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Doanh số theo danh mục");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Danh mục", "Doanh thu", "Số lượng", "Tỷ lệ %"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Tính tổng doanh thu và nhóm theo danh mục
        Map<String, CategoryData> categoryData = new LinkedHashMap<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (HoaDon invoice : invoices) {
            for (ChiTietHoaDon detail : invoice.getChiTietHoaDons()) {
                SanPham product = detail.getSanPham();
                String category = product.getDanhMuc() != null
                        ? product.getDanhMuc().getTenDanhMuc()
                        : "Không phân loại";

                CategoryData data = categoryData.computeIfAbsent(category, k -> new CategoryData());
                BigDecimal itemRevenue = detail.getThanhTien();
                data.revenue = data.revenue.add(itemRevenue);
                data.quantity += detail.getSoLuong();
                totalRevenue = totalRevenue.add(itemRevenue);
            }
        }

        // Tính phần trăm
        for (CategoryData data : categoryData.values()) {
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                data.percentage = data.revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }

        // Data rows (sắp xếp theo doanh thu giảm dần)
        List<Map.Entry<String, CategoryData>> sortedEntries = categoryData.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().revenue.compareTo(e1.getValue().revenue))
                .collect(Collectors.toList());

        int rowNum = 1;
        for (Map.Entry<String, CategoryData> entry : sortedEntries) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.getCell(0).setCellStyle(textStyle);

            CategoryData data = entry.getValue();
            Cell revenueCell = row.createCell(1);
            revenueCell.setCellValue(data.revenue.doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            Cell quantityCell = row.createCell(2);
            quantityCell.setCellValue(data.quantity);
            quantityCell.setCellStyle(numberStyle);

            Cell percentageCell = row.createCell(3);
            percentageCell.setCellValue(data.percentage.doubleValue() / 100.0);
            percentageCell.setCellStyle(percentageStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private static class CategoryData {
        BigDecimal revenue = BigDecimal.ZERO;
        int quantity = 0;
        BigDecimal percentage = BigDecimal.ZERO;
    }

    // ========== SHEET 4: SẢN PHẨM BÁN CHẠY ==========

    private void createTopProductsSheet(Workbook workbook, List<HoaDon> invoices,
                                        CellStyle headerStyle, CellStyle currencyStyle,
                                        CellStyle numberStyle, CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Sản phẩm bán chạy");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Hạng", "Mã sản phẩm", "Tên sản phẩm", "Danh mục",
                "Số lượng bán", "Doanh thu", "Giá trung bình"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Nhóm theo sản phẩm
        Map<Long, ProductData> productData = new HashMap<>();
        for (HoaDon invoice : invoices) {
            for (ChiTietHoaDon detail : invoice.getChiTietHoaDons()) {
                SanPham product = detail.getSanPham();
                ProductData data = productData.computeIfAbsent(product.getId(), k -> {
                    ProductData pd = new ProductData();
                    pd.maSanPham = product.getMaSanPham();
                    pd.tenSanPham = product.getTenSanPham();
                    pd.tenDanhMuc = product.getDanhMuc() != null
                            ? product.getDanhMuc().getTenDanhMuc()
                            : "Không phân loại";
                    return pd;
                });
                data.totalQuantity += detail.getSoLuong();
                data.totalRevenue = data.totalRevenue.add(detail.getThanhTien());
            }
        }

        // Tính giá trung bình và sắp xếp
        List<ProductData> sortedProducts = productData.values().stream()
                .peek(data -> {
                    if (data.totalQuantity > 0) {
                        data.averagePrice = data.totalRevenue.divide(
                                BigDecimal.valueOf(data.totalQuantity), 2, RoundingMode.HALF_UP);
                    }
                })
                .sorted((p1, p2) -> p2.totalRevenue.compareTo(p1.totalRevenue))
                .limit(20)
                .collect(Collectors.toList());

        // Data rows
        int rowNum = 1;
        int rank = 1;
        for (ProductData data : sortedProducts) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rank++);
            row.getCell(0).setCellStyle(numberStyle);

            row.createCell(1).setCellValue(data.maSanPham);
            row.getCell(1).setCellStyle(textStyle);

            row.createCell(2).setCellValue(data.tenSanPham);
            row.getCell(2).setCellStyle(textStyle);

            row.createCell(3).setCellValue(data.tenDanhMuc);
            row.getCell(3).setCellStyle(textStyle);

            Cell quantityCell = row.createCell(4);
            quantityCell.setCellValue(data.totalQuantity);
            quantityCell.setCellStyle(numberStyle);

            Cell revenueCell = row.createCell(5);
            revenueCell.setCellValue(data.totalRevenue.doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            Cell avgPriceCell = row.createCell(6);
            avgPriceCell.setCellValue(data.averagePrice.doubleValue());
            avgPriceCell.setCellStyle(currencyStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private static class ProductData {
        String maSanPham;
        String tenSanPham;
        String tenDanhMuc;
        int totalQuantity = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal averagePrice = BigDecimal.ZERO;
    }

    // ========== SHEET 5: CHI TIẾT ĐƠN HÀNG ==========

    private void createOrderDetailsSheet(Workbook workbook, List<HoaDon> invoices,
                                         CellStyle headerStyle, CellStyle currencyStyle,
                                         CellStyle numberStyle, CellStyle dateStyle, CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Chi tiết đơn hàng");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Mã hóa đơn", "Ngày tạo", "Tên khách hàng", "Tổng tiền",
                "Giảm giá", "Thành tiền", "Phương thức thanh toán", "Trạng thái", "Điểm tích lũy"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows (đã sắp xếp theo ngayTao DESC từ query)
        int rowNum = 1;
        for (HoaDon invoice : invoices) {
            Row row = sheet.createRow(rowNum++);

            row.createCell(0).setCellValue(invoice.getMaHoaDon());
            row.getCell(0).setCellStyle(textStyle);

            Cell dateCell = row.createCell(1);
            dateCell.setCellValue(invoice.getNgayTao().format(DATE_FORMATTER) + " " +
                    invoice.getNgayTao().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            dateCell.setCellStyle(dateStyle);

            String customerName = invoice.getKhachHang() != null
                    ? invoice.getKhachHang().getTenKhachHang()
                    : "Khách vãng lai";
            row.createCell(2).setCellValue(customerName);
            row.getCell(2).setCellStyle(textStyle);

            Cell tongTienCell = row.createCell(3);
            tongTienCell.setCellValue(invoice.getTongTien().doubleValue());
            tongTienCell.setCellStyle(currencyStyle);

            Cell giamGiaCell = row.createCell(4);
            giamGiaCell.setCellValue(invoice.getGiamGia() != null
                    ? invoice.getGiamGia().doubleValue() : 0);
            giamGiaCell.setCellStyle(currencyStyle);

            Cell thanhTienCell = row.createCell(5);
            thanhTienCell.setCellValue(invoice.getThanhTien().doubleValue());
            thanhTienCell.setCellStyle(currencyStyle);

            row.createCell(6).setCellValue(invoice.getPhuongThucThanhToan() != null
                    ? invoice.getPhuongThucThanhToan() : "");
            row.getCell(6).setCellStyle(textStyle);

            row.createCell(7).setCellValue(invoice.getTrangThai().name());
            row.getCell(7).setCellStyle(textStyle);

            Cell diemCell = row.createCell(8);
            diemCell.setCellValue(invoice.getDiemTichLuy() != null
                    ? invoice.getDiemTichLuy().intValue() : 0);
            diemCell.setCellStyle(numberStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // ========== SHEET 6: THỐNG KÊ THEO NGÀY ==========

    private void createDailyStatisticsSheet(Workbook workbook, List<HoaDon> invoices,
                                            CellStyle headerStyle, CellStyle currencyStyle,
                                            CellStyle numberStyle, CellStyle dateStyle,
                                            CellStyle textStyle) {
        Sheet sheet = workbook.createSheet("Thống kê theo ngày");

        // Header
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Ngày", "Số đơn hàng", "Doanh thu", "Lợi nhuận",
                "Số khách hàng", "Giá trị đơn hàng TB"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Nhóm theo ngày - sử dụng TreeMap để tự động sắp xếp theo ngày
        Map<LocalDate, DailyData> dailyData = new TreeMap<>();
        for (HoaDon invoice : invoices) {
            if (invoice.getNgayTao() != null) {
                LocalDate date = invoice.getNgayTao().toLocalDate();
                log.debug("Processing invoice {} with date: {}", invoice.getMaHoaDon(), date);
                DailyData data = dailyData.computeIfAbsent(date, k -> {
                    log.debug("Creating new DailyData for date: {}", date);
                    return new DailyData();
                });
                data.orders++;
                data.revenue = data.revenue.add(invoice.getThanhTien());
                data.profit = data.profit.add(invoice.getThanhTien().multiply(PROFIT_PERCENTAGE));
                if (invoice.getKhachHang() != null) {
                    data.customerIds.add(invoice.getKhachHang().getId());
                }
                log.debug("Updated DailyData for date {}: orders={}, revenue={}", 
                        date, data.orders, data.revenue);
            } else {
                log.warn("Invoice {} has null ngayTao", invoice.getMaHoaDon());
            }
        }

        log.info("Daily statistics: Found {} unique dates from {} invoices", dailyData.size(), invoices.size());
        log.info("Daily statistics dates: {}", dailyData.keySet());

        // Tính giá trị đơn hàng TB cho mỗi ngày
        for (DailyData data : dailyData.values()) {
            if (data.orders > 0) {
                data.averageOrderValue = data.revenue.divide(
                        BigDecimal.valueOf(data.orders), 2, RoundingMode.HALF_UP);
            }
        }

        // Data rows - TreeMap đã sắp xếp theo ngày tăng dần
        int rowNum = 1;
        for (Map.Entry<LocalDate, DailyData> entry : dailyData.entrySet()) {
            LocalDate date = entry.getKey();
            DailyData data = entry.getValue();
            
            log.debug("Creating row for date {}: orders={}, revenue={}, customers={}", 
                    date, data.orders, data.revenue, data.customerIds.size());
            
            Row row = sheet.createRow(rowNum++);

            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(date.format(DATE_FORMATTER));
            dateCell.setCellStyle(dateStyle);

            Cell ordersCell = row.createCell(1);
            ordersCell.setCellValue(data.orders);
            ordersCell.setCellStyle(numberStyle);

            Cell revenueCell = row.createCell(2);
            revenueCell.setCellValue(data.revenue.doubleValue());
            revenueCell.setCellStyle(currencyStyle);

            Cell profitCell = row.createCell(3);
            profitCell.setCellValue(data.profit.setScale(2, RoundingMode.HALF_UP).doubleValue());
            profitCell.setCellStyle(currencyStyle);

            Cell customersCell = row.createCell(4);
            customersCell.setCellValue(data.customerIds.size());
            customersCell.setCellStyle(numberStyle);

            Cell avgCell = row.createCell(5);
            avgCell.setCellValue(data.averageOrderValue.doubleValue());
            avgCell.setCellStyle(currencyStyle);
        }

        log.info("Daily statistics: Created {} rows in Excel sheet for dates: {}", 
                rowNum - 1, dailyData.keySet());

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private static class DailyData {
        int orders = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal profit = BigDecimal.ZERO;
        Set<Long> customerIds = new HashSet<>();
        BigDecimal averageOrderValue = BigDecimal.ZERO;
    }

    // ========== STYLES ==========

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        
        // Use custom color #F97316 (RGB: 249, 115, 22)
        if (workbook instanceof XSSFWorkbook) {
            XSSFCellStyle xssfStyle = (XSSFCellStyle) style;
            XSSFColor orangeColor = new XSSFColor(new byte[]{(byte) 249, (byte) 115, (byte) 22}, null);
            xssfStyle.setFillForegroundColor(orangeColor);
        } else {
            // Fallback to indexed color if not XSSF
            style.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
        }
        
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00\" ₫\""));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createPercentageStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00%"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createTextStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        return style;
    }
}
