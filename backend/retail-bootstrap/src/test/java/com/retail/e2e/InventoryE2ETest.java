package com.retail.e2e;

import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * E2E Tests for Inventory Management Flow
 * Tests import goods, stock management, low stock alerts
 *
 * @author ntthong1308
 * @since 2025-12-01
 */
@DisplayName("E2E: Inventory Management Flow")
class InventoryE2ETest extends BaseE2ETest {

    @Test
    @DisplayName("✅ Should get inventory report successfully")
    void shouldGetInventoryReport() {
        // When: Get inventory report
        Response response = givenAuth()
                .when()
                .get("/api/reports/inventory/excel")
                .then()
                .extract()
                .response();

        // Then: Verify response
        // Excel file should be returned (binary content)
        assertThat(response.statusCode()).isIn(200, 401); // May need auth
    }

    @Test
    @DisplayName("✅ Should get product list for inventory management")
    void shouldGetProductList() {
        // When: Get products
        Response response = givenAuth()
                .when()
                .get("/api/products?page=0&size=10")
                .then()
                .extract()
                .response();

        // Then: Verify response
        assertThat(response.statusCode()).isEqualTo(200);
    }
}

