package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.NguyenLieu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, Long> {

    Optional<NguyenLieu> findByMaNguyenLieu(String maNguyenLieu);

    boolean existsByMaNguyenLieu(String maNguyenLieu);

    List<NguyenLieu> findByTrangThai(Status trangThai);

    Page<NguyenLieu> findByTrangThai(Status trangThai, Pageable pageable);

    @Query("SELECT n FROM NguyenLieu n WHERE " +
            "LOWER(n.tenNguyenLieu) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.maNguyenLieu) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<NguyenLieu> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    List<NguyenLieu> findByChiNhanhIdAndTrangThai(Long chiNhanhId, Status trangThai);

    /**
     * Find all nguyen lieu with chiNhanh loaded for Excel export
     */
    @Query("SELECT DISTINCT n FROM NguyenLieu n " +
            "LEFT JOIN FETCH n.chiNhanh " +
            "WHERE n.trangThai = :trangThai")
    List<NguyenLieu> findByTrangThaiWithChiNhanh(@Param("trangThai") Status trangThai);
}

