package com.retail.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_entity_name", columnList = "entity_name"),
        @Index(name = "idx_action_time", columnList = "action_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "action", nullable = false, length = 50)
    private String action; // CREATE, UPDATE, DELETE

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "action_time", nullable = false)
    private LocalDateTime actionTime;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}