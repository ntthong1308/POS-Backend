package com.retail.application.mapper;

import com.retail.application.dto.AuditLogDTO;
import com.retail.domain.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper cho AuditLog Entity và DTO
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditLogMapper {

    AuditLogDTO toDto(AuditLog entity);

    AuditLog toEntity(AuditLogDTO dto);

    List<AuditLogDTO> toDtoList(List<AuditLog> entities);
}

