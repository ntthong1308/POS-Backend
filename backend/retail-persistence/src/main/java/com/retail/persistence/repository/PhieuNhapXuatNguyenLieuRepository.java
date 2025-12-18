package com.retail.persistence.repository;

import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuNhapXuatNguyenLieuRepository extends JpaRepository<PhieuNhapXuatNguyenLieu, Long> {

    Optional<PhieuNhapXuatNguyenLieu> findByMaPhieu(String maPhieu);

    boolean existsByMaPhieu(String maPhieu);

    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p WHERE p.nguyenLieu.id = :nguyenLieuId")
    List<PhieuNhapXuatNguyenLieu> findAllByNguyenLieuId(@Param("nguyenLieuId") Long nguyenLieuId);

    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p WHERE p.nguyenLieu.id = :nguyenLieuId")
    Page<PhieuNhapXuatNguyenLieu> findByNguyenLieuId(@Param("nguyenLieuId") Long nguyenLieuId, Pageable pageable);

    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p WHERE " +
            "p.ngayNhapXuat >= :fromDate AND p.ngayNhapXuat <= :toDate " +
            "ORDER BY p.ngayNhapXuat DESC")
    List<PhieuNhapXuatNguyenLieu> findByDateRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p WHERE " +
            "p.nguyenLieu.id = :nguyenLieuId AND " +
            "p.ngayNhapXuat >= :fromDate AND p.ngayNhapXuat <= :toDate " +
            "ORDER BY p.ngayNhapXuat DESC")
    List<PhieuNhapXuatNguyenLieu> findByNguyenLieuIdAndDateRange(
            @Param("nguyenLieuId") Long nguyenLieuId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    // Query theo loại phiếu (NHAP hoặc XUAT) với phân trang
    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p WHERE p.loaiPhieu = :loaiPhieu " +
            "ORDER BY p.ngayNhapXuat DESC")
    Page<PhieuNhapXuatNguyenLieu> findByLoaiPhieu(
            @Param("loaiPhieu") PhieuNhapXuatNguyenLieu.LoaiPhieu loaiPhieu,
            Pageable pageable);

    // Query tất cả giao dịch với phân trang
    @Query("SELECT p FROM PhieuNhapXuatNguyenLieu p ORDER BY p.ngayNhapXuat DESC")
    Page<PhieuNhapXuatNguyenLieu> findAllOrderByNgayNhapXuatDesc(Pageable pageable);

    /**
     * Find by loaiPhieu with all related entities loaded for Excel export
     */
    @Query("SELECT DISTINCT p FROM PhieuNhapXuatNguyenLieu p " +
            "LEFT JOIN FETCH p.nguyenLieu " +
            "LEFT JOIN FETCH p.nhanVien " +
            "WHERE p.loaiPhieu = :loaiPhieu " +
            "ORDER BY p.ngayNhapXuat DESC")
    List<PhieuNhapXuatNguyenLieu> findByLoaiPhieuWithDetails(
            @Param("loaiPhieu") PhieuNhapXuatNguyenLieu.LoaiPhieu loaiPhieu);
}

