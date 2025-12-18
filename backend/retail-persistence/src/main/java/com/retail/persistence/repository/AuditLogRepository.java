package com.retail.persistence.repository;

import com.retail.domain.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEntityNameAndEntityId(String entityName, Long entityId);

    List<AuditLog> findByUserId(Long userId);

    Page<AuditLog> findByActionTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    List<AuditLog> findByEntityNameAndActionTimeBetween(String entityName,
                                                        LocalDateTime startTime,
                                                        LocalDateTime endTime);
}