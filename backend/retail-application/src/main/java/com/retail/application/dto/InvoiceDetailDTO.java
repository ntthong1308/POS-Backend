package com.retail.application.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailDTO {
    private Long id;
    private Long sanPhamId;
    private String tenSanPham;
    private String maSanPham;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
    private String ghiChu;
}