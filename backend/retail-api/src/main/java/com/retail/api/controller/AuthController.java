package com.retail.api.controller;

import com.retail.api.dto.LoginRequest;
import com.retail.api.dto.LoginResponse;
import com.retail.application.dto.EmployeeDTO;
import com.retail.application.service.employee.EmployeeService;
import com.retail.common.response.ApiResponse;
import com.retail.security.jwt.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmployeeService employeeService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Get employee details
        EmployeeDTO employee = employeeService.findByUsername(userDetails.getUsername());

        LoginResponse response = LoginResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(employee.getId())
                .username(employee.getUsername())
                .tenNhanVien(employee.getTenNhanVien())
                .email(employee.getEmail())
                .role(employee.getRole())
                .chiNhanhId(employee.getChiNhanhId())
                .tenChiNhanh(employee.getTenChiNhanh())
                .build();

        log.info("Login successful for user: {}", request.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.error("UNAUTHORIZED", "Chưa đăng nhập"));
        }

        String username = authentication.getName();
        EmployeeDTO employee = employeeService.findByUsername(username);

        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công"));
    }

    /**
     * Utility endpoint để generate BCrypt hash cho password
     * TODO: Xóa endpoint này sau khi đã fix password trong database
     */
    @GetMapping("/generate-hash")
    public ResponseEntity<ApiResponse<String>> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        log.info("Generated BCrypt hash for password '{}': {}", password, hash);
        return ResponseEntity.ok(ApiResponse.success(hash));
    }

    /**
     * Utility endpoint để reset password cho user (development only)
     * TODO: Xóa endpoint này sau khi đã fix password trong database
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String username,
            @RequestParam String newPassword) {
        try {
            employeeService.resetPassword(username, newPassword);
            return ResponseEntity.ok(ApiResponse.success(
                    "Password đã được reset thành công cho user: " + username));
        } catch (Exception e) {
            log.error("Error resetting password for {}: {}", username, e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("RESET_FAILED",
                    "Không thể reset password: " + e.getMessage()));
        }
    }
}