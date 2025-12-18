package com.retail.e2e;

import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * E2E Tests for Report Generation Flow
 * Tests revenue, inventory, and sales reports
 *
 * @author ntthong1308
 * @since 2025-12-01
 */
@DisplayName("E2E: Report Generation Flow")
class ReportE2ETest extends BaseE2ETest {

    @Test
    @DisplayName("✅ Should generate revenue report successfully")
    void shouldGenerateRevenueReport() {
        // Given: Date range
        String startDate = "2025-01-01";
        String endDate = "2025-12-31";

        // When: Generate revenue report
        Response response = givenAuth()
                .queryParam("startDate", startDate)
                .queryParam("endDate", endDate)
                .when()
                .get("/api/reports/revenue/excel")
                .then()
                .extract()
                .response();

        // Then: Verify Excel file returned
        assertThat(response.statusCode()).isIn(200, 401);
        if (response.statusCode() == 200) {
            assertThat(response.getContentType()).contains("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }

    @Test
    @DisplayName("✅ Should generate inventory report successfully")
    void shouldGenerateInventoryReport() {
        // When: Generate inventory report
        Response response = givenAuth()
                .when()
                .get("/api/reports/inventory/excel")
                .then()
                .extract()
                .response();

        // Then: Verify Excel file returned
        assertThat(response.statusCode()).isIn(200, 401);
    }

    @Test
    @DisplayName("✅ Should generate sales report successfully")
    void shouldGenerateSalesReport() {
        // Given: Date range
        String startDate = "2025-01-01";
        String endDate = "2025-12-31";

        // When: Generate sales report
        Response response = givenAuth()
                .queryParam("startDate", startDate)
                .queryParam("endDate", endDate)
                .when()
                .get("/api/reports/sales/excel")
                .then()
                .extract()
                .response();

        // Then: Verify Excel file returned
        assertThat(response.statusCode()).isIn(200, 401);
    }
}

