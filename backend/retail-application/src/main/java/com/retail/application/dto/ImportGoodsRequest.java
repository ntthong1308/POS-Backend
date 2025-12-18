package com.retail.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportGoodsRequest {

    @NotNull(message = "Nhà cung cấp ID không được để trống")
    private Long nhaCungCapId;

    @NotNull(message = "Chi nhánh ID không được để trống")
    private Long chiNhanhId;

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    @NotEmpty(message = "Danh sách sản phẩm không được trống")
    @Valid
    private List<ImportItemDTO> items;

    private String ghiChu;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportItemDTO {
        @NotNull(message = "Sản phẩm ID không được để trống")
        private Long sanPhamId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer soLuong;

        @NotNull(message = "Đơn giá không được để trống")
        @DecimalMin(value = "0.0", inclusive = true, message = "Đơn giá không được âm")
        private java.math.BigDecimal donGia;

        private String ghiChu;
    }
}