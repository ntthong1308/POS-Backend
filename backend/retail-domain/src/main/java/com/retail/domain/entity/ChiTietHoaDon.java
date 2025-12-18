package com.retail.domain.entity;

import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_hoa_don", indexes = {
        @Index(name = "idx_hoa_don_id", columnList = "hoa_don_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHoaDon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_id", nullable = false)
    private HoaDon hoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private SanPham sanPham;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @PrePersist
    @PreUpdate
    public void calculateThanhTien() {
        if (soLuong != null && donGia != null) {
            this.thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));
        }
    }
}