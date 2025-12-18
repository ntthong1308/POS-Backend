package com.retail.application.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.application.dto.AuditLogDTO;
import com.retail.application.service.audit.AuditLogService;
import com.retail.application.service.employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

/**
 * Aspect tự động ghi log audit cho các method được đánh dấu @Audited
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final EmployeeService employeeService;
    private final ObjectMapper objectMapper;

    /**
     * Pointcut cho tất cả methods trong service layer
     */
    @Pointcut("execution(* com.retail.application.service..*.*(..))")
    public void serviceLayer() {
    }

    /**
     * Pointcut cho các method được đánh dấu @Audited
     */
    @Pointcut("@annotation(com.retail.application.aspect.Audited)")
    public void auditedMethods() {
    }

    /**
     * Around advice để ghi log audit
     */
    @Around("serviceLayer() && auditedMethods()")
    public Object logAudit(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Audited audited = method.getAnnotation(Audited.class);

        // Get method parameters
        Object[] args = joinPoint.getArgs();
        Object result = null;
        Exception exception = null;

        String action = audited.action();
        String entityName = audited.entityName();

        // Try to execute the method
        try {
            result = joinPoint.proceed();
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            // Log audit after method execution (even if it fails)
            try {
                createAuditLog(joinPoint, method, args, result, action, entityName, exception);
            } catch (Exception e) {
                log.error("Failed to create audit log", e);
                // Don't throw exception to avoid breaking the original method execution
            }
        }

        return result;
    }

    private void createAuditLog(JoinPoint joinPoint, Method method, Object[] args, Object result,
                                String action, String entityName, Exception exception) {
        try {
            // Skip audit if method failed (we don't want to audit failed operations)
            if (exception != null) {
                return;
            }

            // Determine action from annotation or method name
            if (action == null || action.isEmpty()) {
                action = determineActionFromMethodName(method.getName());
            }

            // Determine entity name from annotation, method name, or result type
            if (entityName == null || entityName.isEmpty()) {
                entityName = determineEntityName(joinPoint, method, args, result);
            }

            // Get entity ID
            Long entityId = extractEntityId(result, args);

            // Get user information
            Long userId = null;
            String username = null;
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()) {
                    username = authentication.getName();
                    try {
                        var employee = employeeService.findByUsername(username);
                        userId = employee.getId();
                    } catch (Exception e) {
                        log.warn("Could not find employee for username: {}", username, e);
                    }
                }
            } catch (Exception e) {
                log.debug("Could not get user information from SecurityContext", e);
            }

            // Get IP address
            String ipAddress = getClientIpAddress();

            // Serialize old and new values
            String oldValue = null;
            String newValue = null;

            if ("UPDATE".equals(action) && args.length > 0) {
                // For UPDATE, the first argument is usually the DTO with updated values
                // We could fetch old value from database, but that would require entity manager
                // For now, we'll just log the new value
                try {
                    newValue = objectMapper.writeValueAsString(args[0]);
                } catch (Exception e) {
                    log.debug("Could not serialize new value", e);
                }
            } else if ("CREATE".equals(action) && args.length > 0) {
                try {
                    newValue = objectMapper.writeValueAsString(args[0]);
                } catch (Exception e) {
                    log.debug("Could not serialize new value", e);
                }
            } else if ("DELETE".equals(action) && result != null) {
                try {
                    oldValue = objectMapper.writeValueAsString(result);
                } catch (Exception e) {
                    log.debug("Could not serialize old value", e);
                }
            } else if (result != null) {
                // For other actions, log the result
                try {
                    newValue = objectMapper.writeValueAsString(result);
                } catch (Exception e) {
                    log.debug("Could not serialize result", e);
                }
            }

            // Create audit log
            AuditLogDTO auditLogDTO = AuditLogDTO.builder()
                    .entityName(entityName)
                    .entityId(entityId)
                    .action(action)
                    .userId(userId)
                    .username(username)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .build();

            auditLogService.create(auditLogDTO);

        } catch (Exception e) {
            log.error("Error creating audit log", e);
        }
    }

    private String determineActionFromMethodName(String methodName) {
        String lowerMethodName = methodName.toLowerCase();
        if (lowerMethodName.startsWith("create") || lowerMethodName.startsWith("add") || lowerMethodName.startsWith("save")) {
            return "CREATE";
        } else if (lowerMethodName.startsWith("update") || lowerMethodName.startsWith("modify") || lowerMethodName.startsWith("edit")) {
            return "UPDATE";
        } else if (lowerMethodName.startsWith("delete") || lowerMethodName.startsWith("remove")) {
            return "DELETE";
        }
        return "UNKNOWN";
    }

    private String determineEntityName(JoinPoint joinPoint, Method method, Object[] args, Object result) {
        // Try to get from result type
        if (result != null) {
            String className = result.getClass().getSimpleName();
            if (className.endsWith("DTO")) {
                return className.substring(0, className.length() - 3);
            }
            return className;
        }

        // Try to get from first argument
        if (args.length > 0 && args[0] != null) {
            String className = args[0].getClass().getSimpleName();
            if (className.endsWith("DTO")) {
                return className.substring(0, className.length() - 3);
            }
            return className;
        }

        // Try to get from service class name
        String serviceClassName = joinPoint.getTarget().getClass().getSimpleName();
        if (serviceClassName.endsWith("ServiceImpl")) {
            String entityName = serviceClassName.substring(0, serviceClassName.length() - 11);
            return entityName;
        }

        return "Unknown";
    }

    private Long extractEntityId(Object result, Object[] args) {
        // Try to get ID from result
        if (result != null) {
            try {
                if (result instanceof java.util.Map) {
                    Object id = ((java.util.Map<?, ?>) result).get("id");
                    if (id instanceof Number) {
                        return ((Number) id).longValue();
                    }
                } else {
                    // Try to call getId() method via reflection
                    Method getIdMethod = result.getClass().getMethod("getId");
                    Object id = getIdMethod.invoke(result);
                    if (id instanceof Number) {
                        return ((Number) id).longValue();
                    }
                }
            } catch (Exception e) {
                log.debug("Could not extract ID from result", e);
            }
        }

        // Try to get ID from first argument
        if (args.length > 0 && args[0] != null) {
            try {
                if (args[0] instanceof Long) {
                    return (Long) args[0];
                } else if (args[0] instanceof Number) {
                    return ((Number) args[0]).longValue();
                } else {
                    // Try to call getId() method via reflection
                    Method getIdMethod = args[0].getClass().getMethod("getId");
                    Object id = getIdMethod.invoke(args[0]);
                    if (id instanceof Number) {
                        return ((Number) id).longValue();
                    }
                }
            } catch (Exception e) {
                log.debug("Could not extract ID from arguments", e);
            }
        }

        return null;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
                    // Multiple proxies may append IPs, take the first one
                    return xForwardedFor.split(",")[0].trim();
                }
                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
                    return xRealIp;
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Could not get client IP address", e);
        }
        return null;
    }
}

