package com.retail.api.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter ghi log request/response với correlation IDs - Thêm correlation ID vào MDC cho tất cả logs
 */
@Component
@Order(1)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";
    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final String USER_MDC_KEY = "user";
    private static final String IP_MDC_KEY = "ip";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Generate or get correlation ID
        String correlationId = getOrGenerateCorrelationId(request);
        
        // Get request info
        String requestId = UUID.randomUUID().toString();
        String user = getCurrentUser(request);
        String ip = getClientIpAddress(request);

        // Add to MDC (Mapped Diagnostic Context) for all logs in this request
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        MDC.put(USER_MDC_KEY, user != null ? user : "anonymous");
        MDC.put(IP_MDC_KEY, ip);

        // Add correlation ID to response header
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        // Wrap request/response to enable reading body multiple times
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            // Log request
            logRequest(wrappedRequest, correlationId, requestId, user, ip);

            // Continue filter chain
            filterChain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            // Log response
            long duration = System.currentTimeMillis() - startTime;
            logResponse(wrappedResponse, correlationId, requestId, duration);

            // Copy response body to actual response
            wrappedResponse.copyBodyToResponse();

            // Clear MDC
            MDC.clear();
        }
    }

    private String getOrGenerateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    private String getCurrentUser(HttpServletRequest request) {
        // Get user from security context if available
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Ignore if security context not available
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private void logRequest(HttpServletRequest request, String correlationId,
                           String requestId, String user, String ip) {
        if (log.isDebugEnabled()) {
            log.debug("Incoming request: {} {} from {} (user: {})",
                    request.getMethod(),
                    request.getRequestURI(),
                    ip,
                    user != null ? user : "anonymous");
        }
    }

    private void logResponse(ContentCachingResponseWrapper response, String correlationId,
                            String requestId, long duration) {
        int status = response.getStatus();
        
        if (log.isDebugEnabled()) {
            log.debug("Response: status={}, duration={}ms", status, duration);
        } else if (status >= 400) {
            // Always log errors
            log.warn("Response error: status={}, duration={}ms", status, duration);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip logging for actuator endpoints to reduce noise
        String path = request.getRequestURI();
        return path.startsWith("/actuator/") || 
               path.startsWith("/swagger-ui/") || 
               path.startsWith("/v3/api-docs/");
    }
}

