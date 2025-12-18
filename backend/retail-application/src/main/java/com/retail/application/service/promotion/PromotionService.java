package com.retail.application.service.promotion;

import com.retail.application.dto.AppliedPromotionDTO;
import com.retail.application.dto.CartItemDTO;
import com.retail.application.dto.PromotionDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Interface service quản lý khuyến mãi - Hỗ trợ nhiều loại khuyến mãi
 */
public interface PromotionService {

    /**
     * Tạo khuyến mãi mới
     */
    PromotionDTO create(PromotionDTO dto);

    /**
     * Cập nhật khuyến mãi
     */
    PromotionDTO update(Long id, PromotionDTO dto);

    /**
     * Lấy khuyến mãi theo ID
     */
    PromotionDTO findById(Long id);

    /**
     * Lấy khuyến mãi theo mã
     */
    PromotionDTO findByCode(String maKhuyenMai);

    /**
     * Lấy tất cả khuyến mãi đang hoạt động cho chi nhánh
     */
    List<PromotionDTO> findActivePromotionsForBranch(Long chiNhanhId);

    /**
     * Lấy tất cả khuyến mãi
     */
    List<PromotionDTO> findAll();

    /**
     * Áp dụng khuyến mãi cho các item trong giỏ hàng - Trả về map discount theo item
     * @deprecated Sử dụng applyPromotionByCode() thay thế - Chỉ áp dụng khi user chọn mã
     */
    @Deprecated
    Map<Long, AppliedPromotionDTO> applyPromotionsToCart(
            Long chiNhanhId,
            List<CartItemDTO> cartItems,
            BigDecimal totalAmount);

    /**
     * Áp dụng một khuyến mãi cụ thể theo mã (chỉ áp dụng khi user chọn)
     * @param maKhuyenMai Mã khuyến mãi được chọn
     * @param chiNhanhId ID chi nhánh
     * @param cartItems Danh sách sản phẩm trong giỏ hàng
     * @param totalAmount Tổng tiền giỏ hàng
     * @return AppliedPromotionDTO nếu áp dụng thành công, null nếu không áp dụng được
     */
    AppliedPromotionDTO applyPromotionByCode(
            String maKhuyenMai,
            Long chiNhanhId,
            List<CartItemDTO> cartItems,
            BigDecimal totalAmount);

    /**
     * Tính tổng giảm giá từ các khuyến mãi
     */
    BigDecimal calculateDiscount(
            Long chiNhanhId,
            List<CartItemDTO> cartItems,
            BigDecimal totalAmount);

    /**
     * Vô hiệu hóa khuyến mãi
     */
    void deactivate(Long id);

    /**
     * Kích hoạt khuyến mãi
     */
    void activate(Long id);

    /**
     * Xóa khuyến mãi
     */
    void delete(Long id);

    /**
     * Tăng số lần sử dụng cho các khuyến mãi đã được áp dụng
     */
    void incrementPromotionUsage(List<Long> promotionIds);
}

