package com.retail.application.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {

    @NotNull(message = "Hóa đơn gốc ID không được để trống")
    private Long hoaDonGocId;

    @NotNull(message = "Sản phẩm ID không được để trống")
    private Long sanPhamId;

    @NotNull(message = "Số lượng trả không được để trống")
    @Min(value = 1, message = "Số lượng trả phải lớn hơn 0")
    private Integer soLuongTra;

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    @NotBlank(message = "Lý do trả hàng không được để trống")
    @Size(max = 1000, message = "Lý do trả không quá 1000 ký tự")
    private String lyDoTra;
}