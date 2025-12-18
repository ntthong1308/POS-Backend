package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "san_pham", indexes = {
        @Index(name = "idx_barcode", columnList = "barcode"),
        @Index(name = "idx_ten_san_pham", columnList = "ten_san_pham")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_san_pham", nullable = false, unique = true, length = 50)
    private String maSanPham;

    @Column(name = "barcode", unique = true, length = 50)
    private String barcode;

    @Column(name = "ten_san_pham", nullable = false, length = 200)
    private String tenSanPham;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "don_vi_tinh", length = 50)
    private String donViTinh;

    @Column(name = "gia_ban", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "gia_nhap", precision = 18, scale = 2)
    private BigDecimal giaNhap;

    @Column(name = "ton_kho", nullable = false)
    private Integer tonKho;

    @Column(name = "ton_kho_toi_thieu")
    private Integer tonKhoToiThieu;

    @Column(name = "hinh_anh", columnDefinition = "NVARCHAR(MAX)")
    private String hinhAnh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id")
    private ChiNhanh chiNhanh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nha_cung_cap_id")
    private NhaCungCap nhaCungCap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;
}