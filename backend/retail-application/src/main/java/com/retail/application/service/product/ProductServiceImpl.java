package com.retail.application.service.product;

import com.retail.application.dto.ProductDTO;
import com.retail.application.mapper.ProductMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.DanhMuc;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.DanhMucRepository;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý quản lý sản phẩm - Hỗ trợ Redis cache với TTL 1 giờ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final SanPhamRepository sanPhamRepository;
    private final DanhMucRepository danhMucRepository;
    private final ProductMapper productMapper;

    /**
     * Tạo sản phẩm mới - Xóa cache sau khi tạo
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDTO create(ProductDTO dto) {
        log.info("Creating new product: {}", dto.getMaSanPham());

        // Normalize barcode: empty string -> null (để tránh unique constraint violation với NULL)
        String barcode = dto.getBarcode();
        if (barcode != null && barcode.trim().isEmpty()) {
            barcode = null;
        }

        // Kiểm tra barcode trùng lặp (chỉ khi có giá trị)
        if (barcode != null && sanPhamRepository.existsByBarcode(barcode)) {
            throw new BusinessException(ErrorCode.DUPLICATE_BARCODE,
                    "Barcode đã tồn tại: " + barcode);
        }

        // Kiểm tra mã sản phẩm trùng lặp
        if (sanPhamRepository.existsByMaSanPham(dto.getMaSanPham())) {
            throw new BusinessException(ErrorCode.DUPLICATE_BARCODE,
                    "Mã sản phẩm đã tồn tại: " + dto.getMaSanPham());
        }

        SanPham entity = productMapper.toEntity(dto);
        // Set barcode normalized (null nếu empty)
        entity.setBarcode(barcode);
        entity.setTrangThai(Status.ACTIVE);

        // Set danh muc if provided
        if (dto.getDanhMucId() != null) {
            DanhMuc danhMuc = danhMucRepository.findById(dto.getDanhMucId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", dto.getDanhMucId()));
            entity.setDanhMuc(danhMuc);
        }

        SanPham saved = sanPhamRepository.save(entity);
        log.info("Product created successfully with ID: {} - Cache cleared", saved.getId());

        return productMapper.toDto(saved);
    }

    /**
     * Cập nhật sản phẩm - Cập nhật cache và xóa list cache
     */
    @Override
    @Transactional
    @Caching(
            put = @CachePut(value = "products", key = "#id"),
            evict = @CacheEvict(value = "products", allEntries = true)
    )
    public ProductDTO update(Long id, ProductDTO dto) {
        log.info("Updating product ID: {}", id);

        SanPham existing = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));

        // Normalize barcode: empty string -> null (để tránh unique constraint violation với NULL)
        String barcode = dto.getBarcode();
        if (barcode != null && barcode.trim().isEmpty()) {
            barcode = null;
        }

        // Kiểm tra barcode trùng lặp (if changed)
        if (barcode != null && !barcode.equals(existing.getBarcode())) {
            if (sanPhamRepository.existsByBarcode(barcode)) {
                throw new BusinessException(ErrorCode.DUPLICATE_BARCODE,
                        "Barcode đã tồn tại: " + barcode);
            }
        }
        
        // Set normalized barcode vào DTO trước khi map
        if (barcode != dto.getBarcode()) {
            dto.setBarcode(barcode);
        }

        productMapper.updateEntityFromDto(dto, existing);
        
        // Set normalized barcode vào entity
        existing.setBarcode(barcode);
        
        // Update danh muc if provided
        if (dto.getDanhMucId() != null) {
            DanhMuc danhMuc = danhMucRepository.findById(dto.getDanhMucId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", dto.getDanhMucId()));
            existing.setDanhMuc(danhMuc);
        } else if (dto.getDanhMucId() == null && existing.getDanhMuc() != null) {
            // Remove danh muc if set to null
            existing.setDanhMuc(null);
        }

        SanPham updated = sanPhamRepository.save(existing);

        log.info("Product updated successfully: {} - Cache updated", id);
        return productMapper.toDto(updated);
    }

    /**
     * ⭐ CACHED - Find product by ID
     *
     * First call: Query database (slow ~200-500ms)
     * Subsequent calls: Get from Redis (fast ~10-50ms)
     * Cache TTL: 1 hour
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    public ProductDTO findById(Long id) {
        log.info("Finding product by ID: {} - Checking cache first", id);

        SanPham entity = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));

        log.info("Product found from database: {} - Will be cached", id);
        return productMapper.toDto(entity);
    }

    /**
     * ⭐ CACHED - Find product by barcode
     *
     * Cache key: "barcode:{barcode}"
     * Cache TTL: 1 hour
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'barcode:' + #barcode", unless = "#result == null")
    public ProductDTO findByBarcode(String barcode) {
        log.info("Finding product by barcode: {} - Checking cache first", barcode);

        SanPham entity = sanPhamRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm với barcode: " + barcode));

        log.info("Product found by barcode from database: {} - Will be cached", barcode);
        return productMapper.toDto(entity);
    }

    /**
     * Find all products with pagination
     * 
     * NOTE: Cache disabled for Page results due to PageImpl deserialization issues with Redis
     * Individual products are still cached via findById() and findByBarcode()
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> findAll(Pageable pageable) {
        log.info("Finding all products - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<ProductDTO> result = sanPhamRepository.findByTrangThai(Status.ACTIVE, pageable)
                .map(productMapper::toDto);

        log.info("Products found from database: {} items", result.getTotalElements());
        return result;
    }

    /**
     * Search products by keyword
     * 
     * NOTE: Cache disabled for Page results due to PageImpl deserialization issues with Redis
     * Individual products are still cached via findById() and findByBarcode()
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> search(String keyword, Pageable pageable) {
        log.info("Searching products with keyword: '{}'", keyword);

        Page<ProductDTO> result = sanPhamRepository.searchByKeyword(keyword, pageable)
                .map(productMapper::toDto);

        log.info("Search found: {} items from database", result.getTotalElements());
        return result;
    }

    /**
     * Low stock products - NOT CACHED
     * Real-time data, changes frequently
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findLowStockProducts() {
        log.info("Finding low stock products - NO CACHE (real-time data)");

        return productMapper.toDtoList(
                sanPhamRepository.findLowStockProducts(Status.ACTIVE));
    }

    /**
     * Delete product - Evict all cache
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void delete(Long id) {
        log.info("Deleting product ID: {} - Cache will be cleared", id);

        SanPham entity = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));

        entity.setTrangThai(Status.DELETED);
        sanPhamRepository.save(entity);

        log.info("Product marked as deleted: {} - All cache cleared", id);
    }

    /**
     * Update status - Evict all cache
     */
    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void updateStatus(Long id, Status status) {
        log.info("Updating product status ID: {} to {} - Cache will be cleared", id, status);

        SanPham entity = sanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", id));

        entity.setTrangThai(status);
        sanPhamRepository.save(entity);

        log.info("Product status updated: {} - All cache cleared", id);
    }
}