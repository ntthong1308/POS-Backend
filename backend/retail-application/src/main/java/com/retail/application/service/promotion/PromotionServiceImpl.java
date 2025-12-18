package com.retail.application.service.promotion;

import com.retail.application.dto.AppliedPromotionDTO;
import com.retail.application.dto.CartItemDTO;
import com.retail.application.dto.PromotionDTO;
import com.retail.application.mapper.PromotionMapper;
import com.retail.common.constant.ErrorCode;
import com.retail.common.constant.Status;
import com.retail.common.exception.BusinessException;
import com.retail.common.exception.ResourceNotFoundException;
import com.retail.domain.entity.ChiNhanh;
import com.retail.domain.entity.ChiTietKhuyenMai;
import com.retail.domain.entity.KhuyenMai;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.ChiNhanhRepository;
import com.retail.persistence.repository.ChiTietKhuyenMaiRepository;
import com.retail.persistence.repository.KhuyenMaiRepository;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý quản lý khuyến mãi - Hỗ trợ nhiều loại khuyến mãi và tính toán giảm giá
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionServiceImpl implements PromotionService {

    private final KhuyenMaiRepository khuyenMaiRepository;
    private final ChiTietKhuyenMaiRepository chiTietKhuyenMaiRepository;
    private final ChiNhanhRepository chiNhanhRepository;
    private final SanPhamRepository sanPhamRepository;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public PromotionDTO create(PromotionDTO dto) {
        log.info("Creating new promotion: {}", dto.getMaKhuyenMai());

        // Validate promotion code uniqueness
        if (khuyenMaiRepository.findByMaKhuyenMai(dto.getMaKhuyenMai()).isPresent()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Mã khuyến mãi đã tồn tại: " + dto.getMaKhuyenMai());
        }

        // Create entity
        KhuyenMai entity = promotionMapper.toEntity(dto);
        entity.setTrangThai(Status.ACTIVE);

        // Set branch if provided
        if (dto.getChiNhanhId() != null) {
            ChiNhanh chiNhanh = chiNhanhRepository.findById(dto.getChiNhanhId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", dto.getChiNhanhId()));
            entity.setChiNhanh(chiNhanh);
        }

        // Save promotion
        KhuyenMai saved = khuyenMaiRepository.save(entity);

        // Add product relationships if provided
        if (dto.getSanPhamIds() != null && !dto.getSanPhamIds().isEmpty()) {
            for (Long sanPhamId : dto.getSanPhamIds()) {
                SanPham sanPham = sanPhamRepository.findById(sanPhamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", sanPhamId));

                ChiTietKhuyenMai chiTiet = ChiTietKhuyenMai.builder()
                        .khuyenMai(saved)
                        .sanPham(sanPham)
                        .apDung(true)
                        .build();

                saved.addChiTiet(chiTiet);
            }
            saved = khuyenMaiRepository.save(saved);
        }

        log.info("Promotion created successfully with ID: {}", saved.getId());
        return promotionMapper.toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public PromotionDTO update(Long id, PromotionDTO dto) {
        log.info("Updating promotion ID: {}", id);

        KhuyenMai existing = khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", id));

        // Validate promotion code uniqueness if changed
        if (!dto.getMaKhuyenMai().equals(existing.getMaKhuyenMai())) {
            if (khuyenMaiRepository.findByMaKhuyenMai(dto.getMaKhuyenMai()).isPresent()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Mã khuyến mãi đã tồn tại: " + dto.getMaKhuyenMai());
            }
        }

        // Update basic fields
        existing.setTenKhuyenMai(dto.getTenKhuyenMai());
        existing.setMoTa(dto.getMoTa());
        existing.setLoaiKhuyenMai(dto.getLoaiKhuyenMai());
        existing.setNgayBatDau(dto.getNgayBatDau());
        existing.setNgayKetThuc(dto.getNgayKetThuc());
        existing.setGiaTriKhuyenMai(dto.getGiaTriKhuyenMai());
        existing.setGiaTriToiThieu(dto.getGiaTriToiThieu());
        existing.setGiamToiDa(dto.getGiamToiDa());
        existing.setSoLuongMua(dto.getSoLuongMua());
        existing.setSoLuongTang(dto.getSoLuongTang());
        existing.setSoLanSuDungToiDa(dto.getSoLanSuDungToiDa());
        existing.setTongSoLanSuDungToiDa(dto.getTongSoLanSuDungToiDa());
        
        // Update status (quan trọng: cho phép chuyển ACTIVE <-> INACTIVE)
        if (dto.getTrangThai() != null) {
            existing.setTrangThai(dto.getTrangThai());
        }

        // Update branch
        if (dto.getChiNhanhId() != null) {
            ChiNhanh chiNhanh = chiNhanhRepository.findById(dto.getChiNhanhId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh", dto.getChiNhanhId()));
            existing.setChiNhanh(chiNhanh);
        } else {
            existing.setChiNhanh(null);
        }

        // Update product relationships
        if (dto.getSanPhamIds() != null) {
            // Remove existing relationships
            chiTietKhuyenMaiRepository.deleteByKhuyenMaiId(existing.getId());
            existing.getChiTietKhuyenMais().clear();

            // Add new relationships
            for (Long sanPhamId : dto.getSanPhamIds()) {
                SanPham sanPham = sanPhamRepository.findById(sanPhamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", sanPhamId));

                ChiTietKhuyenMai chiTiet = ChiTietKhuyenMai.builder()
                        .khuyenMai(existing)
                        .sanPham(sanPham)
                        .apDung(true)
                        .build();

                existing.addChiTiet(chiTiet);
            }
        }

        KhuyenMai updated = khuyenMaiRepository.save(existing);
        log.info("Promotion updated successfully: {}", id);

        return enrichPromotionDTO(promotionMapper.toDto(updated), updated);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotions", key = "#id", unless = "#result == null")
    public PromotionDTO findById(Long id) {
        log.info("Finding promotion by ID: {}", id);
        KhuyenMai entity = khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", id));
        return enrichPromotionDTO(promotionMapper.toDto(entity), entity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotions", key = "'code:' + #maKhuyenMai", unless = "#result == null")
    public PromotionDTO findByCode(String maKhuyenMai) {
        log.info("Finding promotion by code: {}", maKhuyenMai);
        KhuyenMai entity = khuyenMaiRepository.findByMaKhuyenMai(maKhuyenMai)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", maKhuyenMai));
        return enrichPromotionDTO(promotionMapper.toDto(entity), entity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotions", key = "'branch:' + #chiNhanhId + ':' + T(java.time.LocalDateTime).now().toLocalDate()", unless = "#result.isEmpty()")
    public List<PromotionDTO> findActivePromotionsForBranch(Long chiNhanhId) {
        log.info("Finding active promotions for branch: {}", chiNhanhId);
        List<KhuyenMai> promotions = khuyenMaiRepository.findActivePromotionsForBranch(
                Status.ACTIVE, chiNhanhId, LocalDateTime.now());
        return promotions.stream()
                .filter(KhuyenMai::isActive)
                .map(entity -> enrichPromotionDTO(promotionMapper.toDto(entity), entity))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionDTO> findAll() {
        log.info("Finding all promotions");
        List<KhuyenMai> entities = khuyenMaiRepository.findAll();
        return entities.stream()
                .map(entity -> enrichPromotionDTO(promotionMapper.toDto(entity), entity))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, AppliedPromotionDTO> applyPromotionsToCart(
            Long chiNhanhId, List<CartItemDTO> cartItems, BigDecimal totalAmount) {

        log.info("Applying promotions to cart - Branch: {}, Items: {}, Total: {}",
                chiNhanhId, cartItems.size(), totalAmount);

        Map<Long, AppliedPromotionDTO> appliedPromotions = new HashMap<>();

        // Get active promotions for this branch
        List<KhuyenMai> activePromotions = khuyenMaiRepository.findActivePromotionsForBranch(
                Status.ACTIVE, chiNhanhId, LocalDateTime.now());

        activePromotions = activePromotions.stream()
                .filter(KhuyenMai::isActive)
                .collect(Collectors.toList());

        // Group cart items by product ID for easier processing
        Map<Long, CartItemDTO> cartItemMap = cartItems.stream()
                .collect(Collectors.toMap(CartItemDTO::getSanPhamId, item -> item, (a, b) -> a));

        // Apply promotions
        for (KhuyenMai promotion : activePromotions) {
            AppliedPromotionDTO applied = applyPromotion(promotion, cartItems, totalAmount, cartItemMap);
            if (applied != null && applied.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                // Use promotion ID as key, or create a composite key if needed
                appliedPromotions.put(promotion.getId(), applied);
            }
        }

        return appliedPromotions;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateDiscount(Long chiNhanhId, List<CartItemDTO> cartItems, BigDecimal totalAmount) {
        Map<Long, AppliedPromotionDTO> appliedPromotions = applyPromotionsToCart(chiNhanhId, cartItems, totalAmount);
        return appliedPromotions.values().stream()
                .map(AppliedPromotionDTO::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public void deactivate(Long id) {
        log.info("Deactivating promotion ID: {}", id);
        KhuyenMai entity = khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", id));
        entity.setTrangThai(Status.INACTIVE);
        khuyenMaiRepository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public void activate(Long id) {
        log.info("Activating promotion ID: {}", id);
        KhuyenMai entity = khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", id));
        entity.setTrangThai(Status.ACTIVE);
        khuyenMaiRepository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public void delete(Long id) {
        log.info("Deleting promotion ID: {}", id);
        KhuyenMai entity = khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", id));
        khuyenMaiRepository.delete(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public void incrementPromotionUsage(List<Long> promotionIds) {
        if (promotionIds == null || promotionIds.isEmpty()) {
            return;
        }

        log.info("Incrementing usage for {} promotions", promotionIds.size());

        for (Long promotionId : promotionIds) {
            KhuyenMai promotion = khuyenMaiRepository.findById(promotionId)
                    .orElse(null); // Skip if promotion not found

            if (promotion != null) {
                promotion.incrementUsage();
                khuyenMaiRepository.save(promotion);
                log.info("Incremented usage for promotion {}: {} / {}",
                        promotion.getMaKhuyenMai(),
                        promotion.getSoLanDaSuDung(),
                        promotion.getTongSoLanSuDungToiDa());
            }
        }
    }

    /**
     * Áp dụng một khuyến mãi cụ thể theo mã (chỉ áp dụng khi user chọn)
     */
    @Override
    @Transactional(readOnly = true)
    public AppliedPromotionDTO applyPromotionByCode(
            String maKhuyenMai,
            Long chiNhanhId,
            List<CartItemDTO> cartItems,
            BigDecimal totalAmount) {

        log.info("Applying promotion by code: {} - Branch: {}, Total: {}", 
                maKhuyenMai, chiNhanhId, totalAmount);

        // Tìm promotion theo mã
        KhuyenMai promotion = khuyenMaiRepository.findByMaKhuyenMai(maKhuyenMai)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", maKhuyenMai));

        // Kiểm tra promotion có active không
        if (promotion.getTrangThai() != Status.ACTIVE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Khuyến mãi không đang hoạt động: " + maKhuyenMai);
        }

        // Kiểm tra thời gian hiệu lực
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getNgayBatDau()) || now.isAfter(promotion.getNgayKetThuc())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Khuyến mãi không còn hiệu lực: " + maKhuyenMai);
        }

        // Kiểm tra chi nhánh (nếu promotion có giới hạn chi nhánh)
        if (promotion.getChiNhanh() != null && !promotion.getChiNhanh().getId().equals(chiNhanhId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, 
                    "Khuyến mãi không áp dụng cho chi nhánh này: " + maKhuyenMai);
        }

        // Kiểm tra số lần sử dụng (nếu có giới hạn)
        if (promotion.getTongSoLanSuDungToiDa() != null) {
            if (promotion.getSoLanDaSuDung() >= promotion.getTongSoLanSuDungToiDa()) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, 
                        "Khuyến mãi đã hết số lần sử dụng: " + maKhuyenMai);
            }
        }

        // Group cart items by product ID
        Map<Long, CartItemDTO> cartItemMap = cartItems.stream()
                .collect(Collectors.toMap(CartItemDTO::getSanPhamId, item -> item, (a, b) -> a));

        // Áp dụng promotion
        return applyPromotion(promotion, cartItems, totalAmount, cartItemMap);
    }

    /**
     * Apply a single promotion to cart items
     */
    private AppliedPromotionDTO applyPromotion(KhuyenMai promotion, List<CartItemDTO> cartItems,
                                               BigDecimal totalAmount, Map<Long, CartItemDTO> cartItemMap) {

        // Check minimum amount requirement
        if (promotion.getGiaTriToiThieu() != null &&
                totalAmount.compareTo(promotion.getGiaTriToiThieu()) < 0) {
            return null; // Promotion doesn't apply
        }

        // Check if promotion applies to any products in cart
        List<Long> applicableProductIds = getApplicableProductIds(promotion);
        if (applicableProductIds != null && !applicableProductIds.isEmpty()) {
            // Promotion applies to specific products
            boolean hasApplicableProduct = cartItems.stream()
                    .anyMatch(item -> applicableProductIds.contains(item.getSanPhamId()));
            if (!hasApplicableProduct) {
                return null; // No applicable products in cart
            }
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal applicableAmount = totalAmount;

        // Calculate discount based on promotion type
        switch (promotion.getLoaiKhuyenMai()) {
            case PERCENTAGE:
                discountAmount = calculatePercentageDiscount(promotion, applicableAmount);
                break;

            case FIXED_AMOUNT:
                discountAmount = promotion.getGiaTriKhuyenMai();
                if (discountAmount.compareTo(applicableAmount) > 0) {
                    discountAmount = applicableAmount;
                }
                break;

            case BOGO:
                discountAmount = calculateBOGODiscount(promotion, cartItems, cartItemMap);
                break;

            case BUNDLE:
                discountAmount = calculateBundleDiscount(promotion, cartItems, cartItemMap);
                break;

            case BUY_X_GET_Y:
                discountAmount = calculateBuyXGetYDiscount(promotion, cartItems, cartItemMap);
                break;

            default:
                return null;
        }

        // Apply maximum discount limit
        if (promotion.getGiamToiDa() != null && discountAmount.compareTo(promotion.getGiamToiDa()) > 0) {
            discountAmount = promotion.getGiamToiDa();
        }

        if (discountAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return AppliedPromotionDTO.builder()
                .promotionId(promotion.getId())
                .maKhuyenMai(promotion.getMaKhuyenMai())
                .tenKhuyenMai(promotion.getTenKhuyenMai())
                .loaiKhuyenMai(promotion.getLoaiKhuyenMai())
                .discountAmount(discountAmount)
                .originalAmount(applicableAmount)
                .finalAmount(applicableAmount.subtract(discountAmount))
                .description(buildPromotionDescription(promotion, discountAmount))
                .build();
    }

    private BigDecimal calculatePercentageDiscount(KhuyenMai promotion, BigDecimal amount) {
        BigDecimal percentage = promotion.getGiaTriKhuyenMai();
        BigDecimal discount = amount.multiply(percentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return discount;
    }

    private BigDecimal calculateBOGODiscount(KhuyenMai promotion, List<CartItemDTO> cartItems,
                                            Map<Long, CartItemDTO> cartItemMap) {
        // BOGO: Buy 1 Get 1 - free cheapest item
        List<Long> applicableProductIds = getApplicableProductIds(promotion);
        if (applicableProductIds == null || applicableProductIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (Long productId : applicableProductIds) {
            CartItemDTO item = cartItemMap.get(productId);
            if (item != null && item.getSoLuong() >= 2) {
                // For BOGO, give free item = cheapest item price
                int freeItems = item.getSoLuong() / 2;
                BigDecimal itemPrice = item.getDonGia();
                totalDiscount = totalDiscount.add(itemPrice.multiply(BigDecimal.valueOf(freeItems)));
            }
        }

        return totalDiscount;
    }

    private BigDecimal calculateBundleDiscount(KhuyenMai promotion, List<CartItemDTO> cartItems,
                                              Map<Long, CartItemDTO> cartItemMap) {
        // Bundle: Buy specific products together for special price
        // This is a simplified implementation - can be enhanced
        List<Long> applicableProductIds = getApplicableProductIds(promotion);
        if (applicableProductIds == null || applicableProductIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Check if all bundle products are in cart
        boolean hasAllProducts = applicableProductIds.stream()
                .allMatch(cartItemMap::containsKey);

        if (!hasAllProducts) {
            return BigDecimal.ZERO;
        }

        // Calculate bundle discount
        BigDecimal bundlePrice = promotion.getGiaTriKhuyenMai(); // Bundle price
        BigDecimal originalTotal = applicableProductIds.stream()
                .map(cartItemMap::get)
                .map(item -> item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return originalTotal.subtract(bundlePrice);
    }

    private BigDecimal calculateBuyXGetYDiscount(KhuyenMai promotion, List<CartItemDTO> cartItems,
                                                 Map<Long, CartItemDTO> cartItemMap) {
        List<Long> applicableProductIds = getApplicableProductIds(promotion);
        if (applicableProductIds == null || applicableProductIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        Integer buyX = promotion.getSoLuongMua() != null ? promotion.getSoLuongMua() : 1;
        Integer getY = promotion.getSoLuongTang() != null ? promotion.getSoLuongTang() : 1;

        for (Long productId : applicableProductIds) {
            CartItemDTO item = cartItemMap.get(productId);
            if (item != null && item.getSoLuong() >= buyX) {
                int freeSets = item.getSoLuong() / buyX;
                int freeItems = freeSets * getY;
                BigDecimal itemPrice = item.getDonGia();
                // Only discount up to purchased quantity
                int actualFreeItems = Math.min(freeItems, item.getSoLuong() - buyX);
                totalDiscount = totalDiscount.add(itemPrice.multiply(BigDecimal.valueOf(actualFreeItems)));
            }
        }

        return totalDiscount;
    }

    private List<Long> getApplicableProductIds(KhuyenMai promotion) {
        if (promotion.getChiTietKhuyenMais() == null || promotion.getChiTietKhuyenMais().isEmpty()) {
            return null; // Applies to all products
        }

        return promotion.getChiTietKhuyenMais().stream()
                .filter(ct -> ct.getApDung() != null && ct.getApDung())
                .map(ct -> ct.getSanPham().getId())
                .collect(Collectors.toList());
    }

    private String buildPromotionDescription(KhuyenMai promotion, BigDecimal discountAmount) {
        switch (promotion.getLoaiKhuyenMai()) {
            case PERCENTAGE:
                return String.format("Giảm %s%% - Tiết kiệm %s VNĐ",
                        promotion.getGiaTriKhuyenMai(), formatCurrency(discountAmount));
            case FIXED_AMOUNT:
                return String.format("Giảm %s VNĐ",
                        formatCurrency(discountAmount));
            case BOGO:
                return String.format("Mua 1 tặng 1 - Tiết kiệm %s VNĐ",
                        formatCurrency(discountAmount));
            case BUNDLE:
                return String.format("Combo giảm giá - Tiết kiệm %s VNĐ",
                        formatCurrency(discountAmount));
            case BUY_X_GET_Y:
                return String.format("Mua %s tặng %s - Tiết kiệm %s VNĐ",
                        promotion.getSoLuongMua(), promotion.getSoLuongTang(), formatCurrency(discountAmount));
            default:
                return "Khuyến mãi áp dụng";
        }
    }

    private String formatCurrency(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.HALF_UP).toString();
    }

    /**
     * Enrich PromotionDTO with computed fields (isActive, sanPhamIds)
     */
    private PromotionDTO enrichPromotionDTO(PromotionDTO dto, KhuyenMai entity) {
        if (dto == null) {
            return null;
        }
        dto.setIsActive(entity.isActive());
        if (entity.getChiTietKhuyenMais() != null && !entity.getChiTietKhuyenMais().isEmpty()) {
            List<Long> sanPhamIds = entity.getChiTietKhuyenMais().stream()
                    .filter(ct -> ct.getApDung() != null && ct.getApDung())
                    .map(ct -> ct.getSanPham().getId())
                    .collect(Collectors.toList());
            dto.setSanPhamIds(sanPhamIds);
        }
        return dto;
    }
}

