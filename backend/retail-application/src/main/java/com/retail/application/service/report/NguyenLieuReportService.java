package com.retail.application.service.report;

import com.retail.application.dto.NguyenLieuDTO;
import com.retail.application.dto.PhieuNhapXuatNguyenLieuDTO;
import com.retail.application.service.nguyenlieu.NguyenLieuService;
import com.retail.common.constant.Status;
import com.retail.domain.entity.NguyenLieu;
import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import com.retail.persistence.repository.NguyenLieuRepository;
import com.retail.persistence.repository.PhieuNhapXuatNguyenLieuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service xuất báo cáo Excel cho nguyên liệu
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NguyenLieuReportService {

    private final NguyenLieuRepository nguyenLieuRepository;
    private final PhieuNhapXuatNguyenLieuRepository phieuRepository;

    /**
     * Xuất Excel danh sách nguyên liệu tồn kho
     */
    @Transactional(readOnly = true)
    public byte[] exportTonKhoExcel() {
        log.info("Exporting ton kho Excel for nguyen lieu");

        try {
            List<NguyenLieu> nguyenLieuList = nguyenLieuRepository.findByTrangThaiWithChiNhanh(Status.ACTIVE);
            log.info("Retrieved {} nguyen lieu for ton kho report", nguyenLieuList.size());

            byte[] excelBytes = generateTonKhoExcel(nguyenLieuList);
            log.info("Ton kho Excel generated, size: {} bytes", excelBytes.length);

            return excelBytes;

        } catch (Exception e) {
            log.error("Error generating ton kho Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo tồn kho nguyên liệu: " + e.getMessage(), e);
        }
    }

    /**
     * Xuất Excel bảng nhập kho
     */
    @Transactional(readOnly = true)
    public byte[] exportNhapKhoExcel() {
        log.info("Exporting nhap kho Excel for nguyen lieu");

        try {
            // Lấy tất cả phiếu nhập với JOIN FETCH
            List<PhieuNhapXuatNguyenLieu> phieuList = phieuRepository.findByLoaiPhieuWithDetails(
                    PhieuNhapXuatNguyenLieu.LoaiPhieu.NHAP);

            log.info("Retrieved {} phieu nhap for report", phieuList.size());

            byte[] excelBytes = generateNhapKhoExcel(phieuList);
            log.info("Nhap kho Excel generated, size: {} bytes", excelBytes.length);

            return excelBytes;

        } catch (Exception e) {
            log.error("Error generating nhap kho Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo nhập kho: " + e.getMessage(), e);
        }
    }

    /**
     * Xuất Excel bảng xuất kho
     */
    @Transactional(readOnly = true)
    public byte[] exportXuatKhoExcel() {
        log.info("Exporting xuat kho Excel for nguyen lieu");

        try {
            // Lấy tất cả phiếu xuất với JOIN FETCH
            List<PhieuNhapXuatNguyenLieu> phieuList = phieuRepository.findByLoaiPhieuWithDetails(
                    PhieuNhapXuatNguyenLieu.LoaiPhieu.XUAT);

            log.info("Retrieved {} phieu xuat for report", phieuList.size());

            byte[] excelBytes = generateXuatKhoExcel(phieuList);
            log.info("Xuat kho Excel generated, size: {} bytes", excelBytes.length);

            return excelBytes;

        } catch (Exception e) {
            log.error("Error generating xuat kho Excel", e);
            throw new RuntimeException("Không thể tạo báo cáo xuất kho: " + e.getMessage(), e);
        }
    }

    // ========== Private methods for generating Excel ==========

    /**
     * Tạo Excel danh sách tồn kho
     */
    private byte[] generateTonKhoExcel(List<NguyenLieu> nguyenLieuList) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Danh sách tồn kho");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);

            int rowNum = 0;

            // Tiêu đề
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("DANH SÁCH NGUYÊN LIỆU TỒN KHO");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 5));

            // Ngày
            Row dateRow = sheet.createRow(rowNum++);
            Cell dateCell = dateRow.createCell(0);
            String currentDate = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            dateCell.setCellValue("Ngày tạo: " + currentDate);

            rowNum++; // Dòng trống

            // Header
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"STT", "Mã NL", "Tên nguyên liệu", "Đơn vị", "Số lượng", "Chi nhánh"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int stt = 1;
            for (NguyenLieu nl : nguyenLieuList) {
                Row row = sheet.createRow(rowNum++);
                
                createCell(row, 0, stt++, dataStyle);
                createCell(row, 1, nl.getMaNguyenLieu(), dataStyle);
                createCell(row, 2, nl.getTenNguyenLieu(), dataStyle);
                createCell(row, 3, nl.getDonViTinh() != null ? nl.getDonViTinh() : "", dataStyle);
                createCell(row, 4, nl.getSoLuong() != null ? nl.getSoLuong() : 0, dataStyle);
                createCell(row, 5, nl.getChiNhanh() != null ? nl.getChiNhanh().getTenChiNhanh() : "", dataStyle);
            }

            // Auto size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Tạo Excel bảng nhập kho
     */
    private byte[] generateNhapKhoExcel(List<PhieuNhapXuatNguyenLieu> phieuList) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Bảng nhập kho");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            int rowNum = 0;

            // Tiêu đề
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BẢNG NHẬP KHO NGUYÊN LIỆU");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

            // Ngày
            Row dateRow = sheet.createRow(rowNum++);
            Cell dateCell = dateRow.createCell(0);
            String currentDate = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            dateCell.setCellValue("Ngày tạo: " + currentDate);

            rowNum++; // Dòng trống

            // Header
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"STT", "Mã phiếu", "Ngày nhập", "Nguyên liệu", "Số lượng", "Nhân viên", "Ghi chú"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int stt = 1;
            for (PhieuNhapXuatNguyenLieu phieu : phieuList) {
                Row row = sheet.createRow(rowNum++);
                
                createCell(row, 0, stt++, dataStyle);
                createCell(row, 1, phieu.getMaPhieu(), dataStyle);
                
                Cell dateCellData = row.createCell(2);
                dateCellData.setCellValue(phieu.getNgayNhapXuat()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                dateCellData.setCellStyle(dateStyle);
                
                String tenNL = phieu.getNguyenLieu() != null ? phieu.getNguyenLieu().getTenNguyenLieu() : "";
                createCell(row, 3, tenNL, dataStyle);
                createCell(row, 4, phieu.getSoLuong(), dataStyle);
                
                String tenNV = phieu.getNhanVien() != null ? phieu.getNhanVien().getTenNhanVien() : "";
                createCell(row, 5, tenNV, dataStyle);
                createCell(row, 6, phieu.getGhiChu() != null ? phieu.getGhiChu() : "", dataStyle);
            }

            // Auto size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Tạo Excel bảng xuất kho
     */
    private byte[] generateXuatKhoExcel(List<PhieuNhapXuatNguyenLieu> phieuList) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Bảng xuất kho");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            int rowNum = 0;

            // Tiêu đề
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BẢNG XUẤT KHO NGUYÊN LIỆU");
            titleCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

            // Ngày
            Row dateRow = sheet.createRow(rowNum++);
            Cell dateCell = dateRow.createCell(0);
            String currentDate = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            dateCell.setCellValue("Ngày tạo: " + currentDate);

            rowNum++; // Dòng trống

            // Header
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"STT", "Mã phiếu", "Ngày xuất", "Nguyên liệu", "Số lượng", "Nhân viên", "Ghi chú"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int stt = 1;
            for (PhieuNhapXuatNguyenLieu phieu : phieuList) {
                Row row = sheet.createRow(rowNum++);
                
                createCell(row, 0, stt++, dataStyle);
                createCell(row, 1, phieu.getMaPhieu(), dataStyle);
                
                Cell dateCellData = row.createCell(2);
                dateCellData.setCellValue(phieu.getNgayNhapXuat()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                dateCellData.setCellStyle(dateStyle);
                
                String tenNL = phieu.getNguyenLieu() != null ? phieu.getNguyenLieu().getTenNguyenLieu() : "";
                createCell(row, 3, tenNL, dataStyle);
                createCell(row, 4, phieu.getSoLuong(), dataStyle);
                
                String tenNV = phieu.getNhanVien() != null ? phieu.getNhanVien().getTenNhanVien() : "";
                createCell(row, 5, tenNV, dataStyle);
                createCell(row, 6, phieu.getGhiChu() != null ? phieu.getGhiChu() : "", dataStyle);
            }

            // Auto size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    // ========== Helper methods ==========

    private void createCell(Row row, int column, Object value, CellStyle style) {
        Cell cell = row.createCell(column);
        if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        }
        if (style != null) {
            cell.setCellStyle(style);
        }
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

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}

