package com.retail.api.controller;

import com.retail.application.dto.AuditLogDTO;
import com.retail.application.service.audit.AuditLogService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller REST API cho truy vấn audit log - Chỉ ADMIN và MANAGER
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Lấy audit log theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogDTO>> getAuditLogById(@PathVariable Long id) {
        log.info("Request to get audit log by ID: {}", id);
        AuditLogDTO auditLog = auditLogService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(auditLog));
    }

    /**
     * Lấy audit logs cho entity cụ thể
     */
    @GetMapping("/entity/{entityName}/{entityId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsByEntity(
            @PathVariable String entityName,
            @PathVariable Long entityId) {
        log.info("Request to get audit logs for entity: {} - ID: {}", entityName, entityId);
        List<AuditLogDTO> auditLogs = auditLogService.findByEntity(entityName, entityId);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    /**
     * Lấy audit logs cho user cụ thể
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsByUserId(
            @PathVariable Long userId) {
        log.info("Request to get audit logs for user ID: {}", userId);
        List<AuditLogDTO> auditLogs = auditLogService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    /**
     * Lấy audit logs theo khoảng thời gian với phân trang
     */
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Request to get audit logs from {} to {}, page: {}, size: {}", startDate, endDate, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> auditLogs = auditLogService.findByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(auditLogs.getTotalElements())
                        .totalPages(auditLogs.getTotalPages())
                        .build()));
    }

    /**
     * Lấy audit logs cho entity cụ thể theo khoảng thời gian
     */
    @GetMapping("/entity/{entityName}/date-range")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsByEntityAndDateRange(
            @PathVariable String entityName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("Request to get audit logs for entity: {} from {} to {}", entityName, startDate, endDate);
        List<AuditLogDTO> auditLogs = auditLogService.findByEntityAndDateRange(entityName, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }
}

