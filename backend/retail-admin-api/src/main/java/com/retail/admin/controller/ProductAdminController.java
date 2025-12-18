package com.retail.admin.controller;

import com.retail.application.dto.ProductDTO;
import com.retail.application.service.product.ProductService;
import com.retail.common.constant.Status;
import com.retail.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ProductAdminController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@Valid @RequestBody ProductDTO dto) {
        log.info("Creating new product: {}", dto.getMaSanPham());
        ProductDTO created = productService.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto) {
        log.info("Updating product ID: {}", id);
        ProductDTO updated = productService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProduct(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success(products,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(products.getTotalElements())
                        .totalPages(products.getTotalPages())
                        .build()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.search(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.success(products,
                ApiResponse.PageInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(products.getTotalElements())
                        .totalPages(products.getTotalPages())
                        .build()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts() {
        List<ProductDTO> products = productService.findLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        log.info("Deleting product ID: {}", id);
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        log.info("Updating product status ID: {} to {}", id, status);
        productService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công"));
    }
}