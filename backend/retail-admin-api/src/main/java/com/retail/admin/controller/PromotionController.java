package com.retail.admin.controller;

import com.retail.application.dto.PromotionDTO;
import com.retail.application.service.promotion.PromotionService;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý khuyến mãi cho Admin - Chỉ ADMIN và MANAGER
 */
@RestController
@RequestMapping("/api/v1/admin/promotions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionDTO>> createPromotion(@Valid @RequestBody PromotionDTO dto) {
        log.info("Creating new promotion: {}", dto.getMaKhuyenMai());
        PromotionDTO created = promotionService.create(dto);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionDTO>> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionDTO dto) {
        log.info("Updating promotion ID: {}", id);
        PromotionDTO updated = promotionService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionById(@PathVariable Long id) {
        log.info("Getting promotion by ID: {}", id);
        PromotionDTO promotion = promotionService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(promotion));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionByCode(@PathVariable String code) {
        log.info("Getting promotion by code: {}", code);
        PromotionDTO promotion = promotionService.findByCode(code);
        return ResponseEntity.ok(ApiResponse.success(promotion));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getAllPromotions() {
        log.info("Getting all promotions");
        List<PromotionDTO> promotions = promotionService.findAll();
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    @GetMapping("/branch/{branchId}/active")
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getActivePromotionsForBranch(
            @PathVariable Long branchId) {
        log.info("Getting active promotions for branch: {}", branchId);
        List<PromotionDTO> promotions = promotionService.findActivePromotionsForBranch(branchId);
        return ResponseEntity.ok(ApiResponse.success(promotions));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<String>> activatePromotion(@PathVariable Long id) {
        log.info("Activating promotion ID: {}", id);
        promotionService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt khuyến mãi thành công"));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<String>> deactivatePromotion(@PathVariable Long id) {
        log.info("Deactivating promotion ID: {}", id);
        promotionService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Vô hiệu hóa khuyến mãi thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePromotion(@PathVariable Long id) {
        log.info("Deleting promotion ID: {}", id);
        promotionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công"));
    }
}

