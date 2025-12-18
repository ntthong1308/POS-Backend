package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.NhapHang;
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
public interface NhapHangRepository extends JpaRepository<NhapHang, Long> {

    Optional<NhapHang> findByMaNhapHang(String maNhapHang);

    List<NhapHang> findByTrangThai(Status trangThai);

    Page<NhapHang> findByTrangThai(Status trangThai, Pageable pageable);

    @Query("SELECT n FROM NhapHang n WHERE n.ngayNhap BETWEEN :startDate AND :endDate " +
            "AND n.trangThai = :trangThai ORDER BY n.ngayNhap DESC")
    List<NhapHang> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate,
                                   @Param("trangThai") Status trangThai);

    List<NhapHang> findByNhaCungCapIdAndTrangThai(Long nhaCungCapId, Status trangThai);

    List<NhapHang> findByChiNhanhIdAndTrangThai(Long chiNhanhId, Status trangThai);
}