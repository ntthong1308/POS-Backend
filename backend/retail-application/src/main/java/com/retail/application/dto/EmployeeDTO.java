package com.retail.application.dto;

import com.retail.common.constant.Status;
import com.retail.domain.entity.NhanVien;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;

    @NotBlank(message = "Mã nhân viên không được để trống")
    @Size(max = 20, message = "Mã nhân viên không quá 20 ký tự")
    private String maNhanVien;

    @NotBlank(message = "Tên nhân viên không được để trống")
    @Size(max = 200, message = "Tên nhân viên không quá 200 ký tự")
    private String tenNhanVien;

    @NotBlank(message = "Username không được để trống")
    @Size(min = 4, max = 50, message = "Username từ 4-50 ký tự")
    private String username;

    @Size(min = 6, message = "Password tối thiểu 6 ký tự")
    private String password;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không quá 100 ký tự")
    private String email;

    @Pattern(regexp = "^(\\+84|0)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    @NotNull(message = "Role không được để trống")
    private NhanVien.Role role;

    private Long chiNhanhId;
    private String tenChiNhanh;

    @NotNull(message = "Trạng thái không được để trống")
    private Status trangThai;

    private LocalDate ngayBatDau;
}