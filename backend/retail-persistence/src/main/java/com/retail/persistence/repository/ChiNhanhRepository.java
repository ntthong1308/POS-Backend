package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.ChiNhanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChiNhanhRepository extends JpaRepository<ChiNhanh, Long> {

    Optional<ChiNhanh> findByMaChiNhanh(String maChiNhanh);

    List<ChiNhanh> findByTrangThai(Status trangThai);

    boolean existsByMaChiNhanh(String maChiNhanh);

    List<ChiNhanh> findByTenChiNhanhContainingIgnoreCase(String tenChiNhanh);
}