package com.retail.application.dto;

import com.retail.common.constant.PromotionType;
import com.retail.common.constant.Status;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO khuyến mãi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private Long id;
    private String maKhuyenMai;
    private String tenKhuyenMai;
    private String moTa;
    private PromotionType loaiKhuyenMai;
    private Long chiNhanhId;
    private String tenChiNhanh;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private BigDecimal giaTriKhuyenMai;
    private BigDecimal giaTriToiThieu;
    private BigDecimal giamToiDa;
    private Integer soLuongMua;
    private Integer soLuongTang;
    private Integer soLanSuDungToiDa;
    private Integer tongSoLanSuDungToiDa;
    private Integer soLanDaSuDung;
    private Status trangThai;
    private String anhKhuyenMai;
    private String dieuKien;
    private Boolean isActive; // Tính toán: khuyến mãi có đang hoạt động không
    private List<Long> sanPhamIds; // Danh sách ID sản phẩm áp dụng khuyến mãi
}

