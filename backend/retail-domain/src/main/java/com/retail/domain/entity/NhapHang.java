package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nhap_hang", indexes = {
        @Index(name = "idx_ma_nhap_hang", columnList = "ma_nhap_hang"),
        @Index(name = "idx_ngay_nhap", columnList = "ngay_nhap")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhapHang extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_nhap_hang", nullable = false, unique = true, length = 50)
    private String maNhapHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    private NhaCungCap nhaCungCap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id", nullable = false)
    private ChiNhanh chiNhanh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "ngay_nhap", nullable = false)
    private LocalDateTime ngayNhap;

    @Column(name = "tong_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;

    @OneToMany(mappedBy = "nhapHang", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<ChiTietNhapHang> chiTietNhapHangs = new ArrayList<>();

    public void addChiTiet(ChiTietNhapHang chiTiet) {
        chiTietNhapHangs.add(chiTiet);
        chiTiet.setNhapHang(this);
    }

    public void removeChiTiet(ChiTietNhapHang chiTiet) {
        chiTietNhapHangs.remove(chiTiet);
        chiTiet.setNhapHang(null);
    }
}