package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Long> {

    List<ChiTietHoaDon> findByHoaDonId(Long hoaDonId);

    List<ChiTietHoaDon> findBySanPhamId(Long sanPhamId);

    @Query("SELECT c FROM ChiTietHoaDon c JOIN c.hoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "ORDER BY c.soLuong DESC")
    List<ChiTietHoaDon> findTopSellingProducts(@Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c.sanPham.id, c.sanPham.maSanPham, c.sanPham.tenSanPham, " +
            "SUM(c.soLuong) as totalQty, SUM(c.thanhTien) as totalRevenue " +
            "FROM ChiTietHoaDon c JOIN c.hoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai " +
            "GROUP BY c.sanPham.id, c.sanPham.maSanPham, c.sanPham.tenSanPham " +
            "ORDER BY totalQty DESC")
    List<Object[]> getTopSellingProductsReport(@Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate,
                                               @Param("trangThai") Status trangThai);

    /**
     * Lấy tất cả sản phẩm bán được trong ngày với status COMPLETED
     * Chỉ trả về tên sản phẩm và số lượng bán
     */
    @Query("SELECT c.sanPham.tenSanPham, SUM(c.soLuong) as totalQty " +
            "FROM ChiTietHoaDon c JOIN c.hoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai " +
            "GROUP BY c.sanPham.tenSanPham " +
            "ORDER BY totalQty DESC")
    List<Object[]> getProductsSoldByDate(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate,
                                         @Param("trangThai") Status trangThai);
}