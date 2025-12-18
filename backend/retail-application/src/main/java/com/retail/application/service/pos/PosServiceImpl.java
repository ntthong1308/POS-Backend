package com.retail.application.service.pos;

import com.retail.application.dto.*;
import com.retail.application.mapper.InvoiceMapper;
import com.retail.application.mapper.ProductMapper;
import com.retail.application.service.product.ProductService;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.ChiNhanh;
import com.retail.domain.entity.ChiTietHoaDon;
import com.retail.domain.entity.HoaDon;
import com.retail.domain.entity.KhachHang;
import com.retail.domain.entity.NhanVien;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.ChiNhanhRepository;
import com.retail.persistence.repository.HoaDonRepository;
import com.retail.persistence.repository.KhachHangRepository;
import com.retail.persistence.repository.NhanVienRepository;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PosServiceImpl implements PosService {

    private final ProductService productService;
    private final SanPhamRepository sanPhamRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final ChiNhanhRepository chiNhanhRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ProductMapper productMapper;
    private final InvoiceMapper invoiceMapper;
    private final com.retail.application.service.promotion.PromotionService promotionService;

    @Override
    @Transactional(readOnly = true)
    public ProductDTO scanProduct(String barcode) {
        log.info("Scanning product with barcode: {}", barcode);
        return productService.findByBarcode(barcode);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateCart(List<CartItemDTO> items) {
        log.info("Validating cart with {} items", items.size());

        if (items == null || items.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Giỏ hàng trống");
        }

        for (CartItemDTO item : items) {
            SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getSanPhamId()));

            // Kiểm tra tồn kho
            if (sanPham.getTonKho() < item.getSoLuong()) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                        String.format("Sản phẩm '%s' không đủ tồn kho. Còn lại: %d",
                                sanPham.getTenSanPham(), sanPham.getTonKho()));
            }

            // Kiểm tra số lượng
            if (item.getSoLuong() <= 0) {
                throw new BusinessException(ErrorCode.INVALID_QUANTITY,
                        "Số lượng phải lớn hơn 0");
            }
        }

        log.info("Cart validation successful");
    }

    /**
     * Thanh toán và tạo hóa đơn - Xóa cache sau khi tạo để đảm bảo hóa đơn mới có thể truy cập ngay
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO checkout(CheckoutRequest request) {
        log.info("Processing checkout for {} items", request.getItems().size());

        // Kiểm tra giỏ hàng
        validateCart(request.getItems());

        // Load các entity
        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getChiNhanhId())
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", request.getChiNhanhId()));

        KhachHang khachHang = null;
        if (request.getKhachHangId() != null) {
            khachHang = khachHangRepository.findById(request.getKhachHangId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", request.getKhachHangId()));
        }

        // Tạo hóa đơn
        HoaDon hoaDon = HoaDon.builder()
                .maHoaDon(generateInvoiceCode())
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .chiNhanh(chiNhanh)
                .ngayTao(LocalDateTime.now())
                .giamGia(request.getGiamGia() != null ? request.getGiamGia() : BigDecimal.ZERO)
                .phuongThucThanhToan(request.getPhuongThucThanhToan())
                .ghiChu(request.getGhiChu())
                .trangThai(Status.COMPLETED)
                .build();

        // Tính tổng tiền
        BigDecimal tongTien = BigDecimal.ZERO;

        // Thêm chi tiết hóa đơn
        for (CartItemDTO item : request.getItems()) {
            SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getSanPhamId()));

            ChiTietHoaDon chiTiet = ChiTietHoaDon.builder()
                    .sanPham(sanPham)
                    .soLuong(item.getSoLuong())
                    .donGia(sanPham.getGiaBan())
                    .ghiChu(item.getGhiChu())
                    .build();

            chiTiet.calculateThanhTien();
            hoaDon.addChiTiet(chiTiet);

            tongTien = tongTien.add(chiTiet.getThanhTien());

            // Cập nhật tồn kho
            sanPham.setTonKho(sanPham.getTonKho() - item.getSoLuong());
            sanPhamRepository.save(sanPham);

            log.info("Updated stock for product {}: new stock = {}",
                    sanPham.getMaSanPham(), sanPham.getTonKho());
        }

        hoaDon.setTongTien(tongTien);

        // Áp dụng khuyến mãi - CHỈ áp dụng khi user chọn mã khuyến mãi
        BigDecimal promotionDiscount = BigDecimal.ZERO;
        AppliedPromotionDTO appliedPromotion = null;
        
        if (request.getMaKhuyenMai() != null && !request.getMaKhuyenMai().trim().isEmpty()) {
            try {
                appliedPromotion = promotionService.applyPromotionByCode(
                        request.getMaKhuyenMai(),
                        request.getChiNhanhId(),
                        request.getItems(),
                        tongTien);
                
                if (appliedPromotion != null) {
                    promotionDiscount = appliedPromotion.getDiscountAmount();
                    log.info("Applied promotion: {} - Discount: {}", 
                            request.getMaKhuyenMai(), promotionDiscount);
                }
            } catch (Exception e) {
                log.warn("Failed to apply promotion {}: {} - Continuing without promotion", 
                        request.getMaKhuyenMai(), e.getMessage());
                // Không throw exception, tiếp tục checkout mà không có promotion
            }
        }
        
        // Tổng giảm giá = giảm giá thủ công + giảm giá từ khuyến mãi (nếu có)
        BigDecimal totalDiscount = hoaDon.getGiamGia().add(promotionDiscount);
        hoaDon.setGiamGia(totalDiscount);
        
        // Lưu thông tin khuyến mãi vào ghiChu để hiển thị trong PDF
        if (appliedPromotion != null) {
            StringBuilder promotionInfo = new StringBuilder();
            if (hoaDon.getGhiChu() != null && !hoaDon.getGhiChu().trim().isEmpty()) {
                promotionInfo.append(hoaDon.getGhiChu()).append(" | ");
            }
            promotionInfo.append("Khuyến mãi: ")
                    .append(appliedPromotion.getTenKhuyenMai())
                    .append(" (").append(appliedPromotion.getMaKhuyenMai()).append(")");
            hoaDon.setGhiChu(promotionInfo.toString());
        }

        // Tính số tiền cuối cùng
        BigDecimal thanhTien = tongTien.subtract(hoaDon.getGiamGia());

        if (thanhTien.compareTo(BigDecimal.ZERO) < 0) {
            thanhTien = BigDecimal.ZERO;
        }

        hoaDon.setThanhTien(thanhTien);

        // Tính điểm tích lũy: 1.000 VND = 1 điểm (làm tròn đến số nguyên)
        BigDecimal diemTichLuy = thanhTien.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP);
        hoaDon.setDiemTichLuy(diemTichLuy);

        // Cập nhật điểm khách hàng
        if (khachHang != null) {
            // Thêm điểm mới (1.000 VND = 1 điểm)
            khachHang.setDiemTichLuy(
                    khachHang.getDiemTichLuy().add(diemTichLuy));

            khachHangRepository.save(khachHang);
            log.info("Updated customer points: {} (added {} points from {} VND - 1.000 VND = 1 điểm)", 
                    khachHang.getDiemTichLuy(), diemTichLuy, thanhTien);
        }

        // Lưu hóa đơn
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);
        log.info("Invoice created successfully: {} - Invoice cache cleared", savedInvoice.getMaHoaDon());

        // Cập nhật số lần sử dụng promotion (nếu có)
        if (appliedPromotion != null) {
            promotionService.incrementPromotionUsage(List.of(appliedPromotion.getPromotionId()));
            log.info("Updated promotion usage for promotion: {}", appliedPromotion.getMaKhuyenMai());
        }

        return invoiceMapper.toDto(savedInvoice);
    }

    /**
     * ⭐ CACHED - Get invoice by ID
     *
     * First call: Query database (slow ~200-500ms)
     * Subsequent calls: Get from Redis (fast ~10-50ms)
     * Cache TTL: 10 minutes
     *
     * Note: Invoices are relatively static once created, so caching is safe
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "#invoiceId", unless = "#result == null")
    public InvoiceDTO getInvoice(Long invoiceId) {
        log.info("Getting invoice by ID: {} - Checking cache first", invoiceId);

        HoaDon hoaDon = hoaDonRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        log.info("Invoice found from database: {} - Will be cached", invoiceId);
        return invoiceMapper.toDto(hoaDon);
    }

    /**
     * ⭐ CACHED - Get invoices by date (single date)
     *
     * Cache key: "date:{date}"
     * Cache TTL: 10 minutes
     *
     * Note: Cleared automatically when new invoices are created via checkout
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'date:' + #date")
    public List<InvoiceDTO> getInvoicesByDate(String date) {
        log.info("Getting invoices by date: {} - Checking cache first", date);
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByDateRange(
                startOfDay, endOfDay, Status.COMPLETED);

        List<InvoiceDTO> result = invoiceMapper.toDtoList(invoices);
        log.info("Invoices found from database for date {}: {} items - Will be cached", date, result.size());

        return result;
    }

    /**
     * ⭐ CACHED - Get invoices by date range
     *
     * Cache key: "daterange:{fromDate}:{toDate}"
     * Cache TTL: 10 minutes
     *
     * Note: Cleared automatically when new invoices are created via checkout
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'daterange:' + #fromDate + ':' + #toDate")
    public List<InvoiceDTO> getInvoicesByDateRange(String fromDate, String toDate) {
        log.info("Getting invoices by date range: {} to {} - Checking cache first", fromDate, toDate);
        
        LocalDate fromLocalDate = LocalDate.parse(fromDate, DateTimeFormatter.ISO_DATE);
        LocalDate toLocalDate = LocalDate.parse(toDate, DateTimeFormatter.ISO_DATE);
        
        // Validate date range
        if (fromLocalDate.isAfter(toLocalDate)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Ngày bắt đầu không được sau ngày kết thúc");
        }
        
        LocalDateTime startOfDay = fromLocalDate.atStartOfDay();
        LocalDateTime endOfDay = toLocalDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByDateRange(
                startOfDay, endOfDay, Status.COMPLETED);

        List<InvoiceDTO> result = invoiceMapper.toDtoList(invoices);
        log.info("Invoices found from database for date range {} to {}: {} items - Will be cached", 
                fromDate, toDate, result.size());

        return result;
    }

    /**
     * ⭐ CACHED - Get invoices by customer
     *
     * Cache key: "customer:{customerId}"
     * Cache TTL: 10 minutes
     *
     * Note: Cleared automatically when new invoices are created via checkout
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'customer:' + #customerId")
    public List<InvoiceDTO> getInvoicesByCustomer(Long customerId) {
        log.info("Getting invoices by customer ID: {} - Checking cache first", customerId);
        
        List<HoaDon> invoices = hoaDonRepository.findByCustomerWithDetails(customerId);
        
        List<InvoiceDTO> result = invoiceMapper.toDtoList(invoices);
        log.info("Invoices found from database for customer {}: {} items - Will be cached", 
                customerId, result.size());
        
        return result;
    }

    /**
     * Xóa hóa đơn (soft delete - chuyển status sang CANCELLED)
     * - Trừ điểm khách hàng (nếu đã tích điểm)
     * - Trừ doanh thu (không tính vào báo cáo)
     * - Chuyển trạng thái sang CANCELLED
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO cancelInvoice(Long invoiceId) {
        log.info("Cancelling invoice ID: {} - Soft delete (chuyển status CANCELLED)", invoiceId);

        HoaDon hoaDon = hoaDonRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        // Kiểm tra hóa đơn đã bị hủy chưa
        if (hoaDon.getTrangThai() == Status.CANCELLED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Hóa đơn đã bị hủy trước đó");
        }

        // Trừ điểm khách hàng (nếu đã tích điểm)
        if (hoaDon.getKhachHang() != null && hoaDon.getDiemTichLuy() != null 
                && hoaDon.getDiemTichLuy().compareTo(BigDecimal.ZERO) > 0) {
            KhachHang khachHang = hoaDon.getKhachHang();
            BigDecimal currentPoints = khachHang.getDiemTichLuy();
            BigDecimal pointsToSubtract = hoaDon.getDiemTichLuy();
            
            // Trừ điểm (không để âm)
            BigDecimal newPoints = currentPoints.subtract(pointsToSubtract);
            if (newPoints.compareTo(BigDecimal.ZERO) < 0) {
                newPoints = BigDecimal.ZERO;
            }
            
            khachHang.setDiemTichLuy(newPoints);
            khachHangRepository.save(khachHang);
            
            log.info("Subtracted {} points from customer {} (from {} to {})", 
                    pointsToSubtract, khachHang.getId(), currentPoints, newPoints);
        }

        // Chuyển trạng thái sang CANCELLED
        hoaDon.setTrangThai(Status.CANCELLED);
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);

        log.info("Invoice cancelled successfully: {} - Status changed to CANCELLED - Cache cleared", 
                savedInvoice.getMaHoaDon());

        return invoiceMapper.toDto(savedInvoice);
    }

    /**
     * Lấy danh sách hóa đơn theo ngày và trạng thái
     * Hỗ trợ lấy CANCELLED invoices để hiển thị ở FE
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'date:' + #date + ':status:' + #status")
    public List<InvoiceDTO> getInvoicesByDateAndStatus(String date, Status status) {
        log.info("Getting invoices by date: {} and status: {} - Checking cache first", date, status);
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByDateRange(
                startOfDay, endOfDay, status);

        List<InvoiceDTO> result = invoiceMapper.toDtoList(invoices);
        log.info("Invoices found from database for date {} and status {}: {} items - Will be cached", 
                date, status, result.size());

        return result;
    }

    /**
     * Lấy danh sách hóa đơn theo khoảng ngày và trạng thái
     * Hỗ trợ lấy CANCELLED invoices để hiển thị ở FE
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'daterange:' + #fromDate + ':' + #toDate + ':status:' + #status")
    public List<InvoiceDTO> getInvoicesByDateRangeAndStatus(String fromDate, String toDate, Status status) {
        log.info("Getting invoices by date range: {} to {} and status: {} - Checking cache first", 
                fromDate, toDate, status);
        
        LocalDate fromLocalDate = LocalDate.parse(fromDate, DateTimeFormatter.ISO_DATE);
        LocalDate toLocalDate = LocalDate.parse(toDate, DateTimeFormatter.ISO_DATE);
        
        // Validate date range
        if (fromLocalDate.isAfter(toLocalDate)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Ngày bắt đầu không được sau ngày kết thúc");
        }
        
        LocalDateTime startOfDay = fromLocalDate.atStartOfDay();
        LocalDateTime endOfDay = toLocalDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByDateRange(
                startOfDay, endOfDay, status);

        List<InvoiceDTO> result = invoiceMapper.toDtoList(invoices);
        log.info("Invoices found from database for date range {} to {} and status {}: {} items - Will be cached", 
                fromDate, toDate, status, result.size());

        return result;
    }

    /**
     * Treo bill - Tạo hóa đơn tạm thời (PENDING) chưa thanh toán
     * - Không trừ tồn kho
     * - Không tích điểm
     * - Status = PENDING
     * - Không yêu cầu phương thức thanh toán
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO holdBill(com.retail.application.dto.HoldBillRequest request) {
        log.info("Holding bill (treo bill) for {} items", request.getItems().size());

        // Kiểm tra giỏ hàng
        validateCart(request.getItems());

        // Load các entity
        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getChiNhanhId())
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", request.getChiNhanhId()));

        KhachHang khachHang = null;
        if (request.getKhachHangId() != null) {
            khachHang = khachHangRepository.findById(request.getKhachHangId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", request.getKhachHangId()));
        }

        // Tạo hóa đơn với status PENDING
        HoaDon hoaDon = HoaDon.builder()
                .maHoaDon(generateInvoiceCode())
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .chiNhanh(chiNhanh)
                .ngayTao(LocalDateTime.now())
                .giamGia(request.getGiamGia() != null ? request.getGiamGia() : BigDecimal.ZERO)
                .phuongThucThanhToan(null) // Chưa có phương thức thanh toán
                .ghiChu(request.getGhiChu() != null ? request.getGhiChu() : null)
                .trangThai(Status.PENDING) // ✅ Status PENDING
                .build();

        // Tính tổng tiền
        BigDecimal tongTien = BigDecimal.ZERO;

        // Thêm chi tiết hóa đơn (KHÔNG trừ tồn kho)
        for (CartItemDTO item : request.getItems()) {
            SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getSanPhamId()));

            ChiTietHoaDon chiTiet = ChiTietHoaDon.builder()
                    .sanPham(sanPham)
                    .soLuong(item.getSoLuong())
                    .donGia(sanPham.getGiaBan())
                    .ghiChu(item.getGhiChu())
                    .build();

            chiTiet.calculateThanhTien();
            hoaDon.addChiTiet(chiTiet);

            tongTien = tongTien.add(chiTiet.getThanhTien());

            // ❌ KHÔNG cập nhật tồn kho (treo bill)
        }

        hoaDon.setTongTien(tongTien);

        // Áp dụng khuyến mãi - CHỈ áp dụng khi user chọn mã khuyến mãi
        BigDecimal promotionDiscount = BigDecimal.ZERO;
        AppliedPromotionDTO appliedPromotion = null;
        
        if (request.getMaKhuyenMai() != null && !request.getMaKhuyenMai().trim().isEmpty()) {
            try {
                appliedPromotion = promotionService.applyPromotionByCode(
                        request.getMaKhuyenMai(),
                        request.getChiNhanhId(),
                        request.getItems(),
                        tongTien);
                
                if (appliedPromotion != null) {
                    promotionDiscount = appliedPromotion.getDiscountAmount();
                    log.info("Applied promotion: {} - Discount: {}", 
                            request.getMaKhuyenMai(), promotionDiscount);
                }
            } catch (Exception e) {
                log.warn("Failed to apply promotion {}: {} - Continuing without promotion", 
                        request.getMaKhuyenMai(), e.getMessage());
                // Không throw exception, tiếp tục treo bill mà không có promotion
            }
        }
        
        // Tổng giảm giá = giảm giá thủ công + giảm giá từ khuyến mãi (nếu có)
        BigDecimal totalDiscount = hoaDon.getGiamGia().add(promotionDiscount);
        hoaDon.setGiamGia(totalDiscount);
        
        // Lưu thông tin khuyến mãi vào ghiChu
        if (appliedPromotion != null) {
            StringBuilder promotionInfo = new StringBuilder();
            if (hoaDon.getGhiChu() != null && !hoaDon.getGhiChu().trim().isEmpty()) {
                promotionInfo.append(hoaDon.getGhiChu()).append(" | ");
            }
            promotionInfo.append("Khuyến mãi: ")
                    .append(appliedPromotion.getTenKhuyenMai())
                    .append(" (").append(appliedPromotion.getMaKhuyenMai()).append(")");
            hoaDon.setGhiChu(promotionInfo.toString());
        }

        // Tính số tiền cuối cùng
        BigDecimal thanhTien = tongTien.subtract(hoaDon.getGiamGia());
        if (thanhTien.compareTo(BigDecimal.ZERO) < 0) {
            thanhTien = BigDecimal.ZERO;
        }
        hoaDon.setThanhTien(thanhTien);

        // ❌ KHÔNG tính điểm tích lũy (treo bill)
        hoaDon.setDiemTichLuy(BigDecimal.ZERO);

        // ❌ KHÔNG cập nhật điểm khách hàng (treo bill)

        // ✅ Lưu hóa đơn PENDING
        // Lưu ý: Cho phép nhiều đơn PENDING cùng lúc (không auto-cancel như trước)
        // Frontend sẽ quản lý việc hiển thị và chọn đơn cần xử lý
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);
        log.info("Bill held successfully (treo bill): {} - Status: PENDING - No stock deducted - No points added", 
                savedInvoice.getMaHoaDon());

        // ❌ KHÔNG cập nhật số lần sử dụng promotion (vì chưa thanh toán)

        return invoiceMapper.toDto(savedInvoice);
    }

    /**
     * Lấy danh sách hóa đơn đang treo (PENDING) theo chi nhánh
     * 
     * ✅ Trả về TẤT CẢ invoices PENDING của chi nhánh
     * Frontend sẽ quản lý việc hiển thị và lọc theo nhân viên nếu cần
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "invoices", key = "'pending:' + #chiNhanhId")
    public List<InvoiceDTO> getPendingInvoices(Long chiNhanhId) {
        log.info("Getting pending invoices for branch: {} - Checking cache first", chiNhanhId);
        
        List<HoaDon> pendingInvoices = hoaDonRepository.findByChiNhanhIdAndTrangThai(
                chiNhanhId, Status.PENDING);
        
        // Sort by ngayTao DESC (mới nhất trước)
        pendingInvoices.sort((a, b) -> b.getNgayTao().compareTo(a.getNgayTao()));
        
        List<InvoiceDTO> result = invoiceMapper.toDtoList(pendingInvoices);
        log.info("Pending invoices found for branch {}: {} items - Will be cached", 
                chiNhanhId, result.size());
        
        return result;
    }

    /**
     * Khôi phục đơn PENDING - Lấy chi tiết đơn để tiếp tục xử lý
     * - Kiểm tra đơn phải là PENDING
     * - Trả về chi tiết đầy đủ (items, customer, total...)
     * - Frontend sẽ load vào màn hình bán hàng để tiếp tục xử lý
     */
    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO resumePendingInvoice(Long invoiceId) {
        log.info("Resuming pending invoice ID: {}", invoiceId);

        HoaDon hoaDon = hoaDonRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        // Kiểm tra hóa đơn phải là PENDING
        if (hoaDon.getTrangThai() != Status.PENDING) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Chỉ có thể khôi phục hóa đơn đang treo (PENDING). Hóa đơn hiện tại có trạng thái: " + hoaDon.getTrangThai());
        }

        log.info("Resumed pending invoice: {} - Ready for update or payment", hoaDon.getMaHoaDon());
        return invoiceMapper.toDto(hoaDon);
    }

    /**
     * Cập nhật đơn PENDING - Thêm/sửa/xóa sản phẩm
     * - Cho phép thêm hàng vào đơn PENDING
     * - Cho phép sửa số lượng
     * - Cho phép xóa sản phẩm
     * - Không trừ tồn kho (vẫn là PENDING)
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO updatePendingInvoice(Long invoiceId, com.retail.application.dto.HoldBillRequest request) {
        log.info("Updating pending invoice ID: {} with {} items", invoiceId, request.getItems().size());

        HoaDon hoaDon = hoaDonRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        // Kiểm tra hóa đơn phải là PENDING
        if (hoaDon.getTrangThai() != Status.PENDING) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Chỉ có thể cập nhật hóa đơn đang treo (PENDING). Hóa đơn hiện tại có trạng thái: " + hoaDon.getTrangThai());
        }

        // Validate giỏ hàng mới
        validateCart(request.getItems());

        // Xóa tất cả chi tiết cũ
        hoaDon.getChiTietHoaDons().clear();

        // Cập nhật ghi chú nếu có
        if (request.getGhiChu() != null) {
            hoaDon.setGhiChu(request.getGhiChu());
        }

        // Tính tổng tiền mới
        BigDecimal tongTien = BigDecimal.ZERO;

        // Thêm chi tiết hóa đơn mới (KHÔNG trừ tồn kho)
        for (CartItemDTO item : request.getItems()) {
            SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getSanPhamId()));

            ChiTietHoaDon chiTiet = ChiTietHoaDon.builder()
                    .sanPham(sanPham)
                    .soLuong(item.getSoLuong())
                    .donGia(sanPham.getGiaBan())
                    .ghiChu(item.getGhiChu())
                    .build();

            chiTiet.calculateThanhTien();
            hoaDon.addChiTiet(chiTiet);

            tongTien = tongTien.add(chiTiet.getThanhTien());
        }

        hoaDon.setTongTien(tongTien);

        // Áp dụng khuyến mãi nếu có
        BigDecimal promotionDiscount = BigDecimal.ZERO;
        AppliedPromotionDTO appliedPromotion = null;
        
        if (request.getMaKhuyenMai() != null && !request.getMaKhuyenMai().trim().isEmpty()) {
            try {
                appliedPromotion = promotionService.applyPromotionByCode(
                        request.getMaKhuyenMai(),
                        hoaDon.getChiNhanh().getId(),
                        request.getItems(),
                        tongTien);
                
                if (appliedPromotion != null) {
                    promotionDiscount = appliedPromotion.getDiscountAmount();
                }
            } catch (Exception e) {
                log.warn("Failed to apply promotion {}: {}", request.getMaKhuyenMai(), e.getMessage());
            }
        }

        // Cập nhật giảm giá
        BigDecimal totalDiscount = (request.getGiamGia() != null ? request.getGiamGia() : BigDecimal.ZERO).add(promotionDiscount);
        hoaDon.setGiamGia(totalDiscount);

        // Tính số tiền cuối cùng
        BigDecimal thanhTien = tongTien.subtract(hoaDon.getGiamGia());
        if (thanhTien.compareTo(BigDecimal.ZERO) < 0) {
            thanhTien = BigDecimal.ZERO;
        }
        hoaDon.setThanhTien(thanhTien);

        // ❌ KHÔNG tính điểm tích lũy (vẫn là PENDING)
        hoaDon.setDiemTichLuy(BigDecimal.ZERO);

        // Lưu hóa đơn đã cập nhật
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);
        log.info("Pending invoice updated successfully: {} - Still PENDING - No stock deducted", 
                savedInvoice.getMaHoaDon());

        return invoiceMapper.toDto(savedInvoice);
    }

    /**
     * Hủy đơn PENDING - Chuyển từ PENDING sang CANCELLED
     * - Không trừ tồn kho (vì chưa trừ từ đầu)
     * - Không trừ điểm (vì chưa tích điểm)
     * - Chỉ đơn giản là chuyển trạng thái sang CANCELLED
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO cancelPendingInvoice(Long invoiceId) {
        log.info("Cancelling pending invoice ID: {} - Changing status to CANCELLED", invoiceId);

        HoaDon hoaDon = hoaDonRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        // Kiểm tra hóa đơn phải là PENDING
        if (hoaDon.getTrangThai() != Status.PENDING) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Chỉ có thể hủy hóa đơn đang treo (PENDING). Hóa đơn hiện tại có trạng thái: " + hoaDon.getTrangThai());
        }

        // Chuyển trạng thái sang CANCELLED
        hoaDon.setTrangThai(Status.CANCELLED);
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);

        log.info("Pending invoice cancelled successfully: {} - Status changed to CANCELLED - No stock/points affected", 
                savedInvoice.getMaHoaDon());

        return invoiceMapper.toDto(savedInvoice);
    }

    /**
     * Thanh toán hóa đơn đã treo (chuyển từ PENDING sang COMPLETED)
     * - Trừ tồn kho
     * - Tích điểm khách hàng
     * - Cập nhật status = COMPLETED
     */
    @Override
    @Transactional
    @CacheEvict(value = "invoices", allEntries = true)
    public InvoiceDTO completePendingInvoice(Long invoiceId, String phuongThucThanhToan) {
        log.info("Completing pending invoice ID: {} - Payment method: {}", invoiceId, phuongThucThanhToan);

        HoaDon hoaDon = hoaDonRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", invoiceId));

        // Kiểm tra hóa đơn phải là PENDING
        if (hoaDon.getTrangThai() != Status.PENDING) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Chỉ có thể thanh toán hóa đơn đang treo (PENDING). Hóa đơn hiện tại có trạng thái: " + hoaDon.getTrangThai());
        }

        // Cập nhật phương thức thanh toán
        hoaDon.setPhuongThucThanhToan(phuongThucThanhToan);

        // Trừ tồn kho cho từng sản phẩm
        for (ChiTietHoaDon chiTiet : hoaDon.getChiTietHoaDons()) {
            SanPham sanPham = chiTiet.getSanPham();
            
            // Kiểm tra tồn kho còn đủ không
            if (sanPham.getTonKho() < chiTiet.getSoLuong()) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                        String.format("Sản phẩm %s không đủ tồn kho. Tồn kho hiện tại: %d, yêu cầu: %d",
                                sanPham.getTenSanPham(), sanPham.getTonKho(), chiTiet.getSoLuong()));
            }
            
            // Trừ tồn kho
            sanPham.setTonKho(sanPham.getTonKho() - chiTiet.getSoLuong());
            sanPhamRepository.save(sanPham);
            
            log.info("Deducted stock for product {}: {} units (new stock: {})",
                    sanPham.getMaSanPham(), chiTiet.getSoLuong(), sanPham.getTonKho());
        }

        // Tính điểm tích lũy: 1.000 VND = 1 điểm
        BigDecimal thanhTien = hoaDon.getThanhTien() != null ? hoaDon.getThanhTien() : BigDecimal.ZERO;
        BigDecimal diemTichLuy = thanhTien.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP);
        hoaDon.setDiemTichLuy(diemTichLuy);

        // Cập nhật điểm khách hàng
        if (hoaDon.getKhachHang() != null) {
            KhachHang khachHang = hoaDon.getKhachHang();
            khachHang.setDiemTichLuy(khachHang.getDiemTichLuy().add(diemTichLuy));
            khachHangRepository.save(khachHang);
            
            log.info("Updated customer points: {} (added {} points from {} VND - 1.000 VND = 1 điểm)",
                    khachHang.getDiemTichLuy(), diemTichLuy, thanhTien);
        }

        // Chuyển trạng thái sang COMPLETED
        hoaDon.setTrangThai(Status.COMPLETED);
        HoaDon savedInvoice = hoaDonRepository.save(hoaDon);

        log.info("Pending invoice completed successfully: {} - Status changed to COMPLETED - Stock deducted - Points added",
                savedInvoice.getMaHoaDon());

        return invoiceMapper.toDto(savedInvoice);
    }

    private String generateInvoiceCode() {
        String prefix = "HD";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }
}