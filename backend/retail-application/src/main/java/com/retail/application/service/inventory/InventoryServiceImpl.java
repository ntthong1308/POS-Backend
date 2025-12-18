package com.retail.application.service.inventory;

import com.retail.application.dto.ImportGoodsRequest;
import com.retail.application.dto.ReturnRequest;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.*;
import com.retail.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final SanPhamRepository sanPhamRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final ChiNhanhRepository chiNhanhRepository;
    private final NhanVienRepository nhanVienRepository;
    private final NhapHangRepository nhapHangRepository;
    private final HoaDonRepository hoaDonRepository;
    private final PhieuTraHangRepository phieuTraHangRepository;

    @Override
    @Transactional
    public void importGoods(ImportGoodsRequest request) {
        log.info("Processing import goods request with {} items", request.getItems().size());

        // Load các entity
        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(request.getNhaCungCapId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", request.getNhaCungCapId()));

        ChiNhanh chiNhanh = chiNhanhRepository.findById(request.getChiNhanhId())
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", request.getChiNhanhId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Tạo phiếu nhập hàng
        NhapHang nhapHang = NhapHang.builder()
                .maNhapHang(generateImportCode())
                .nhaCungCap(nhaCungCap)
                .chiNhanh(chiNhanh)
                .nhanVien(nhanVien)
                .ngayNhap(LocalDateTime.now())
                .ghiChu(request.getGhiChu())
                .trangThai(Status.COMPLETED)
                .build();

        BigDecimal tongTien = BigDecimal.ZERO;

        // Xử lý các item
        for (ImportGoodsRequest.ImportItemDTO item : request.getItems()) {
            SanPham sanPham = sanPhamRepository.findById(item.getSanPhamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", item.getSanPhamId()));

            ChiTietNhapHang chiTiet = ChiTietNhapHang.builder()
                    .sanPham(sanPham)
                    .soLuong(item.getSoLuong())
                    .donGia(item.getDonGia())
                    .ghiChu(item.getGhiChu())
                    .build();

            chiTiet.calculateThanhTien();
            nhapHang.addChiTiet(chiTiet);

            tongTien = tongTien.add(chiTiet.getThanhTien());

            // Cập nhật tồn kho và giá nhập
            sanPham.setTonKho(sanPham.getTonKho() + item.getSoLuong());
            sanPham.setGiaNhap(item.getDonGia());
            sanPhamRepository.save(sanPham);

            log.info("Updated stock for product {}: new stock = {}",
                    sanPham.getMaSanPham(), sanPham.getTonKho());
        }

        nhapHang.setTongTien(tongTien);
        nhapHangRepository.save(nhapHang);

        log.info("Import goods completed successfully: {}", nhapHang.getMaNhapHang());
    }

    @Override
    @Transactional
    public void returnGoods(ReturnRequest request) {
        log.info("Processing return goods request for invoice ID: {}", request.getHoaDonGocId());

        // Load các entity
        HoaDon hoaDonGoc = hoaDonRepository.findById(request.getHoaDonGocId())
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn", request.getHoaDonGocId()));

        SanPham sanPham = sanPhamRepository.findById(request.getSanPhamId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", request.getSanPhamId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Kiểm tra số lượng trả
        ChiTietHoaDon chiTietHoaDon = hoaDonGoc.getChiTietHoaDons().stream()
                .filter(ct -> ct.getSanPham().getId().equals(request.getSanPhamId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_RETURN,
                        "Sản phẩm không có trong hóa đơn"));

        if (request.getSoLuongTra() > chiTietHoaDon.getSoLuong()) {
            throw new BusinessException(ErrorCode.INVALID_RETURN,
                    "Số lượng trả vượt quá số lượng đã mua");
        }

        // Tạo phiếu trả hàng
        PhieuTraHang phieuTra = PhieuTraHang.builder()
                .maPhieuTra(generateReturnCode())
                .hoaDonGoc(hoaDonGoc)
                .sanPham(sanPham)
                .soLuongTra(request.getSoLuongTra())
                .donGia(chiTietHoaDon.getDonGia())
                .nhanVien(nhanVien)
                .ngayTra(LocalDateTime.now())
                .lyDoTra(request.getLyDoTra())
                .trangThai(Status.COMPLETED)
                .build();

        phieuTra.calculateTongTienTra();

        // Cập nhật tồn kho
        sanPham.setTonKho(sanPham.getTonKho() + request.getSoLuongTra());
        sanPhamRepository.save(sanPham);

        phieuTraHangRepository.save(phieuTra);

        log.info("Return goods completed successfully: {}", phieuTra.getMaPhieuTra());
    }

    @Override
    @Transactional(readOnly = true)
    public Integer checkStock(Long productId) {
        SanPham sanPham = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", productId));
        return sanPham.getTonKho();
    }

    private String generateImportCode() {
        String prefix = "NH";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }

    private String generateReturnCode() {
        String prefix = "TH";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + timestamp;
    }
}