package com.retail.application.infrastructure;

import com.retail.application.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verify Testcontainers and database connection
 */
@DisplayName("Database Connection Tests")
class DatabaseConnectionTest extends BaseIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("✅ Should connect to SQL Server successfully")
    void shouldConnectToDatabase() {
        // Act
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        // Assert
        assertThat(result).isEqualTo(1);
        System.out.println("✅ Database connection verified!");
    }

    @Test
    @DisplayName("✅ Should verify SQL Server version")
    void shouldVerifySqlServerVersion() {
        // Act
        String version = jdbcTemplate.queryForObject(
                "SELECT @@VERSION",
                String.class
        );

        // Assert
        assertThat(version).isNotNull();
        assertThat(version).contains("Microsoft SQL Server");
        System.out.println("✅ SQL Server version: " + version.substring(0, 50) + "...");
    }

    @Test
    @DisplayName("✅ Should create and query table")
    void shouldCreateAndQueryTable() {
        // Arrange
        jdbcTemplate.execute(
                "CREATE TABLE test_table (id INT PRIMARY KEY, name NVARCHAR(100))"
        );
        jdbcTemplate.execute(
                "INSERT INTO test_table VALUES (1, N'Test')"
        );

        // Act
        String name = jdbcTemplate.queryForObject(
                "SELECT name FROM test_table WHERE id = 1",
                String.class
        );

        // Assert
        assertThat(name).isEqualTo("Test");
        System.out.println("✅ Table creation and query verified!");

        // Cleanup
        jdbcTemplate.execute("DROP TABLE test_table");
    }
}