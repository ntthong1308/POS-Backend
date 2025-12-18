package com.retail.admin.controller;

import com.retail.application.dto.ImportGoodsRequest;
import com.retail.application.dto.ReturnRequest;
import com.retail.application.service.inventory.InventoryService;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class InventoryAdminController {

    private final InventoryService inventoryService;

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<String>> importGoods(@Valid @RequestBody ImportGoodsRequest request) {
        log.info("Processing import goods request with {} items", request.getItems().size());
        inventoryService.importGoods(request);
        return ResponseEntity.ok(ApiResponse.success("Nhập hàng thành công"));
    }

    @PostMapping("/return")
    public ResponseEntity<ApiResponse<String>> returnGoods(@Valid @RequestBody ReturnRequest request) {
        log.info("Processing return goods request for invoice ID: {}", request.getHoaDonGocId());
        inventoryService.returnGoods(request);
        return ResponseEntity.ok(ApiResponse.success("Trả hàng thành công"));
    }

    @GetMapping("/stock/{productId}")
    public ResponseEntity<ApiResponse<Integer>> checkStock(@PathVariable Long productId) {
        Integer stock = inventoryService.checkStock(productId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }
}