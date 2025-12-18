package com.retail.application.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO cho audit log
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String entityName;
    private Long entityId;
    private String action; // CREATE, UPDATE, DELETE - Loại hành động
    private Long userId;
    private String username;
    private String oldValue;
    private String newValue;
    private LocalDateTime actionTime;
    private String ipAddress;
}

