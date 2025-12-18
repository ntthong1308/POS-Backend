package com.retail.bootstrap.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class để generate BCrypt hash cho passwords
 * Chạy main method này để lấy hash cho password "admin123"
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "admin123";
        String hash = encoder.encode(password);
        
        System.out.println("=========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("=========================================");
        
        // Verify hash
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + (matches ? "✓ PASS" : "✗ FAIL"));
        System.out.println("=========================================");
    }
}


