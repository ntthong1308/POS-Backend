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
@Table(name = "hoa_don", indexes = {
        @Index(name = "idx_ma_hoa_don", columnList = "ma_hoa_don"),
        @Index(name = "idx_ngay_tao", columnList = "ngay_tao")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoa_don", nullable = false, unique = true, length = 50)
    private String maHoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_hang_id")
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NhanVien nhanVien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id", nullable = false)
    private ChiNhanh chiNhanh;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao;

    @Column(name = "tong_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "giam_gia", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal giamGia = BigDecimal.ZERO;

    @Column(name = "thanh_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "phuong_thuc_thanh_toan", length = 50)
    private String phuongThucThanhToan;

    @Column(name = "diem_tich_luy", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal diemTichLuy = BigDecimal.ZERO;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<ChiTietHoaDon> chiTietHoaDons = new ArrayList<>();

    public void addChiTiet(ChiTietHoaDon chiTiet) {
        chiTietHoaDons.add(chiTiet);
        chiTiet.setHoaDon(this);
    }

    public void removeChiTiet(ChiTietHoaDon chiTiet) {
        chiTietHoaDons.remove(chiTiet);
        chiTiet.setHoaDon(null);
    }
}