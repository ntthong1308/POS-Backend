package com.retail.pos.controller;

import com.retail.application.dto.ProductDTO;
import com.retail.application.service.pos.PosService;
import com.retail.application.service.product.ProductService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pos/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'MANAGER', 'ADMIN')")
public class PosProductController {

    private final ProductService productService;
    private final PosService posService;

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

    @GetMapping("/scan/{barcode}")
    public ResponseEntity<ApiResponse<ProductDTO>> scanProduct(@PathVariable String barcode) {
        log.info("Scanning product with barcode: {}", barcode);
        ProductDTO product = posService.scanProduct(barcode);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
}