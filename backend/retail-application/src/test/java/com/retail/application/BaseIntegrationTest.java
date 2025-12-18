package com.retail.application;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MSSQLServerContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = TestApplication.class
)
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class BaseIntegrationTest {

    // ✅ THÊM STATIC BLOCK NÀY ĐỂ DISABLE RYUK
    static {
        System.setProperty("testcontainers.ryuk.disabled", "true");
    }

    @Container
    static MSSQLServerContainer<?> sqlServerContainer = new MSSQLServerContainer<>(
            "mcr.microsoft.com/mssql/server:2022-latest"
    )
            .acceptLicense()
            .withPassword("YourStrong@Passw0rd")
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlServerContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlServerContainer::getUsername);
        registry.add("spring.datasource.password", sqlServerContainer::getPassword);
        registry.add("spring.datasource.driver-class-name",
                () -> "com.microsoft.sqlserver.jdbc.SQLServerDriver");
    }

    @BeforeAll
    static void beforeAll() {
        if (!sqlServerContainer.isRunning()) {
            throw new IllegalStateException("SQL Server container is not running!");
        }

        System.out.println("=".repeat(80));
        System.out.println("🐳 TESTCONTAINERS: SQL Server started successfully!");
        System.out.println("📦 Container ID: " + sqlServerContainer.getContainerId());
        System.out.println("🔗 JDBC URL: " + sqlServerContainer.getJdbcUrl());
        System.out.println("👤 Username: " + sqlServerContainer.getUsername());
        System.out.println("=".repeat(80));
    }
}