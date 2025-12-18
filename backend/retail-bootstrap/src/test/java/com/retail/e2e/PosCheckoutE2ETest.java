package com.retail.e2e;

import com.retail.application.dto.CartItemDTO;
import com.retail.application.dto.CheckoutRequest;
import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.jdbc.Sql;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * E2E Tests for POS Checkout Flow
 * Tests complete checkout process from cart to invoice creation
 *
 * @author ntthong1308
 * @since 2025-12-01
 */
@DisplayName("E2E: POS Checkout Flow")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class PosCheckoutE2ETest extends BaseE2ETest {

    @Test
    @DisplayName("✅ Should complete checkout successfully with multiple items")
    @Sql(scripts = "/db/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    void shouldCompleteCheckoutSuccessfully() {
        // Given: Cart with items
        CheckoutRequest request = CheckoutRequest.builder()
                .chiNhanhId(1L)
                .nhanVienId(3L) // cashier1
                .khachHangId(1L)
                .items(List.of(
                        CartItemDTO.builder()
                                .sanPhamId(1L)
                                .soLuong(2)
                                .donGia(new BigDecimal("10000"))
                                .build(),
                        CartItemDTO.builder()
                                .sanPhamId(2L)
                                .soLuong(3)
                                .donGia(new BigDecimal("8000"))
                                .build()
                ))
                .phuongThucThanhToan("Tiền mặt")
                .giamGia(new BigDecimal("5000"))
                .build();

        // When: Checkout
        Response response = givenAuth()
                .body(request)
                .when()
                .post("/api/v1/pos/checkout")
                .then()
                .statusCode(200)
                .extract()
                .response();

        // Then: Verify invoice created
        assertThat(response.jsonPath().getString("success")).isEqualTo("true");
        assertThat(response.jsonPath().getString("data.maHoaDon")).isNotNull();
        
        // Get BigDecimal from JSON path
        Object tongTienObj = response.jsonPath().get("data.tongTien");
        if (tongTienObj instanceof Number) {
            BigDecimal tongTien = new BigDecimal(tongTienObj.toString());
            assertThat(tongTien).isEqualByComparingTo(new BigDecimal("44000")); // (2*10000) + (3*8000)
        }
        
        Object giamGiaObj = response.jsonPath().get("data.giamGia");
        if (giamGiaObj instanceof Number) {
            BigDecimal giamGia = new BigDecimal(giamGiaObj.toString());
            assertThat(giamGia).isEqualByComparingTo(new BigDecimal("5000"));
        }
    }

    @Test
    @DisplayName("✅ Should validate cart before checkout")
    void shouldValidateCart() {
        // Given: Invalid cart (product not exists)
        CheckoutRequest request = CheckoutRequest.builder()
                .chiNhanhId(1L)
                .nhanVienId(3L)
                .items(List.of(
                        CartItemDTO.builder()
                                .sanPhamId(999L) // Non-existent product
                                .soLuong(1)
                                .donGia(new BigDecimal("10000"))
                                .build()
                ))
                .phuongThucThanhToan("Tiền mặt")
                .build();

        // When: Validate cart
        Response response = givenAuth()
                .body(request)
                .when()
                .post("/api/v1/pos/checkout/validate")
                .then()
                .extract()
                .response();

        // Then: Should return error
        assertThat(response.statusCode()).isGreaterThanOrEqualTo(400);
    }
}

