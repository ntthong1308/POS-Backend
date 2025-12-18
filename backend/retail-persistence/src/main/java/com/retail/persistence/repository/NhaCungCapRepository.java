package com.retail.persistence.repository;

import com.retail.common.constant.Status;
import com.retail.domain.entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Long> {

    Optional<NhaCungCap> findByMaNcc(String maNcc);

    List<NhaCungCap> findByTrangThai(Status trangThai);

    boolean existsByMaNcc(String maNcc);

    List<NhaCungCap> findByTenNccContainingIgnoreCase(String tenNcc);
}