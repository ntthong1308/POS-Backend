package com.retail.persistence.repository;

import com.retail.domain.entity.ChiTietKhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChiTietKhuyenMai
 *
 */
@Repository
public interface ChiTietKhuyenMaiRepository extends JpaRepository<ChiTietKhuyenMai, Long> {

    List<ChiTietKhuyenMai> findByKhuyenMaiId(Long khuyenMaiId);

    List<ChiTietKhuyenMai> findBySanPhamId(Long sanPhamId);

    @Query("SELECT c FROM ChiTietKhuyenMai c WHERE c.khuyenMai.id = :khuyenMaiId AND c.apDung = true")
    List<ChiTietKhuyenMai> findActiveByKhuyenMaiId(@Param("khuyenMaiId") Long khuyenMaiId);

    @Query("SELECT c FROM ChiTietKhuyenMai c WHERE c.sanPham.id = :sanPhamId AND c.apDung = true")
    List<ChiTietKhuyenMai> findActiveBySanPhamId(@Param("sanPhamId") Long sanPhamId);

    void deleteByKhuyenMaiId(Long khuyenMaiId);
}
