package com.retail.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DieuChinhSoLuongRequest {

    @NotNull(message = "Nguyên liệu ID không được để trống")
    private Long nguyenLieuId;

    @NotNull(message = "Số lượng mới không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer soLuongMoi;

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    private String ghiChu;
}

