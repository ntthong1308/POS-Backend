package com.retail.api.exception;

import com.retail.common.constant.ErrorCode;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.HardwareException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ErrorCode.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException ex) {
        log.error("Business exception: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {
        log.error("Validation error: {}", ex.getMessage());

        List<ApiResponse.ErrorDetail> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> ApiResponse.ErrorDetail.builder()
                        .code(ErrorCode.BAD_REQUEST)
                        .field(error.getField())
                        .message(error.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errors));
    }

    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(Exception ex) {
        log.error("Authentication error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ErrorCode.UNAUTHORIZED, "Username hoặc password không chính xác"));
    }

    @ExceptionHandler(HardwareException.class)
    public ResponseEntity<ApiResponse<?>> handleHardwareException(HardwareException ex) {
        log.error("Hardware error: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error(ErrorCode.HARDWARE_ERROR, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneralException(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, "Đã xảy ra lỗi hệ thống"));
    }
}