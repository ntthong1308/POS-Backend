package com.retail.api.controller;

import com.retail.application.dto.ProductDTO;
import com.retail.application.service.product.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST API cho quản lý sản phẩm - Hỗ trợ Redis cache
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    /**
     * Lấy sản phẩm theo ID - Có cache Redis
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        log.info("Request to get product by ID: {}", id);

        ProductDTO product = productService.findById(id);

        log.info("Product found: {}", product.getMaSanPham());
        return ResponseEntity.ok(product);
    }

    /**
     * Lấy sản phẩm theo barcode - Có cache Redis
     */
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDTO> getProductByBarcode(@PathVariable String barcode) {
        log.info("Request to get product by barcode: {}", barcode);

        ProductDTO product = productService.findByBarcode(barcode);

        log.info("Product found by barcode: {}", product.getMaSanPham());
        return ResponseEntity.ok(product);
    }

    /**
     * Lấy danh sách sản phẩm với phân trang - Có cache Redis
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(Pageable pageable) {
        log.info("Request to get all products - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<ProductDTO> products = productService.findAll(pageable);

        log.info("Found {} products", products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa - Có cache Redis
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam String keyword,
            Pageable pageable) {
        log.info("Request to search products with keyword: '{}'", keyword);

        Page<ProductDTO> products = productService.search(keyword, pageable);

        log.info("Search found {} products", products.getTotalElements());
        return ResponseEntity.ok(products);
    }

    /**
     * Tạo sản phẩm mới
     */
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        log.info("Request to create new product: {}", productDTO.getMaSanPham());

        ProductDTO created = productService.create(productDTO);

        log.info("Product created successfully with ID: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    /**
     * Cập nhật sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO productDTO) {
        log.info("Request to update product ID: {}", id);

        ProductDTO updated = productService.update(id, productDTO);

        log.info("Product updated successfully: {}", id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa sản phẩm
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("Request to delete product ID: {}", id);

        productService.delete(id);

        log.info("Product deleted successfully: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Kiểm tra trạng thái API
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Product API is running with Redis cache");
    }
}