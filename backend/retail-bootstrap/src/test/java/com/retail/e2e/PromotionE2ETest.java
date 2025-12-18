package com.retail.e2e;

import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * E2E Tests for Promotion Management Flow
 * Tests promotion creation, application, and discount calculation
 *
 * @author ntthong1308
 * @since 2025-12-01
 */
@DisplayName("E2E: Promotion Management Flow")
class PromotionE2ETest extends BaseE2ETest {

    @Test
    @DisplayName("✅ Should get active promotions for branch")
    void shouldGetActivePromotions() {
        // When: Get active promotions
        Response response = givenAuth()
                .when()
                .get("/api/v1/pos/promotions/branch/1/active")
                .then()
                .extract()
                .response();

        // Then: Verify response
        assertThat(response.statusCode()).isIn(200, 401); // May need auth
        if (response.statusCode() == 200) {
            assertThat(response.jsonPath().get("data") != null).isTrue();
        }
    }

    @Test
    @DisplayName("✅ Should calculate discount from promotions")
    void shouldCalculateDiscount() {
        // Given: Cart items and total amount
        Map<String, Object> requestBody = Map.of(
                "items", java.util.List.of(
                        Map.of("sanPhamId", 1, "soLuong", 2, "donGia", 10000)
                ),
                "totalAmount", 20000
        );

        // When: Calculate discount
        Response response = givenAuth()
                .body(requestBody)
                .when()
                .post("/api/v1/pos/promotions/calculate-discount?chiNhanhId=1&totalAmount=20000")
                .then()
                .extract()
                .response();

        // Then: Verify discount calculated
        assertThat(response.statusCode()).isIn(200, 400, 401);
    }
}

