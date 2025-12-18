package com.retail.application.dto;

import com.retail.domain.entity.PhieuNhapXuatNguyenLieu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhieuNhapXuatNguyenLieuDTO {
    private Long id;
    private String maPhieu;
    private Long nguyenLieuId;
    private String tenNguyenLieu;
    private String maNguyenLieu;
    private LocalDateTime ngayNhapXuat;
    private PhieuNhapXuatNguyenLieu.LoaiPhieu loaiPhieu;
    private Integer soLuong;
    private Integer soLuongTruoc;
    private Integer soLuongConLai;
    private Long nhanVienId;
    private String tenNhanVien;
    private String ghiChu;
    
    // Các field cho UI - được tính toán từ dữ liệu hiện có
    public LocalDateTime getThoiGian() {
        return ngayNhapXuat;
    }
    
    public String getHanhDong() {
        if (loaiPhieu == null) return "";
        switch (loaiPhieu) {
            case NHAP:
                return "Nhập";
            case XUAT:
                return "Xuất";
            case DIEU_CHINH:
                return "Điều chỉnh";
            default:
                return loaiPhieu.toString();
        }
    }
    
    public String getThamChieu() {
        return maPhieu;
    }
    
    public String getThayDoi() {
        if (loaiPhieu == null) return "";
        switch (loaiPhieu) {
            case NHAP:
                return "+" + (soLuong != null ? soLuong : 0);
            case XUAT:
                return "-" + (soLuong != null ? soLuong : 0);
            case DIEU_CHINH:
                if (soLuongTruoc != null && soLuong != null) {
                    return soLuongTruoc + " → " + soLuong;
                }
                return soLuong != null ? String.valueOf(soLuong) : "";
            default:
                return "";
        }
    }
    
    public Integer getConLai() {
        return soLuongConLai;
    }
    
    public String getTenNguyenLieuHienThi() {
        if (tenNguyenLieu == null) return "";
        if (maNguyenLieu != null && !maNguyenLieu.isEmpty()) {
            return tenNguyenLieu + " (" + maNguyenLieu + ")";
        }
        return tenNguyenLieu;
    }
}

