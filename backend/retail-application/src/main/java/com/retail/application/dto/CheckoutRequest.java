package com.retail.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

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

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String phuongThucThanhToan;

    private String maKhuyenMai;  // Mã khuyến mãi (optional - nếu có thì chỉ áp dụng promotion này)

    private String ghiChu;
}