package com.retail.application.service.audit;

import com.retail.application.dto.AuditLogDTO;
import com.retail.application.mapper.AuditLogMapper;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.AuditLog;
import com.retail.persistence.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service xử lý ghi log audit - Ghi lại các thao tác quan trọng trong hệ thống
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional
    public AuditLogDTO create(AuditLogDTO dto) {
        log.debug("Creating audit log: {} - {} - {}", dto.getEntityName(), dto.getEntityId(), dto.getAction());

        AuditLog entity = auditLogMapper.toEntity(dto);
        entity.setActionTime(LocalDateTime.now());

        AuditLog saved = auditLogRepository.save(entity);
        log.debug("Audit log created with ID: {}", saved.getId());

        return auditLogMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogDTO findById(Long id) {
        log.debug("Finding audit log by ID: {}", id);

        AuditLog entity = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log", id));

        return auditLogMapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> findByEntity(String entityName, Long entityId) {
        log.debug("Finding audit logs for entity: {} - ID: {}", entityName, entityId);

        List<AuditLog> logs = auditLogRepository.findByEntityNameAndEntityId(entityName, entityId);
        return auditLogMapper.toDtoList(logs);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> findByUserId(Long userId) {
        log.debug("Finding audit logs for user ID: {}", userId);

        List<AuditLog> logs = auditLogRepository.findByUserId(userId);
        return auditLogMapper.toDtoList(logs);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> findByDateRange(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        log.debug("Finding audit logs from {} to {}", startTime, endTime);

        Page<AuditLog> logs = auditLogRepository.findByActionTimeBetween(startTime, endTime, pageable);
        return logs.map(auditLogMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDTO> findByEntityAndDateRange(String entityName, LocalDateTime startTime, LocalDateTime endTime) {
        log.debug("Finding audit logs for entity: {} from {} to {}", entityName, startTime, endTime);

        List<AuditLog> logs = auditLogRepository.findByEntityNameAndActionTimeBetween(entityName, startTime, endTime);
        return auditLogMapper.toDtoList(logs);
    }
}

