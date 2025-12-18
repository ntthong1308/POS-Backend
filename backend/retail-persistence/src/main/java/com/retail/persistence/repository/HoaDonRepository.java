package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for HoaDon (Invoice) entity
 *
 * Provides methods for:
 * - Basic CRUD operations
 * - Business queries (date range, status, branch)
 * - Optimized queries with JOIN FETCH for PDF generation
 * - Revenue calculation and reporting
 * - Excel report data queries
 *
 */
@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {

    // ========== BASIC QUERIES ==========

    /**
     * Find invoice by invoice code
     */
    Optional<HoaDon> findByMaHoaDon(String maHoaDon);

    /**
     * Find invoices by customer and status
     */
    List<HoaDon> findByKhachHangIdAndTrangThai(Long khachHangId, Status trangThai);

    /**
     * Find all invoices by customer ID (all statuses)
     * Used when deleting customer to set khach_hang_id = NULL for all related invoices
     */
    List<HoaDon> findByKhachHangId(Long khachHangId);

    /**
     * Find invoices by status with pagination
     */
    Page<HoaDon> findByTrangThai(Status trangThai, Pageable pageable);

    // ========== OPTIMIZED QUERIES FOR PDF GENERATION ==========

    /**
     * Find invoice with all related entities for PDF generation
     *
     * ⭐ OPTIMIZED: Uses JOIN FETCH to load all data in 1 query
     *
     * This method fetches:
     * - ChiNhanh (branch info for header)
     * - KhachHang (customer info)
     * - NhanVien (staff info)
     * - ChiTietHoaDons (line items)
     * - SanPham (products in each line item)
     *
     * Performance: 1 query instead of 5-6 separate queries
     * No LazyInitializationException
     * No need for @Transactional in service layer
     *
     * @param id Invoice ID
     * @return Optional of HoaDon with all details loaded
     */
    @Query("""
        SELECT DISTINCT h FROM HoaDon h
        LEFT JOIN FETCH h.chiNhanh
        LEFT JOIN FETCH h.khachHang
        LEFT JOIN FETCH h.nhanVien
        LEFT JOIN FETCH h.chiTietHoaDons ct
        LEFT JOIN FETCH ct.sanPham
        WHERE h.id = :id
    """)
    Optional<HoaDon> findByIdWithDetails(@Param("id") Long id);

    /**
     * Find invoice by code with all details
     *
     * Similar to findByIdWithDetails but search by invoice code
     *
     * @param maHoaDon Invoice code
     * @return Optional of HoaDon with all details
     */
    @Query("""
        SELECT DISTINCT h FROM HoaDon h
        LEFT JOIN FETCH h.chiNhanh
        LEFT JOIN FETCH h.khachHang
        LEFT JOIN FETCH h.nhanVien
        LEFT JOIN FETCH h.chiTietHoaDons ct
        LEFT JOIN FETCH ct.sanPham
        WHERE h.maHoaDon = :maHoaDon
    """)
    Optional<HoaDon> findByMaHoaDonWithDetails(@Param("maHoaDon") String maHoaDon);

    // ========== DATE RANGE QUERIES ==========

    /**
     * Find invoices by date range and status
     */
    @Query("SELECT h FROM HoaDon h WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai ORDER BY h.ngayTao DESC")
    List<HoaDon> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate,
                                 @Param("trangThai") Status trangThai);

    /**
     * Find invoices by date range with all details (for bulk PDF export)
     *
     * ⭐ OPTIMIZED: Use this when exporting multiple invoices as PDF
     *
     * @param startDate Start date
     * @param endDate End date
     * @param trangThai Invoice status
     * @return List of invoices with all details loaded
     */
    @Query("""
        SELECT DISTINCT h FROM HoaDon h
        LEFT JOIN FETCH h.chiNhanh
        LEFT JOIN FETCH h.khachHang
        LEFT JOIN FETCH h.nhanVien
        WHERE h.ngayTao BETWEEN :startDate AND :endDate
        AND h.trangThai = :trangThai
        ORDER BY h.ngayTao DESC
    """)
    List<HoaDon> findByDateRangeWithDetails(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate,
                                            @Param("trangThai") Status trangThai);

    // ========== BRANCH QUERIES ==========

    /**
     * Find invoices by branch, date range and status
     */
    @Query("SELECT h FROM HoaDon h WHERE h.chiNhanh.id = :chiNhanhId " +
            "AND h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai ORDER BY h.ngayTao DESC")
    List<HoaDon> findByChiNhanhAndDateRange(@Param("chiNhanhId") Long chiNhanhId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate,
                                            @Param("trangThai") Status trangThai);

    /**
     * Find invoices by branch and status (for pending invoices)
     * 
     * Uses explicit JPQL query to ensure correct mapping of chiNhanh.id
     */
    @Query("SELECT h FROM HoaDon h WHERE h.chiNhanh.id = :chiNhanhId AND h.trangThai = :trangThai ORDER BY h.ngayTao DESC")
    List<HoaDon> findByChiNhanhIdAndTrangThai(@Param("chiNhanhId") Long chiNhanhId, 
                                               @Param("trangThai") Status trangThai);

    // ========== REVENUE & STATISTICS ==========

    /**
     * Calculate total revenue by date range and status
     */
    @Query("SELECT SUM(h.thanhTien) FROM HoaDon h WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate,
                                     @Param("trangThai") Status trangThai);

    /**
     * Count invoices by date range and status
     */
    @Query("SELECT COUNT(h) FROM HoaDon h WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate,
                          @Param("endDate") LocalDateTime endDate,
                          @Param("trangThai") Status trangThai);

    // ========== CUSTOMER QUERIES ==========

    /**
     * Find invoices by customer with all details
     *
     * Useful for customer invoice history with PDF export
     *
     * @param customerId Customer ID
     * @return List of customer's invoices with details
     */
    @Query("""
        SELECT DISTINCT h FROM HoaDon h
        LEFT JOIN FETCH h.chiNhanh
        LEFT JOIN FETCH h.khachHang kh
        LEFT JOIN FETCH h.nhanVien
        WHERE kh.id = :customerId
        ORDER BY h.ngayTao DESC
    """)
    List<HoaDon> findByCustomerWithDetails(@Param("customerId") Long customerId);

    // ========== REPORTING QUERIES FOR EXCEL ==========

    /**
     * Get invoices with details for revenue report (Excel)
     *
     * ✅ SOLUTION: Simple entity query, processing in Java layer
     * No complex SQL functions needed - works with all databases
     *
     * Includes: ChiTietHoaDon, SanPham, DanhMuc, KhachHang for complete data
     *
     * @param startDate Start date time
     * @param endDate End date time
     * @param trangThai Invoice status
     * @return List of invoices with all details
     */
    @Query("""
        SELECT DISTINCT h FROM HoaDon h
        LEFT JOIN FETCH h.chiTietHoaDons ct
        LEFT JOIN FETCH ct.sanPham sp
        LEFT JOIN FETCH sp.danhMuc dm
        LEFT JOIN FETCH h.khachHang kh
        WHERE h.ngayTao BETWEEN :startDate AND :endDate
        AND h.trangThai = :trangThai
        ORDER BY h.ngayTao DESC
    """)
    List<HoaDon> getInvoicesForRevenueReport(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );

    // ========== SUMMARY STATISTICS - SIMPLE QUERIES ==========

    /**
     * Count total orders for summary
     */
    @Query("SELECT COUNT(DISTINCT h.id) FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    Long countTotalOrders(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );

    /**
     * Sum total revenue for summary
     */
    @Query("SELECT SUM(h.tongTien) FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    BigDecimal sumTotalRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );

    /**
     * Sum total discount for summary
     */
    @Query("SELECT SUM(COALESCE(h.giamGia, 0)) FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    BigDecimal sumTotalDiscount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );

    /**
     * Sum net revenue for summary
     */
    @Query("SELECT SUM(h.thanhTien) FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai")
    BigDecimal sumNetRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );

    /**
     * Count total customers for summary
     */
    @Query("SELECT COUNT(DISTINCT h.khachHang.id) FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :startDate AND :endDate " +
            "AND h.trangThai = :trangThai " +
            "AND h.khachHang IS NOT NULL")
    Long countTotalCustomers(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("trangThai") Status trangThai
    );
}