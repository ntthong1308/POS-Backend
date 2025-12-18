package com.retail.application.dto;

import com.retail.common.constant.Status;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguyenLieuDTO {
    private Long id;

    @NotBlank(message = "Mã nguyên liệu không được để trống")
    @Size(max = 50, message = "Mã nguyên liệu không quá 50 ký tự")
    private String maNguyenLieu;

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    @Size(max = 200, message = "Tên nguyên liệu không quá 200 ký tự")
    private String tenNguyenLieu;

    @Size(max = 50, message = "Đơn vị tính không quá 50 ký tự")
    private String donViTinh;

    @Min(value = 0, message = "Số lượng không được âm")
    private Integer soLuong;

    private Long chiNhanhId;
    private String tenChiNhanh;

    private Status trangThai;
}

