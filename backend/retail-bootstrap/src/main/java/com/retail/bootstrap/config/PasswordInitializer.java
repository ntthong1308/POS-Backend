package com.retail.bootstrap.config;

import com.retail.application.service.employee.EmployeeService;
import com.retail.persistence.repository.NhanVienRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component tự động fix password cho default users khi application start
 * Chỉ chạy trong profile "default" (development)
 * Chỉ reset password nếu password hiện tại không đúng (chỉ chạy 1 lần)
 * TODO: Xóa hoặc disable component này trong production
 */
@Component
@Profile("default")
@Order(1)
public class PasswordInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PasswordInitializer.class);
    private final EmployeeService employeeService;
    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordInitializer(EmployeeService employeeService,
                               NhanVienRepository nhanVienRepository,
                               PasswordEncoder passwordEncoder) {
        this.employeeService = employeeService;
        this.nhanVienRepository = nhanVienRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String DEFAULT_PASSWORD = "admin123";
    private static final String[] DEFAULT_USERS = {"admin", "manager1", "cashier1"};

    @Override
    public void run(String... args) {
        log.info("=========================================");
        log.info("🔧 Checking default user passwords...");
        log.info("=========================================");

        int fixedCount = 0;
        int skippedCount = 0;

        for (String username : DEFAULT_USERS) {
            try {
                // Kiểm tra user có tồn tại không và lấy password hash
                String currentPasswordHash = nhanVienRepository.findByUsername(username)
                        .map(nv -> nv.getPassword())
                        .orElse(null);

                if (currentPasswordHash == null) {
                    log.warn("⚠️  User '{}' not found, skipping", username);
                    continue;
                }

                // Kiểm tra xem password hiện tại có đúng không
                boolean passwordCorrect = passwordEncoder.matches(DEFAULT_PASSWORD, currentPasswordHash);

                if (passwordCorrect) {
                    log.info("✓ Password for user '{}' is already correct, skipping", username);
                    skippedCount++;
                } else {
                    // Password không đúng, reset lại
                    employeeService.resetPassword(username, DEFAULT_PASSWORD);
                    log.info("✅ Password reset successfully for user: {}", username);
                    fixedCount++;
                }
            } catch (Exception e) {
                log.error("❌ Error checking/resetting password for user '{}': {}", username, e.getMessage());
            }
        }

        log.info("=========================================");
        if (fixedCount > 0) {
            log.info("✅ Password initialization completed!");
            log.info("Fixed: {} users | Skipped: {} users", fixedCount, skippedCount);
        } else {
            log.info("✓ All passwords are already correct. No changes needed.");
        }
        log.info("Default password for all users: {}", DEFAULT_PASSWORD);
        log.info("=========================================");
    }
}

