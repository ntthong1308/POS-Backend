package com.retail.application.dto;

import com.retail.common.constant.Status;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;

    @Size(max = 20, message = "Mã khách hàng không quá 20 ký tự")
    private String maKhachHang;  // Optional - sẽ được tự động generate nếu không có

    @NotBlank(message = "Tên khách hàng không được để trống")
    @Size(max = 200, message = "Tên khách hàng không quá 200 ký tự")
    private String tenKhachHang;

    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 9-10 chữ số")
    private String soDienThoai;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không quá 100 ký tự")
    private String email;

    @Size(max = 500, message = "Địa chỉ không quá 500 ký tự")
    private String diaChi;

    private BigDecimal diemTichLuy;

    // ⚠️ FE KHÔNG CẦN GỬI - BE tự động set = ACTIVE khi tạo mới
    private Status trangThai;
}