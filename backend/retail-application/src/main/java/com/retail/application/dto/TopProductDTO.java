package com.retail.application.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDTO {
    private Long sanPhamId;  // id
    private String maSanPham;
    private String tenSanPham;
    private Long totalQuantitySold;  // soLuongBan
    private BigDecimal totalRevenue;  // doanhThu
    private Integer rank;  // Hạng sản phẩm (1, 2, 3, ...)
}