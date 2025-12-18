package com.retail.application.service.audit;

import com.retail.application.dto.AuditLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface service xử lý audit log - Ghi lại các thao tác quan trọng
 */
public interface AuditLogService {

    /**
     * Tạo entry audit log
     */
    AuditLogDTO create(AuditLogDTO dto);

    /**
     * Lấy audit log theo ID
     */
    AuditLogDTO findById(Long id);

    /**
     * Lấy audit logs theo tên entity và ID entity
     */
    List<AuditLogDTO> findByEntity(String entityName, Long entityId);

    /**
     * Lấy audit logs theo user ID
     */
    List<AuditLogDTO> findByUserId(Long userId);

    /**
     * Lấy audit logs theo khoảng thời gian với phân trang
     */
    Page<AuditLogDTO> findByDateRange(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    /**
     * Lấy audit logs theo tên entity và khoảng thời gian
     */
    List<AuditLogDTO> findByEntityAndDateRange(String entityName, LocalDateTime startTime, LocalDateTime endTime);
}

