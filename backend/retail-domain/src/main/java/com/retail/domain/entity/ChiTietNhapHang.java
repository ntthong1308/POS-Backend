package com.retail.domain.entity;

import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_nhap_hang", indexes = {
        @Index(name = "idx_nhap_hang_id", columnList = "nhap_hang_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietNhapHang extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhap_hang_id", nullable = false)
    private NhapHang nhapHang;

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