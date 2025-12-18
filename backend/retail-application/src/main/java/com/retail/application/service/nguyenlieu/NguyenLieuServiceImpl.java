package com.retail.application.service.nguyenlieu;

import com.retail.application.dto.BatchNhapXuatNguyenLieuRequest;
import com.retail.application.dto.DieuChinhSoLuongRequest;
import com.retail.application.dto.NguyenLieuDTO;
import com.retail.application.dto.NhapXuatNguyenLieuRequest;
import com.retail.application.dto.PhieuNhapXuatNguyenLieuDTO;
import com.retail.application.mapper.NguyenLieuMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.ChiNhanh;
import com.retail.domain.entity.NguyenLieu;
import com.retail.domain.entity.NhanVien;
import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import com.retail.persistence.repository.ChiNhanhRepository;
import com.retail.persistence.repository.NguyenLieuRepository;
import com.retail.persistence.repository.NhanVienRepository;
import com.retail.persistence.repository.PhieuNhapXuatNguyenLieuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NguyenLieuServiceImpl implements NguyenLieuService {

    private final NguyenLieuRepository nguyenLieuRepository;
    private final PhieuNhapXuatNguyenLieuRepository phieuRepository;
    private final ChiNhanhRepository chiNhanhRepository;
    private final NhanVienRepository nhanVienRepository;
    private final NguyenLieuMapper nguyenLieuMapper;

    @Override
    @Transactional
    public NguyenLieuDTO create(NguyenLieuDTO dto) {
        log.info("Creating new nguyen lieu: {}", dto.getMaNguyenLieu());

        if (nguyenLieuRepository.existsByMaNguyenLieu(dto.getMaNguyenLieu())) {
            throw new BusinessException(ErrorCode.DUPLICATE_BARCODE,
                    "Mã nguyên liệu đã tồn tại: " + dto.getMaNguyenLieu());
        }

        NguyenLieu entity = nguyenLieuMapper.toEntity(dto);
        
        if (dto.getChiNhanhId() != null) {
            ChiNhanh chiNhanh = chiNhanhRepository.findById(dto.getChiNhanhId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", dto.getChiNhanhId()));
            entity.setChiNhanh(chiNhanh);
        }
        
        entity.setTrangThai(Status.ACTIVE);
        if (entity.getSoLuong() == null) {
            entity.setSoLuong(0);
        }

        NguyenLieu saved = nguyenLieuRepository.save(entity);
        log.info("Nguyen lieu created successfully with ID: {}", saved.getId());

        return nguyenLieuMapper.toDto(saved);
    }

    @Override
    @Transactional
    public NguyenLieuDTO update(Long id, NguyenLieuDTO dto) {
        log.info("Updating nguyen lieu ID: {}", id);

        NguyenLieu existing = nguyenLieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", id));

        nguyenLieuMapper.updateEntityFromDto(dto, existing);
        
        if (dto.getChiNhanhId() != null && 
            (existing.getChiNhanh() == null || !existing.getChiNhanh().getId().equals(dto.getChiNhanhId()))) {
            ChiNhanh chiNhanh = chiNhanhRepository.findById(dto.getChiNhanhId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", dto.getChiNhanhId()));
            existing.setChiNhanh(chiNhanh);
        }

        NguyenLieu updated = nguyenLieuRepository.save(existing);
        log.info("Nguyen lieu updated successfully: {}", id);
        
        return nguyenLieuMapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public NguyenLieuDTO findById(Long id) {
        NguyenLieu entity = nguyenLieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", id));
        return nguyenLieuMapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NguyenLieuDTO> findAll(Pageable pageable) {
        Page<NguyenLieu> entities = nguyenLieuRepository.findByTrangThai(Status.ACTIVE, pageable);
        return entities.map(nguyenLieuMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NguyenLieuDTO> search(String keyword, Pageable pageable) {
        Page<NguyenLieu> entities = nguyenLieuRepository.searchByKeyword(keyword, pageable);
        return entities.map(nguyenLieuMapper::toDto);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        NguyenLieu entity = nguyenLieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", id));
        entity.setTrangThai(Status.INACTIVE);
        nguyenLieuRepository.save(entity);
        log.info("Nguyen lieu deleted (soft delete) ID: {}", id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Status status) {
        NguyenLieu entity = nguyenLieuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", id));
        entity.setTrangThai(status);
        nguyenLieuRepository.save(entity);
        log.info("Nguyen lieu status updated ID: {} to {}", id, status);
    }

    @Override
    @Transactional
    public void nhapNguyenLieu(NhapXuatNguyenLieuRequest request) {
        log.info("Nhap nguyen lieu ID: {}, so luong: {}", request.getNguyenLieuId(), request.getSoLuong());

        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(request.getNguyenLieuId())
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", request.getNguyenLieuId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Lưu số lượng trước khi nhập
        Integer soLuongTruoc = nguyenLieu.getSoLuong();
        
        // Tăng số lượng
        nguyenLieu.tangSoLuong(request.getSoLuong());
        nguyenLieuRepository.save(nguyenLieu);
        
        // Số lượng còn lại sau khi nhập
        Integer soLuongConLai = nguyenLieu.getSoLuong();

        // Tạo phiếu nhập
        PhieuNhapXuatNguyenLieu phieu = PhieuNhapXuatNguyenLieu.builder()
                .maPhieu(generateMaPhieu("NHAP"))
                .nguyenLieu(nguyenLieu)
                .ngayNhapXuat(LocalDateTime.now())
                .loaiPhieu(PhieuNhapXuatNguyenLieu.LoaiPhieu.NHAP)
                .soLuong(request.getSoLuong())
                .soLuongTruoc(soLuongTruoc)
                .soLuongConLai(soLuongConLai)
                .nhanVien(nhanVien)
                .ghiChu(request.getGhiChu())
                .build();

        phieuRepository.save(phieu);
        log.info("Nhap nguyen lieu completed: {}", phieu.getMaPhieu());
    }

    @Override
    @Transactional
    public void xuatNguyenLieu(NhapXuatNguyenLieuRequest request) {
        log.info("Xuat nguyen lieu ID: {}, so luong: {}", request.getNguyenLieuId(), request.getSoLuong());

        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(request.getNguyenLieuId())
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", request.getNguyenLieuId()));

        // Kiểm tra số lượng tồn kho
        if (nguyenLieu.getSoLuong() < request.getSoLuong()) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Nguyên liệu '%s' không đủ số lượng. Còn lại: %d, yêu cầu: %d",
                            nguyenLieu.getTenNguyenLieu(), nguyenLieu.getSoLuong(), request.getSoLuong()));
        }

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Lưu số lượng trước khi xuất
        Integer soLuongTruoc = nguyenLieu.getSoLuong();
        
        // Giảm số lượng
        nguyenLieu.giamSoLuong(request.getSoLuong());
        nguyenLieuRepository.save(nguyenLieu);
        
        // Số lượng còn lại sau khi xuất
        Integer soLuongConLai = nguyenLieu.getSoLuong();

        // Tạo phiếu xuất
        PhieuNhapXuatNguyenLieu phieu = PhieuNhapXuatNguyenLieu.builder()
                .maPhieu(generateMaPhieu("XUAT"))
                .nguyenLieu(nguyenLieu)
                .ngayNhapXuat(LocalDateTime.now())
                .loaiPhieu(PhieuNhapXuatNguyenLieu.LoaiPhieu.XUAT)
                .soLuong(request.getSoLuong())
                .soLuongTruoc(soLuongTruoc)
                .soLuongConLai(soLuongConLai)
                .nhanVien(nhanVien)
                .ghiChu(request.getGhiChu())
                .build();

        phieuRepository.save(phieu);
        log.info("Xuat nguyen lieu completed: {}", phieu.getMaPhieu());
    }

    @Override
    @Transactional
    public void nhapNguyenLieuBatch(BatchNhapXuatNguyenLieuRequest request) {
        log.info("Batch nhap nguyen lieu - {} items", request.getItems().size());

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Base mã phiếu (có thể từ request hoặc tự generate)
        String baseMaPhieu = request.getMaPhieu();
        if (baseMaPhieu == null || baseMaPhieu.trim().isEmpty()) {
            baseMaPhieu = generateMaPhieu("NHAP");
        }

        LocalDateTime ngayNhapXuat = LocalDateTime.now();

        // Xử lý từng item - Mỗi item sẽ có maPhieu riêng để tránh duplicate
        int itemIndex = 0;
        for (BatchNhapXuatNguyenLieuRequest.ItemRequest item : request.getItems()) {
            itemIndex++;
            
            // Tạo maPhieu unique cho từng item: baseMaPhieu + "-" + index
            // Nếu chỉ có 1 item, dùng baseMaPhieu trực tiếp
            String itemMaPhieu = request.getItems().size() == 1 
                    ? baseMaPhieu 
                    : baseMaPhieu + "-" + itemIndex;

            // Đảm bảo maPhieu unique (nếu trùng thì thêm random suffix)
            String finalMaPhieu = itemMaPhieu;
            int retryCount = 0;
            while (phieuRepository.existsByMaPhieu(finalMaPhieu) && retryCount < 10) {
                retryCount++;
                String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                finalMaPhieu = itemMaPhieu + "-" + randomSuffix;
            }
            
            if (retryCount >= 10) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Không thể tạo mã phiếu unique sau nhiều lần thử: " + itemMaPhieu);
            }

            NguyenLieu nguyenLieu = nguyenLieuRepository.findById(item.getNguyenLieuId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", item.getNguyenLieuId()));

            // Lưu số lượng trước khi nhập
            Integer soLuongTruoc = nguyenLieu.getSoLuong();
            
            // Tăng số lượng
            nguyenLieu.tangSoLuong(item.getSoLuong());
            nguyenLieuRepository.save(nguyenLieu);
            
            // Số lượng còn lại sau khi nhập
            Integer soLuongConLai = nguyenLieu.getSoLuong();

            // Tạo phiếu nhập với mã phiếu unique
            String itemGhiChu = item.getGhiChu();
            String finalGhiChu = request.getGhiChu();
            if (itemGhiChu != null && !itemGhiChu.trim().isEmpty()) {
                if (finalGhiChu != null && !finalGhiChu.trim().isEmpty()) {
                    finalGhiChu = request.getGhiChu() + " | " + itemGhiChu;
                } else {
                    finalGhiChu = itemGhiChu;
                }
            }

            PhieuNhapXuatNguyenLieu phieu = PhieuNhapXuatNguyenLieu.builder()
                    .maPhieu(finalMaPhieu)
                    .nguyenLieu(nguyenLieu)
                    .ngayNhapXuat(ngayNhapXuat)
                    .loaiPhieu(PhieuNhapXuatNguyenLieu.LoaiPhieu.NHAP)
                    .soLuong(item.getSoLuong())
                    .soLuongTruoc(soLuongTruoc)
                    .soLuongConLai(soLuongConLai)
                    .nhanVien(nhanVien)
                    .ghiChu(finalGhiChu)
                    .build();

            phieuRepository.save(phieu);
            log.info("Item {} added to batch nhap: {} - So luong: {} - MaPhieu: {}", 
                    itemIndex, nguyenLieu.getTenNguyenLieu(), item.getSoLuong(), finalMaPhieu);
        }

        log.info("Batch nhap nguyen lieu completed: Base maPhieu: {} - {} items processed", 
                baseMaPhieu, request.getItems().size());
    }

    @Override
    @Transactional
    public void xuatNguyenLieuBatch(BatchNhapXuatNguyenLieuRequest request) {
        log.info("Batch xuat nguyen lieu - {} items", request.getItems().size());

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Kiểm tra tồn kho trước cho tất cả items
        for (BatchNhapXuatNguyenLieuRequest.ItemRequest item : request.getItems()) {
            NguyenLieu nguyenLieu = nguyenLieuRepository.findById(item.getNguyenLieuId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", item.getNguyenLieuId()));

            if (nguyenLieu.getSoLuong() < item.getSoLuong()) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK,
                        String.format("Nguyên liệu '%s' không đủ số lượng. Còn lại: %d, yêu cầu: %d",
                                nguyenLieu.getTenNguyenLieu(), nguyenLieu.getSoLuong(), item.getSoLuong()));
            }
        }

        // Base mã phiếu (có thể từ request hoặc tự generate)
        String baseMaPhieu = request.getMaPhieu();
        if (baseMaPhieu == null || baseMaPhieu.trim().isEmpty()) {
            baseMaPhieu = generateMaPhieu("XUAT");
        }

        LocalDateTime ngayNhapXuat = LocalDateTime.now();

        // Xử lý từng item - Mỗi item sẽ có maPhieu riêng để tránh duplicate
        int itemIndex = 0;
        for (BatchNhapXuatNguyenLieuRequest.ItemRequest item : request.getItems()) {
            itemIndex++;
            
            // Tạo maPhieu unique cho từng item: baseMaPhieu + "-" + index
            // Nếu chỉ có 1 item, dùng baseMaPhieu trực tiếp
            String itemMaPhieu = request.getItems().size() == 1 
                    ? baseMaPhieu 
                    : baseMaPhieu + "-" + itemIndex;

            // Đảm bảo maPhieu unique (nếu trùng thì thêm random suffix)
            String finalMaPhieu = itemMaPhieu;
            int retryCount = 0;
            while (phieuRepository.existsByMaPhieu(finalMaPhieu) && retryCount < 10) {
                retryCount++;
                String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
                finalMaPhieu = itemMaPhieu + "-" + randomSuffix;
            }
            
            if (retryCount >= 10) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Không thể tạo mã phiếu unique sau nhiều lần thử: " + itemMaPhieu);
            }

            NguyenLieu nguyenLieu = nguyenLieuRepository.findById(item.getNguyenLieuId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", item.getNguyenLieuId()));

            // Lưu số lượng trước khi xuất
            Integer soLuongTruoc = nguyenLieu.getSoLuong();

            // Giảm số lượng
            nguyenLieu.giamSoLuong(item.getSoLuong());
            nguyenLieuRepository.save(nguyenLieu);

            // Số lượng còn lại sau khi xuất
            Integer soLuongConLai = nguyenLieu.getSoLuong();

            // Tạo phiếu xuất với mã phiếu unique
            String itemGhiChu = item.getGhiChu();
            String finalGhiChu = request.getGhiChu();
            if (itemGhiChu != null && !itemGhiChu.trim().isEmpty()) {
                if (finalGhiChu != null && !finalGhiChu.trim().isEmpty()) {
                    finalGhiChu = request.getGhiChu() + " | " + itemGhiChu;
                } else {
                    finalGhiChu = itemGhiChu;
                }
            }

            PhieuNhapXuatNguyenLieu phieu = PhieuNhapXuatNguyenLieu.builder()
                    .maPhieu(finalMaPhieu)
                    .nguyenLieu(nguyenLieu)
                    .ngayNhapXuat(ngayNhapXuat)
                    .loaiPhieu(PhieuNhapXuatNguyenLieu.LoaiPhieu.XUAT)
                    .soLuong(item.getSoLuong())
                    .soLuongTruoc(soLuongTruoc)
                    .soLuongConLai(soLuongConLai)
                    .nhanVien(nhanVien)
                    .ghiChu(finalGhiChu)
                    .build();

            phieuRepository.save(phieu);
            log.info("Item {} added to batch xuat: {} - So luong: {} - MaPhieu: {}", 
                    itemIndex, nguyenLieu.getTenNguyenLieu(), item.getSoLuong(), finalMaPhieu);
        }

        log.info("Batch xuat nguyen lieu completed: Base maPhieu: {} - {} items processed", 
                baseMaPhieu, request.getItems().size());
    }

    @Override
    @Transactional
    public void deletePhieu(Long phieuId) {
        log.info("Deleting phieu ID: {}", phieuId);

        PhieuNhapXuatNguyenLieu phieu = phieuRepository.findById(phieuId)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập/xuất", phieuId));

        NguyenLieu nguyenLieu = phieu.getNguyenLieu();
        PhieuNhapXuatNguyenLieu.LoaiPhieu loaiPhieu = phieu.getLoaiPhieu();
        Integer soLuong = phieu.getSoLuong();

        // Rollback tồn kho
        if (loaiPhieu == PhieuNhapXuatNguyenLieu.LoaiPhieu.NHAP) {
            // Nếu là phiếu NHAP → Trừ lại số lượng (rollback)
            if (nguyenLieu.getSoLuong() < soLuong) {
                log.warn("Warning: Tồn kho hiện tại ({}) nhỏ hơn số lượng phiếu nhập ({}). " +
                        "Có thể có phiếu sau đó đã xuất. Vẫn tiếp tục rollback.",
                        nguyenLieu.getSoLuong(), soLuong);
                // Vẫn tiếp tục rollback, set về 0 nếu âm
                int newQuantity = Math.max(0, nguyenLieu.getSoLuong() - soLuong);
                nguyenLieu.setSoLuong(newQuantity);
            } else {
                nguyenLieu.giamSoLuong(soLuong);
            }
            log.info("Rollback nhap: Trừ {} từ tồn kho. Tồn kho mới: {}", 
                    soLuong, nguyenLieu.getSoLuong());
        } else if (loaiPhieu == PhieuNhapXuatNguyenLieu.LoaiPhieu.XUAT) {
            // Nếu là phiếu XUAT → Cộng lại số lượng (rollback)
            nguyenLieu.tangSoLuong(soLuong);
            log.info("Rollback xuat: Cộng {} vào tồn kho. Tồn kho mới: {}", 
                    soLuong, nguyenLieu.getSoLuong());
        } else if (loaiPhieu == PhieuNhapXuatNguyenLieu.LoaiPhieu.DIEU_CHINH) {
            // Nếu là phiếu DIEU_CHINH → Khôi phục số lượng cũ
            Integer soLuongTruoc = phieu.getSoLuongTruoc();
            if (soLuongTruoc != null) {
                nguyenLieu.setSoLuong(soLuongTruoc);
                log.info("Rollback dieu chinh: Khôi phục tồn kho về {}. Tồn kho mới: {}", 
                        soLuongTruoc, nguyenLieu.getSoLuong());
            } else {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Không thể rollback phiếu điều chỉnh: Thiếu thông tin số lượng trước đó");
            }
        }

        nguyenLieuRepository.save(nguyenLieu);

        // Xóa phiếu
        phieuRepository.delete(phieu);
        log.info("Phieu deleted successfully: {} - Type: {} - Rollback completed", 
                phieu.getMaPhieu(), loaiPhieu);
    }

    @Override
    @Transactional
    public void dieuChinhSoLuong(DieuChinhSoLuongRequest request) {
        log.info("Dieu chinh so luong nguyen lieu ID: {}, so luong moi: {}", 
                request.getNguyenLieuId(), request.getSoLuongMoi());

        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(request.getNguyenLieuId())
                .orElseThrow(() -> new ResourceNotFoundException("Nguyên liệu", request.getNguyenLieuId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getNhanVienId()));

        // Lưu số lượng trước khi điều chỉnh
        Integer soLuongTruoc = nguyenLieu.getSoLuong();
        
        // Điều chỉnh số lượng
        nguyenLieu.setSoLuong(request.getSoLuongMoi());
        nguyenLieuRepository.save(nguyenLieu);
        
        // Số lượng còn lại sau điều chỉnh
        Integer soLuongConLai = nguyenLieu.getSoLuong();

        // Tạo phiếu điều chỉnh
        PhieuNhapXuatNguyenLieu phieu = PhieuNhapXuatNguyenLieu.builder()
                .maPhieu(generateMaPhieu("DIEU_CHINH"))
                .nguyenLieu(nguyenLieu)
                .ngayNhapXuat(LocalDateTime.now())
                .loaiPhieu(PhieuNhapXuatNguyenLieu.LoaiPhieu.DIEU_CHINH)
                .soLuong(request.getSoLuongMoi()) // Số lượng mới
                .soLuongTruoc(soLuongTruoc)
                .soLuongConLai(soLuongConLai)
                .nhanVien(nhanVien)
                .ghiChu(request.getGhiChu())
                .build();

        phieuRepository.save(phieu);
        log.info("Dieu chinh so luong completed: {}", phieu.getMaPhieu());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PhieuNhapXuatNguyenLieuDTO> getNhapHistory(Pageable pageable) {
        log.info("Getting nhap history with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<PhieuNhapXuatNguyenLieu> entities = phieuRepository.findByLoaiPhieu(
                PhieuNhapXuatNguyenLieu.LoaiPhieu.NHAP, pageable);
        return entities.map(this::toPhieuDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PhieuNhapXuatNguyenLieuDTO> getXuatHistory(Pageable pageable) {
        log.info("Getting xuat history with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<PhieuNhapXuatNguyenLieu> entities = phieuRepository.findByLoaiPhieu(
                PhieuNhapXuatNguyenLieu.LoaiPhieu.XUAT, pageable);
        return entities.map(this::toPhieuDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PhieuNhapXuatNguyenLieuDTO> getAllTransactions(Pageable pageable) {
        log.info("Getting all transactions with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<PhieuNhapXuatNguyenLieu> entities = phieuRepository.findAllOrderByNgayNhapXuatDesc(pageable);
        return entities.map(this::toPhieuDTO);
    }

    /**
     * Convert PhieuNhapXuatNguyenLieu entity to DTO
     */
    private PhieuNhapXuatNguyenLieuDTO toPhieuDTO(PhieuNhapXuatNguyenLieu entity) {
        return PhieuNhapXuatNguyenLieuDTO.builder()
                .id(entity.getId())
                .maPhieu(entity.getMaPhieu())
                .nguyenLieuId(entity.getNguyenLieu() != null ? entity.getNguyenLieu().getId() : null)
                .tenNguyenLieu(entity.getNguyenLieu() != null ? entity.getNguyenLieu().getTenNguyenLieu() : null)
                .maNguyenLieu(entity.getNguyenLieu() != null ? entity.getNguyenLieu().getMaNguyenLieu() : null)
                .ngayNhapXuat(entity.getNgayNhapXuat())
                .loaiPhieu(entity.getLoaiPhieu())
                .soLuong(entity.getSoLuong())
                .soLuongTruoc(entity.getSoLuongTruoc())
                .soLuongConLai(entity.getSoLuongConLai() != null ? entity.getSoLuongConLai() : 
                        (entity.getNguyenLieu() != null ? entity.getNguyenLieu().getSoLuong() : null))
                .nhanVienId(entity.getNhanVien() != null ? entity.getNhanVien().getId() : null)
                .tenNhanVien(entity.getNhanVien() != null ? entity.getNhanVien().getTenNhanVien() : null)
                .ghiChu(entity.getGhiChu())
                .build();
    }

    private String generateMaPhieu(String loai) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        // Chuyển DIEU_CHINH thành DC cho ngắn gọn
        String prefix = loai.equals("DIEU_CHINH") ? "DC" : loai;
        return String.format("%s-%s-%s", prefix, timestamp, uniqueId);
    }
}

