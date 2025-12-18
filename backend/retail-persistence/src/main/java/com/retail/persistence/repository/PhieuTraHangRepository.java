package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.PhieuTraHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuTraHangRepository extends JpaRepository<PhieuTraHang, Long> {

    Optional<PhieuTraHang> findByMaPhieuTra(String maPhieuTra);

    List<PhieuTraHang> findByHoaDonGocId(Long hoaDonGocId);

    List<PhieuTraHang> findByTrangThai(Status trangThai);

    @Query("SELECT p FROM PhieuTraHang p WHERE p.ngayTra BETWEEN :startDate AND :endDate " +
            "AND p.trangThai = :trangThai ORDER BY p.ngayTra DESC")
    List<PhieuTraHang> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       @Param("trangThai") Status trangThai);
}