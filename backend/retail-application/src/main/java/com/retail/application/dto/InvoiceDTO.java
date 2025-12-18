package com.retail.application.dto;

import com.retail.common.constant.Status;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Long id;
    private String maHoaDon;

    private Long khachHangId;
    private String tenKhachHang;
    private String soDienThoaiKhachHang;

    private Long nhanVienId;
    private String tenNhanVien;

    private Long chiNhanhId;
    private String tenChiNhanh;

    private LocalDateTime ngayTao;
    private BigDecimal tongTien;
    private BigDecimal giamGia;
    private BigDecimal thanhTien;
    private String phuongThucThanhToan;
    private BigDecimal diemTichLuy;
    private String ghiChu;
    private Status trangThai;

    private List<InvoiceDetailDTO> chiTietHoaDons;
}