package com.retail.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Test Application for Integration Tests
 *
 * This is a minimal Spring Boot application used only for testing.
 * It scans all necessary packages for entities, repositories, and components.
 */
@SpringBootApplication(scanBasePackages = {
        "com.retail.application",
        "com.retail.persistence",
        "com.retail.domain",
        "com.retail.common"
})
@EnableJpaRepositories(basePackages = "com.retail.persistence.repository")
@EntityScan(basePackages = "com.retail.domain.entity")
public class TestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
}