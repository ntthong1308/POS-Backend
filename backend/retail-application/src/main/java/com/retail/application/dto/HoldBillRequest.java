package com.retail.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho chức năng treo bill (hóa đơn tạm)
 * - Không yêu cầu phương thức thanh toán (vì chưa thanh toán)
 * - Chỉ cần thông tin sản phẩm và số tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldBillRequest {

    private Long khachHangId;

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    @NotNull(message = "Chi nhánh ID không được để trống")
    private Long chiNhanhId;

    @NotEmpty(message = "Giỏ hàng không được trống")
    @Valid
    private List<CartItemDTO> items;

    @DecimalMin(value = "0.0", message = "Giảm giá không được âm")
    private BigDecimal giamGia;

    // ❌ KHÔNG có @NotBlank - Vì treo bill chưa cần phương thức thanh toán
    private String phuongThucThanhToan;

    private String maKhuyenMai;  // Mã khuyến mãi (optional)

    private String ghiChu;
}

