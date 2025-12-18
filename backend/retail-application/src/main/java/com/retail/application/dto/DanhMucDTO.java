package com.retail.application.dto;

import com.retail.common.constant.Status;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucDTO {
    private Long id;

    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 50, message = "Mã danh mục không quá 50 ký tự")
    private String maDanhMuc;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 200, message = "Tên danh mục không quá 200 ký tự")
    private String tenDanhMuc;

    private String moTa;

    @NotNull(message = "Trạng thái không được để trống")
    private Status trangThai;
}

