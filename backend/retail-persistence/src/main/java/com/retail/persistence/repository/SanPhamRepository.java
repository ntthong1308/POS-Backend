package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Long> {

    Optional<SanPham> findByMaSanPham(String maSanPham);

    Optional<SanPham> findByBarcode(String barcode);

    boolean existsByBarcode(String barcode);

    boolean existsByMaSanPham(String maSanPham);

    List<SanPham> findByTrangThai(Status trangThai);

    Page<SanPham> findByTrangThai(Status trangThai, Pageable pageable);

    @Query("SELECT s FROM SanPham s WHERE " +
            "LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.maSanPham) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.barcode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SanPham> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    List<SanPham> findByTonKhoLessThanAndTrangThai(Integer tonKho, Status trangThai);

    @Query("SELECT s FROM SanPham s WHERE s.tonKho < s.tonKhoToiThieu AND s.trangThai = :trangThai")
    List<SanPham> findLowStockProducts(@Param("trangThai") Status trangThai);

    List<SanPham> findByChiNhanhIdAndTrangThai(Long chiNhanhId, Status trangThai);

    // ========== NEW METHODS FOR INVENTORY REPORT ==========

    /**
     * Get all products with inventory information for report
     * Includes branch information via LEFT JOIN FETCH
     */
    @Query("SELECT s FROM SanPham s " +
            "LEFT JOIN FETCH s.chiNhanh cn " +
            "WHERE s.trangThai = :trangThai " +
            "ORDER BY s.tonKho ASC, s.tenSanPham ASC")
    List<SanPham> findAllForInventoryReport(@Param("trangThai") Status trangThai);

    /**
     * Count products with low stock (below minimum threshold)
     */
    @Query("SELECT COUNT(s) FROM SanPham s WHERE " +
            "s.trangThai = :trangThai AND " +
            "s.tonKhoToiThieu IS NOT NULL AND " +
            "s.tonKho <= s.tonKhoToiThieu")
    Long countLowStockProducts(@Param("trangThai") Status trangThai);
}