package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Long> {

    Optional<NhanVien> findByUsername(String username);

    Optional<NhanVien> findByMaNhanVien(String maNhanVien);

    boolean existsByUsername(String username);

    boolean existsByMaNhanVien(String maNhanVien);

    List<NhanVien> findByTrangThai(Status trangThai);

    Page<NhanVien> findByTrangThai(Status trangThai, Pageable pageable);

    List<NhanVien> findByRole(NhanVien.Role role);

    List<NhanVien> findByChiNhanhIdAndTrangThai(Long chiNhanhId, Status trangThai);
}