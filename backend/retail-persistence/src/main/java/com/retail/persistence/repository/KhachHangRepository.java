package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {

    Optional<KhachHang> findByMaKhachHang(String maKhachHang);

    Optional<KhachHang> findBySoDienThoai(String soDienThoai);

    Optional<KhachHang> findByEmail(String email);

    boolean existsByMaKhachHang(String maKhachHang);

    boolean existsBySoDienThoai(String soDienThoai);

    // Chỉ check số điện thoại của khách hàng ACTIVE (không check DELETED)
    @Query("SELECT COUNT(k) > 0 FROM KhachHang k WHERE k.soDienThoai = :soDienThoai AND k.trangThai = 'ACTIVE'")
    boolean existsBySoDienThoaiAndActive(@Param("soDienThoai") String soDienThoai);

    // Chỉ check mã khách hàng của khách hàng ACTIVE (không check DELETED)
    @Query("SELECT COUNT(k) > 0 FROM KhachHang k WHERE k.maKhachHang = :maKhachHang AND k.trangThai = 'ACTIVE'")
    boolean existsByMaKhachHangAndActive(@Param("maKhachHang") String maKhachHang);

    List<KhachHang> findByTrangThai(Status trangThai);

    Page<KhachHang> findByTrangThai(Status trangThai, Pageable pageable);

    @Query("SELECT k FROM KhachHang k WHERE " +
            "LOWER(k.tenKhachHang) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(k.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(k.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<KhachHang> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}