package com.retail.bootstrap;

import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MSSQLServerContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for integration tests with Testcontainers
 * All integration tests should extend this class
 *
 * Features:
 * - Starts SQL Server container automatically
 * - Configures datasource from container
 * - Runs tests in isolated environment
 * - Shared container across all tests in same class
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public abstract class BaseIntegrationTest {

    @Container
    protected static MSSQLServerContainer<?> mssqlContainer = new MSSQLServerContainer<>(
            "mcr.microsoft.com/mssql/server:2022-latest"
    )
            .acceptLicense()
            .withPassword("Test@123456")
            .withReuse(true); // Reuse container across test runs

    /**
     * Configure Spring properties from Testcontainers
     */
    @DynamicPropertySource
    static void setDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mssqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mssqlContainer::getUsername);
        registry.add("spring.datasource.password", mssqlContainer::getPassword);
    }

    @BeforeAll
    static void beforeAll() {
        // Container will be started automatically by Testcontainers
        System.out.println("🐳 Testcontainers SQL Server started at: " + mssqlContainer.getJdbcUrl());
    }
}