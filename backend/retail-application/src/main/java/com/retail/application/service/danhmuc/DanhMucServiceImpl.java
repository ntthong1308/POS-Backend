package com.retail.application.service.danhmuc;

import com.retail.application.dto.DanhMucDTO;
import com.retail.application.mapper.DanhMucMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.DanhMuc;
import com.retail.persistence.repository.DanhMucRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final DanhMucMapper danhMucMapper;

    @Override
    @Transactional
    public DanhMucDTO create(DanhMucDTO dto) {
        log.info("Creating new danh muc: {}", dto.getMaDanhMuc());

        if (danhMucRepository.existsByMaDanhMuc(dto.getMaDanhMuc())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Mã danh mục đã tồn tại: " + dto.getMaDanhMuc());
        }

        DanhMuc entity = danhMucMapper.toEntity(dto);
        
        if (entity.getTrangThai() == null) {
            entity.setTrangThai(Status.ACTIVE);
        }

        DanhMuc saved = danhMucRepository.save(entity);
        log.info("Danh muc created successfully: {}", saved.getId());
        
        return danhMucMapper.toDto(saved);
    }

    @Override
    @Transactional
    public DanhMucDTO update(Long id, DanhMucDTO dto) {
        log.info("Updating danh muc ID: {}", id);

        DanhMuc existing = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));

        // Check mã danh mục trùng lặp (if changed)
        if (!dto.getMaDanhMuc().equals(existing.getMaDanhMuc())) {
            if (danhMucRepository.existsByMaDanhMuc(dto.getMaDanhMuc())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Mã danh mục đã tồn tại: " + dto.getMaDanhMuc());
            }
        }

        danhMucMapper.updateEntityFromDto(dto, existing);
        DanhMuc updated = danhMucRepository.save(existing);

        log.info("Danh muc updated successfully: {}", id);
        return danhMucMapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DanhMucDTO findById(Long id) {
        DanhMuc entity = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
        return danhMucMapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DanhMucDTO> findAll(Pageable pageable) {
        Page<DanhMuc> entities = danhMucRepository.findByTrangThai(Status.ACTIVE, pageable);
        return entities.map(danhMucMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DanhMucDTO> search(String keyword, Pageable pageable) {
        Page<DanhMuc> entities = danhMucRepository.searchByKeyword(keyword, pageable);
        return entities.map(danhMucMapper::toDto);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        DanhMuc entity = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
        entity.setTrangThai(Status.INACTIVE);
        danhMucRepository.save(entity);
        log.info("Danh muc deleted (soft delete) ID: {}", id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Status status) {
        DanhMuc entity = danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", id));
        entity.setTrangThai(status);
        danhMucRepository.save(entity);
        log.info("Danh muc status updated ID: {} to {}", id, status);
    }
}

