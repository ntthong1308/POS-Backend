package com.retail.application.dto;

import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NhapXuatNguyenLieuRequest {

    @NotNull(message = "Nguyên liệu ID không được để trống")
    private Long nguyenLieuId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    // LoaiPhieu không bắt buộc - Service tự set dựa trên endpoint (/nhap hoặc /xuat)
    private PhieuNhapXuatNguyenLieu.LoaiPhieu loaiPhieu; // NHAP hoặc XUAT (optional)

    private String ghiChu;
}

