package com.retail.pos.controller;

import com.retail.application.dto.AppliedPromotionDTO;
import com.retail.application.dto.CartItemDTO;
import com.retail.application.dto.PromotionDTO;
import com.retail.application.service.promotion.PromotionService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller khuyến mãi cho POS - Xem và áp dụng khuyến mãi khi checkout
 */
@RestController
@RequestMapping("/api/v1/pos/promotions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
public class PromotionPosController {

    private final PromotionService promotionService;

    /**
     * Lấy danh sách khuyến mãi đang hoạt động cho chi nhánh
     */
    @GetMapping("/branch/{branchId}/active")
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getActivePromotions(
            @PathVariable Long branchId) {
        log.info("Getting active promotions for branch: {}", branchId);
        List<PromotionDTO> promotions = promotionService.findActivePromotionsForBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    /**
     * Tính toán giảm giá từ khuyến mãi cho giỏ hàng
     */
    @PostMapping("/calculate-discount")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateDiscount(
            @RequestParam Long chiNhanhId,
            @RequestBody List<CartItemDTO> cartItems,
            @RequestParam BigDecimal totalAmount) {
        log.info("Calculating discount for branch: {}, items: {}, total: {}",
                chiNhanhId, cartItems.size(), totalAmount);

        BigDecimal discount = promotionService.calculateDiscount(chiNhanhId, cartItems, totalAmount);
        Map<Long, AppliedPromotionDTO> appliedPromotions = promotionService.applyPromotionsToCart(
                chiNhanhId, cartItems, totalAmount);

        Map<String, Object> result = Map.of(
                "totalDiscount", discount,
                "appliedPromotions", appliedPromotions,
                "finalAmount", totalAmount.subtract(discount)
        );

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Lấy khuyến mãi theo mã
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionByCode(@PathVariable String code) {
        log.info("Getting promotion by code: {}", code);
        PromotionDTO promotion = promotionService.findByCode(code);
        return ResponseEntity.ok(ApiResponse.success(promotion));
    }
}

