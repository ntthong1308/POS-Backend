package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.DanhMuc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhMucRepository extends JpaRepository<DanhMuc, Long> {

    Optional<DanhMuc> findByMaDanhMuc(String maDanhMuc);

    boolean existsByMaDanhMuc(String maDanhMuc);

    List<DanhMuc> findByTrangThai(Status trangThai);

    Page<DanhMuc> findByTrangThai(Status trangThai, Pageable pageable);

    @Query("SELECT d FROM DanhMuc d WHERE " +
            "LOWER(d.tenDanhMuc) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.maDanhMuc) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<DanhMuc> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}

