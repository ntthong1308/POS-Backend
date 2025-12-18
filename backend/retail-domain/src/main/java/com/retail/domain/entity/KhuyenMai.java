package com.retail.domain.entity;

import com.retail.common.constant.PromotionType;
import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity quản lý các chương trình khuyến mãi
 */
@Entity
@Table(name = "khuyen_mai", indexes = {
        @Index(name = "idx_ma_khuyen_mai", columnList = "ma_khuyen_mai"),
        @Index(name = "idx_ngay_bat_dau", columnList = "ngay_bat_dau"),
        @Index(name = "idx_ngay_ket_thuc", columnList = "ngay_ket_thuc"),
        @Index(name = "idx_trang_thai", columnList = "trang_thai")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMai extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_khuyen_mai", nullable = false, unique = true, length = 50)
    private String maKhuyenMai;

    @Column(name = "ten_khuyen_mai", nullable = false, length = 200)
    private String tenKhuyenMai;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_khuyen_mai", nullable = false, length = 50)
    private PromotionType loaiKhuyenMai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id")
    private ChiNhanh chiNhanh; // null = áp dụng cho tất cả chi nhánh

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    /**
     * Giá trị khuyến mãi:
     * - PERCENTAGE: phần trăm (ví dụ: 10 = 10%)
     * - FIXED_AMOUNT: số tiền (ví dụ: 50000 = 50.000đ)
     * - BOGO: số lượng tặng (ví dụ: 1 = tặng 1 sản phẩm)
     */
    @Column(name = "gia_tri_khuyen_mai", precision = 18, scale = 2)
    private BigDecimal giaTriKhuyenMai;

    /**
     * Số tiền tối thiểu để áp dụng khuyến mãi (null = không có điều kiện)
     */
    @Column(name = "gia_tri_toi_thieu", precision = 18, scale = 2)
    private BigDecimal giaTriToiThieu;

    /**
     * Số tiền giảm tối đa (null = không giới hạn)
     */
    @Column(name = "giam_toi_da", precision = 18, scale = 2)
    private BigDecimal giamToiDa;

    /**
     * Số lượng sản phẩm cần mua (cho BOGO, BUY_X_GET_Y)
     */
    @Column(name = "so_luong_mua")
    private Integer soLuongMua;

    /**
     * Số lượng sản phẩm được tặng (cho BOGO, BUY_X_GET_Y)
     */
    @Column(name = "so_luong_tang")
    private Integer soLuongTang;

    /**
     * Số lần sử dụng tối đa cho mỗi khách hàng (null = không giới hạn)
     */
    @Column(name = "so_lan_su_dung_toi_da")
    private Integer soLanSuDungToiDa;

    /**
     * Tổng số lần sử dụng tối đa cho tất cả khách hàng (null = không giới hạn)
     */
    @Column(name = "tong_so_lan_su_dung_toi_da")
    private Integer tongSoLanSuDungToiDa;

    /**
     * Số lần đã sử dụng
     */
    @Column(name = "so_lan_da_su_dung")
    @Builder.Default
    private Integer soLanDaSuDung = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    @Builder.Default
    private Status trangThai = Status.ACTIVE;

    @OneToMany(mappedBy = "khuyenMai", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 20)
    private List<ChiTietKhuyenMai> chiTietKhuyenMais = new ArrayList<>();

    @Column(name = "anh_khuyen_mai", length = 500)
    private String anhKhuyenMai;

    @Column(name = "dieu_kien", columnDefinition = "TEXT")
    private String dieuKien; // Điều kiện áp dụng (JSON hoặc text)

    /**
     * Check if promotion is currently active
     */
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        boolean statusActive = trangThai == Status.ACTIVE;
        boolean inTimeRange = (now.isAfter(ngayBatDau) || now.isEqual(ngayBatDau))
                && (now.isBefore(ngayKetThuc) || now.isEqual(ngayKetThuc));
        boolean notExceeded = tongSoLanSuDungToiDa == null || 
                (soLanDaSuDung != null && soLanDaSuDung < tongSoLanSuDungToiDa);
        return statusActive && inTimeRange && notExceeded;
    }

    public void addChiTiet(ChiTietKhuyenMai chiTiet) {
        chiTietKhuyenMais.add(chiTiet);
        chiTiet.setKhuyenMai(this);
    }

    public void removeChiTiet(ChiTietKhuyenMai chiTiet) {
        chiTietKhuyenMais.remove(chiTiet);
        chiTiet.setKhuyenMai(null);
    }

    public void incrementUsage() {
        this.soLanDaSuDung = (this.soLanDaSuDung == null ? 0 : this.soLanDaSuDung) + 1;
    }
}

