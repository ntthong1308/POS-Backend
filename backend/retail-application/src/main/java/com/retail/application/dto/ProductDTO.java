package com.retail.application.dto;

import com.retail.common.constant.Status;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;

    @NotBlank(message = "Mã sản phẩm không được để trống")
    @Size(max = 50, message = "Mã sản phẩm không quá 50 ký tự")
    private String maSanPham;

    @Size(max = 50, message = "Barcode không quá 50 ký tự")
    private String barcode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không quá 200 ký tự")
    private String tenSanPham;

    private String moTa;

    @Size(max = 50, message = "Đơn vị tính không quá 50 ký tự")
    private String donViTinh;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    private BigDecimal giaBan;

    @DecimalMin(value = "0.0", message = "Giá nhập không được âm")
    private BigDecimal giaNhap;

    @NotNull(message = "Tồn kho không được để trống")
    @Min(value = 0, message = "Tồn kho không được âm")
    private Integer tonKho;

    @Min(value = 0, message = "Tồn kho tối thiểu không được âm")
    private Integer tonKhoToiThieu;

    @Size(max = 2000, message = "URL hình ảnh không quá 2000 ký tự. Sử dụng endpoint /api/v1/files/products/upload để upload file")
    private String hinhAnh;

    private Long chiNhanhId;
    private String tenChiNhanh;

    private Long nhaCungCapId;
    private String tenNhaCungCap;

    private Long danhMucId;
    private String tenDanhMuc;

    @NotNull(message = "Trạng thái không được để trống")
    private Status trangThai;
}