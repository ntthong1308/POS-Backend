package com.retail.application.service.report;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.ChiTietHoaDon;
import com.retail.domain.entity.HoaDon;
import com.retail.persistence.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import javax.imageio.ImageIO;

/**
 * Service tạo hóa đơn PDF theo mẫu Alltime Coffee - Giống y hệt mẫu thực tế
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfInvoiceService {

    private final HoaDonRepository hoaDonRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // Font variables
    private PdfFont vietnameseFont;
    private PdfFont vietnameseFontBold;

    public byte[] generateInvoicePdf(Long invoiceId) {
        log.info("Generating PDF for invoice ID: {}", invoiceId);

        HoaDon invoice = hoaDonRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        return generatePdfContent(invoice);
    }

    private byte[] generatePdfContent(HoaDon invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Load Vietnamese font
            loadVietnameseFont();
            document.setFont(vietnameseFont);
            document.setMargins(15, 15, 15, 15);

            // Build invoice content theo đúng mẫu
            addLogo(document);  // ✅ Thêm logo ở đầu
            addTitleAndInvoiceNumber(document, invoice);
            addInvoiceInfo(document, invoice);
            addLineItemsTable(document, invoice);
            addPaymentSummary(document, invoice);
            addStoreInfo(document, invoice);
            addPromotionSection(document);
            addFooter(document);

            document.close();

            log.info("PDF generated successfully for invoice: {}, size: {} bytes",
                    invoice.getMaHoaDon(), baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF for invoice: {}", invoice.getMaHoaDon(), e);
            throw new RuntimeException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Load Vietnamese font from resources
     */
    private void loadVietnameseFont() {
        try {
            ClassPathResource regularFont = new ClassPathResource("fonts/Roboto-Regular.ttf");
            ClassPathResource boldFont = new ClassPathResource("fonts/Roboto-Bold.ttf");

            try (InputStream regularIs = regularFont.getInputStream();
                 InputStream boldIs = boldFont.getInputStream()) {

                byte[] regularBytes = regularIs.readAllBytes();
                byte[] boldBytes = boldIs.readAllBytes();

                vietnameseFont = PdfFontFactory.createFont(
                        regularBytes,
                        PdfEncodings.IDENTITY_H,
                        PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
                );

                vietnameseFontBold = PdfFontFactory.createFont(
                        boldBytes,
                        PdfEncodings.IDENTITY_H,
                        PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
                );

                log.info("Vietnamese fonts loaded successfully");
            }
        } catch (Exception e) {
            log.error("Failed to load Vietnamese fonts, using default", e);
            vietnameseFont = null;
            vietnameseFontBold = null;
        }
    }

    /**
     * Thêm logo ở đầu hóa đơn (bo tròn)
     */
    private void addLogo(Document document) {
        try {
            // Tìm logo trong resources/images/logo.png hoặc logo.jpg
            ClassPathResource logoResource = null;
            
            // Thử các format phổ biến
            String[] logoPaths = {
                "images/logo.png",
                "images/logo.jpg",
                "images/logo.jpeg",
                "images/alltime-logo.png",
                "images/alltime-logo.jpg"
            };
            
            for (String path : logoPaths) {
                try {
                    ClassPathResource resource = new ClassPathResource(path);
                    if (resource.exists()) {
                        logoResource = resource;
                        break;
                    }
                } catch (Exception e) {
                    // Continue to next path
                }
            }
            
            if (logoResource != null && logoResource.exists()) {
                try (InputStream logoIs = logoResource.getInputStream()) {
                    Image logo = new Image(ImageDataFactory.create(logoIs.readAllBytes()));
                    
                    // Bo tròn logo: Set width và height bằng nhau
                    float logoSize = 60f; // Kích thước logo (có thể điều chỉnh)
                    logo.setWidth(logoSize);
                    logo.setHeight(logoSize);
                    
                    // Center align
                    logo.setHorizontalAlignment(HorizontalAlignment.CENTER);
                    logo.setMarginBottom(5);
                    
                    document.add(logo);
                    log.debug("Logo added successfully from: {}", logoResource.getPath());
                }
            } else {
                log.warn("Logo not found in resources/images/ - Skipping logo");
            }
        } catch (Exception e) {
            log.warn("Failed to load logo: {} - Continuing without logo", e.getMessage());
        }
    }

    /**
     * Extract thông tin khuyến mãi từ ghiChu
     * Format: "Khuyến mãi: Tên mã (Mã)" hoặc "Khuyến mãi: Tên mã1 (Mã1), Tên mã2 (Mã2)"
     */
    private String extractPromotionInfo(String ghiChu) {
        if (ghiChu == null || ghiChu.trim().isEmpty()) {
            return null;
        }
        
        // Tìm phần "Khuyến mãi: ..."
        if (ghiChu.contains("Khuyến mãi:")) {
            String promotionPart = ghiChu.substring(ghiChu.indexOf("Khuyến mãi:") + "Khuyến mãi:".length()).trim();
            
            // Lấy phần trước "|" nếu có (để bỏ phần ghi chú khác)
            if (promotionPart.contains("|")) {
                promotionPart = promotionPart.substring(0, promotionPart.indexOf("|")).trim();
            }
            
            // Trả về danh sách tên mã khuyến mãi
            if (!promotionPart.isEmpty()) {
                return promotionPart;
            }
        }
        
        return null;
    }

    /**
     * Title: HÓA ĐƠN THANH TOÁN + SỐ HĐ (format 6 số như mẫu: 070836)
     */
    private void addTitleAndInvoiceNumber(Document document, HoaDon invoice) {
        // HÓA ĐƠN THANH TOÁN
        Paragraph title = new Paragraph("HÓA ĐƠN THANH TOÁN")
                .setFont(vietnameseFontBold)
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(3);

        // SỐ HĐ: 070836 (format 6 số, lấy 6 số cuối của ID)
        String soHD = String.format("%06d", invoice.getId() % 1000000);
        Paragraph invoiceNumber = new Paragraph("SỐ HĐ: " + soHD)
                .setFont(vietnameseFont)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(8);

        document.add(title);
        document.add(invoiceNumber);
    }

    /**
     * Thông tin hóa đơn: Mã HĐ, Bàn, Ngày, ODER TỰ ĐỘNG, Giờ vào | TN, Giờ ra
     */
    private void addInvoiceInfo(Document document, HoaDon invoice) {
        Table infoTable = new Table(2);
        infoTable.setWidth(UnitValue.createPercentValue(100));
        infoTable.setBorder(Border.NO_BORDER);
        infoTable.setFont(vietnameseFont);
        infoTable.setFontSize(9);

        LocalDateTime ngayTao = invoice.getNgayTao();
        String date = ngayTao.format(DATE_FORMATTER);
        String timeIn = ngayTao.format(TIME_FORMATTER);
        String timeOut = LocalDateTime.now().format(TIME_FORMATTER);

        // Lấy thông tin bàn từ ghi chú (nếu có)
        String banInfo = "";
        if (invoice.getGhiChu() != null && invoice.getGhiChu().contains("Bàn:")) {
            // Parse từ ghi chú: "Bàn: A-128 | Loại: Dine-in"
            String[] parts = invoice.getGhiChu().split("\\|");
            if (parts.length > 0) {
                banInfo = parts[0].replace("Bàn:", "").trim();
            }
        }

        // Cột trái
        Cell leftCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("Mã HĐ: #" + (invoice.getMaHoaDon() != null ? 
                        invoice.getMaHoaDon().substring(Math.max(0, invoice.getMaHoaDon().length() - 5)) : "")));

        // Bàn + Tại Chỗ + Ngày (theo mẫu: "Bàn: BAN27 - Tại Chỗ")
        if (!banInfo.isEmpty()) {
            leftCell.add(new Paragraph("Bàn: " + banInfo + " - Tại Chỗ"));
        }
        leftCell.add(new Paragraph("Giờ vào: : " + timeIn))
                .add(new Paragraph("TN: " + (invoice.getNhanVien() != null ?
                        invoice.getNhanVien().getTenNhanVien() : "N/A")))
                .add(new Paragraph("Ngày: " + date));

        // Cột phải
        Cell rightCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("Giờ ra: " + timeOut));

        infoTable.addCell(leftCell);
        infoTable.addCell(rightCell);
        document.add(infoTable);
        document.add(new Paragraph().setMarginBottom(5));
    }

    /**
     * Bảng sản phẩm: STT, Tên món, SL, Đơn giá, Thành tiền
     */
    private void addLineItemsTable(Document document, HoaDon invoice) {
        float[] columnWidths = {0.7f, 3.5f, 1f, 1.8f, 1.8f};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setFont(vietnameseFont);
        table.setFontSize(9);

        // Header
        addTableHeader(table, "STT");
        addTableHeader(table, "Tên món");
        addTableHeader(table, "SL");
        addTableHeader(table, "Đơn giá");
        addTableHeader(table, "Thành tiền");

        // Data rows
        int stt = 1;
        for (ChiTietHoaDon item : invoice.getChiTietHoaDons()) {
            String productName = item.getSanPham() != null ?
                    item.getSanPham().getTenSanPham() : "N/A";

            addTableCell(table, String.valueOf(stt++), TextAlignment.CENTER);
            addTableCell(table, productName, TextAlignment.LEFT);
            addTableCell(table, String.valueOf(item.getSoLuong()), TextAlignment.CENTER);
            addTableCell(table, formatCurrencyComma(item.getDonGia()), TextAlignment.RIGHT);
            addTableCell(table, formatCurrencyComma(item.getThanhTien()), TextAlignment.RIGHT);
        }

        document.add(table);
        document.add(new Paragraph().setMarginBottom(5));
    }

    /**
     * Tổng kết: Thành tiền, Tổng tiền, +Thanh toán, Tiền nhận, Tiền thừa
     */
    private void addPaymentSummary(Document document, HoaDon invoice) {
        Table summaryTable = new Table(2);
        summaryTable.setWidth(UnitValue.createPercentValue(100));
        summaryTable.setBorder(Border.NO_BORDER);
        summaryTable.setFont(vietnameseFont);
        summaryTable.setFontSize(9);

        BigDecimal tongTien = invoice.getTongTien() != null ? invoice.getTongTien() : BigDecimal.ZERO;
        BigDecimal giamGia = invoice.getGiamGia() != null ? invoice.getGiamGia() : BigDecimal.ZERO;
        BigDecimal thanhTien = invoice.getThanhTien() != null ? invoice.getThanhTien() : BigDecimal.ZERO;

        // Thành tiền
        addSummaryRow(summaryTable, "Thành tiền", formatCurrencyComma(tongTien));

        // Giảm giá (nếu có) - Hiển thị chi tiết khuyến mãi
        if (giamGia.compareTo(BigDecimal.ZERO) > 0) {
            String discountLabel = "Giảm giá";
            // Parse thông tin khuyến mãi từ ghiChu
            String promotionInfo = extractPromotionInfo(invoice.getGhiChu());
            if (promotionInfo != null && !promotionInfo.isEmpty()) {
                discountLabel = "Giảm giá (" + promotionInfo + ")";
            }
            addSummaryRow(summaryTable, discountLabel, "-" + formatCurrencyComma(giamGia));
        }

        // Tổng tiền
        addSummaryRow(summaryTable, "Tổng tiền", formatCurrencyComma(thanhTien));

        // Phương thức thanh toán (theo mẫu: "+Thanh toán (Momo QR đa năng)")
        String paymentMethod = getPaymentMethodDisplay(invoice.getPhuongThucThanhToan());
        addSummaryRow(summaryTable, "+Thanh toán (" + paymentMethod + ")", formatCurrencyComma(thanhTien));

        // Tiền nhận (không có dấu ":")
        addSummaryRow(summaryTable, "Tiền nhận", formatCurrencyComma(thanhTien));

        // Tiền thừa (không có dấu ":")
        addSummaryRow(summaryTable, "Tiền thừa", formatCurrencyComma(BigDecimal.ZERO));

        document.add(summaryTable);
        document.add(new Paragraph().setMarginBottom(8));
    }

    /**
     * Thông tin cửa hàng: Alltime Coffee + địa chỉ
     */
    private void addStoreInfo(Document document, HoaDon invoice) {
        // Tên cửa hàng
        Paragraph storeName = new Paragraph("Alltime Coffee")
                .setFont(vietnameseFontBold)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(3);
        document.add(storeName);

        // Địa chỉ
        if (invoice.getChiNhanh() != null && invoice.getChiNhanh().getDiaChi() != null) {
            Paragraph address = new Paragraph("Địa chỉ: " + invoice.getChiNhanh().getDiaChi())
                    .setFont(vietnameseFont)
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(8);
            document.add(address);
        }
    }

    /**
     * Phần khuyến mãi thành viên (có thể config sau)
     */
    private void addPromotionSection(Document document) {
        Paragraph promotionTitle = new Paragraph("ƯU ĐÃI THÀNH VIÊN NHÀ CÚ:")
                .setFont(vietnameseFontBold)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(2);
        document.add(promotionTitle);

        Paragraph promotion1 = new Paragraph("NHẬN VOUCHER 15% MỖI KHI LẦN ĐẦU CÁN")
                .setFont(vietnameseFontBold)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(1);
        document.add(promotion1);

        Paragraph promotion2 = new Paragraph("MỐC TÍCH LŨY 500 ĐIỂM")
                .setFont(vietnameseFontBold)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(2);
        document.add(promotion2);

        Paragraph qrInstruction = new Paragraph("Quét QR & nhấp \"Quan tâm\" để đăng ký Thành viên")
                .setFont(vietnameseFont)
                .setFontSize(7)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(qrInstruction);

        // Generate QR code (link đăng ký thành viên - có thể config sau)
        String qrContent = "https://alltimecoffee.vn/dang-ky-thanh-vien"; // Có thể lấy từ config
        Image qrCode = generateQRCode(qrContent, 200);
        if (qrCode != null) {
            document.add(qrCode.setMarginBottom(8));
        } else {
            // Fallback nếu không tạo được QR code
            Paragraph qrPlaceholder = new Paragraph("[QR CODE]")
                    .setFont(vietnameseFont)
                    .setFontSize(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(8);
            document.add(qrPlaceholder);
        }
    }

    /**
     * Footer: Wifi info + Powered by
     */
    private void addFooter(Document document) {
        // Wifi info
        Paragraph wifiInfo = new Paragraph("Wifi: All-Time/ Password: Alltime2424")
                .setFont(vietnameseFont)
                .setFontSize(7)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(3);
        document.add(wifiInfo);

        // Powered by
        Paragraph poweredBy = new Paragraph("Powered by iPOS.vn")
                .setFont(vietnameseFont)
                .setFontSize(7)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(poweredBy);
    }

    /**
     * Helper: Add table header cell
     */
    private void addTableHeader(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setFont(vietnameseFontBold))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(4)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f));
        table.addHeaderCell(cell);
    }

    /**
     * Helper: Add table data cell
     */
    private void addTableCell(Table table, String text, TextAlignment alignment) {
        Cell cell = new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(alignment)
                .setPadding(3)
                .setBorder(new SolidBorder(ColorConstants.BLACK, 0.5f));
        table.addCell(cell);
    }

    /**
     * Helper: Add summary row (không có dấu ":" ở cuối label)
     */
    private void addSummaryRow(Table table, String label, String value) {
        table.addCell(new Cell()
                .add(new Paragraph(label))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.LEFT)
                .setPadding(1));

        table.addCell(new Cell()
                .add(new Paragraph(value))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(1));
    }

    /**
     * Helper: Format currency với dấu phẩy (52,000 ₫)
     */
    private String formatCurrencyComma(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        long longValue = amount.longValue();
        // Format: 52000 -> "52,000"
        String formatted = String.format("%,d", longValue);
        return formatted + " ₫";
    }

    /**
     * Helper: Get payment method display name (theo mẫu Alltime Coffee)
     */
    private String getPaymentMethodDisplay(String method) {
        if (method == null) return "Tiền mặt";
        
        switch (method.toUpperCase()) {
            case "TIEN_MAT":
            case "CASH":
                return "Tiền mặt";
            case "THE":
            case "CARD":
                return "Thẻ";
            case "MOMO":
            case "MOMO QR ĐA NĂNG":
                return "Momo QR đa năng";
            case "ZALOPAY":
                return "ZaloPay";
            case "CHUYEN_KHOAN":
            case "BANK_TRANSFER":
                return "Chuyển khoản";
            case "QR_CODE":
                return "QR Code";
            case "E_WALLET":
                return "Ví điện tử";
            default:
                return method;
        }
    }

    /**
     * Generate QR Code image for member registration
     */
    private Image generateQRCode(String content, int size) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, size, size, hints);

            BufferedImage qrImage = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
            qrImage.createGraphics();

            Graphics2D graphics = (Graphics2D) qrImage.getGraphics();
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, size, size);
            graphics.setColor(Color.BLACK);

            for (int i = 0; i < size; i++) {
                for (int j = 0; j < size; j++) {
                    if (bitMatrix.get(i, j)) {
                        graphics.fillRect(i, j, 1, 1);
                    }
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();

            return new Image(ImageDataFactory.create(imageBytes))
                    .setWidth(80)
                    .setHeight(80)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);

        } catch (Exception e) {
            log.error("Failed to generate QR code: {}", e.getMessage());
            return null;
        }
    }
}