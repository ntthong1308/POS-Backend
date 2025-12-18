package com.retail.application.service.nguyenlieu;

import com.retail.application.dto.DieuChinhSoLuongRequest;
import com.retail.application.dto.NguyenLieuDTO;
import com.retail.application.dto.NhapXuatNguyenLieuRequest;
import com.retail.application.dto.PhieuNhapXuatNguyenLieuDTO;
import com.retail.common.constant.Status;
import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NguyenLieuService {

    NguyenLieuDTO create(NguyenLieuDTO dto);

    NguyenLieuDTO update(Long id, NguyenLieuDTO dto);

    NguyenLieuDTO findById(Long id);

    Page<NguyenLieuDTO> findAll(Pageable pageable);

    Page<NguyenLieuDTO> search(String keyword, Pageable pageable);

    void delete(Long id);

    void updateStatus(Long id, Status status);

    /**
     * Nhập nguyên liệu (tăng số lượng) - Single item
     */
    void nhapNguyenLieu(NhapXuatNguyenLieuRequest request);

    /**
     * Xuất nguyên liệu (giảm số lượng) - Single item
     */
    void xuatNguyenLieu(NhapXuatNguyenLieuRequest request);

    /**
     * Nhập nguyên liệu batch (nhiều items)
     */
    void nhapNguyenLieuBatch(com.retail.application.dto.BatchNhapXuatNguyenLieuRequest request);

    /**
     * Xuất nguyên liệu batch (nhiều items)
     */
    void xuatNguyenLieuBatch(com.retail.application.dto.BatchNhapXuatNguyenLieuRequest request);

    /**
     * Xóa phiếu nhập/xuất và rollback tồn kho
     */
    void deletePhieu(Long phieuId);

    /**
     * Điều chỉnh số lượng nguyên liệu (thay đổi trực tiếp)
     */
    void dieuChinhSoLuong(DieuChinhSoLuongRequest request);

    /**
     * Lấy lịch sử nhập kho nguyên liệu
     */
    Page<PhieuNhapXuatNguyenLieuDTO> getNhapHistory(Pageable pageable);

    /**
     * Lấy lịch sử xuất kho nguyên liệu
     */
    Page<PhieuNhapXuatNguyenLieuDTO> getXuatHistory(Pageable pageable);

    /**
     * Lấy lịch sử tất cả giao dịch (nhập và xuất)
     */
    Page<PhieuNhapXuatNguyenLieuDTO> getAllTransactions(Pageable pageable);
}

