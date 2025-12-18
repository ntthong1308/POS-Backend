package com.retail.persistence.repository;

import com.retail.common.constant.PromotionType;
import com.retail.common.constant.Status;
import com.retail.domain.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for KhuyenMai
 *
 */
@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Long> {

    Optional<KhuyenMai> findByMaKhuyenMai(String maKhuyenMai);

    List<KhuyenMai> findByTrangThai(Status trangThai);

    List<KhuyenMai> findByLoaiKhuyenMai(PromotionType loaiKhuyenMai);

    List<KhuyenMai> findByChiNhanhId(Long chiNhanhId);

    /**
     * Find active promotions by date range
     */
    @Query("SELECT k FROM KhuyenMai k WHERE k.trangThai = :status " +
           "AND k.ngayBatDau <= :date AND k.ngayKetThuc >= :date")
    List<KhuyenMai> findActivePromotionsByDate(@Param("status") Status status,
                                                @Param("date") LocalDateTime date);

    /**
     * Find active promotions for a branch by date
     */
    @Query("SELECT k FROM KhuyenMai k WHERE k.trangThai = :status " +
           "AND (k.chiNhanh IS NULL OR k.chiNhanh.id = :chiNhanhId) " +
           "AND k.ngayBatDau <= :date AND k.ngayKetThuc >= :date")
    List<KhuyenMai> findActivePromotionsForBranch(@Param("status") Status status,
                                                   @Param("chiNhanhId") Long chiNhanhId,
                                                   @Param("date") LocalDateTime date);

    /**
     * Find promotions by date range
     */
    List<KhuyenMai> findByNgayBatDauLessThanEqualAndNgayKetThucGreaterThanEqual(
            LocalDateTime endDate, LocalDateTime startDate);
}
