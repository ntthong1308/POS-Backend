package com.retail.application.service.danhmuc;

import com.retail.application.dto.DanhMucDTO;
import com.retail.common.constant.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DanhMucService {

    DanhMucDTO create(DanhMucDTO dto);

    DanhMucDTO update(Long id, DanhMucDTO dto);

    DanhMucDTO findById(Long id);

    Page<DanhMucDTO> findAll(Pageable pageable);

    Page<DanhMucDTO> search(String keyword, Pageable pageable);

    void delete(Long id);

    void updateStatus(Long id, Status status);
}

