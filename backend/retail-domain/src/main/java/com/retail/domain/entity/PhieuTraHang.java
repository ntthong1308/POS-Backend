package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_tra_hang", indexes = {
        @Index(name = "idx_ma_tra_hang", columnList = "ma_phieu_tra"),
        @Index(name = "idx_ngay_tra", columnList = "ngay_tra")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuTraHang extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_phieu_tra", nullable = false, unique = true, length = 50)
    private String maPhieuTra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_goc_id", nullable = false)
    private HoaDon hoaDonGoc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private SanPham sanPham;

    @Column(name = "so_luong_tra", nullable = false)
    private Integer soLuongTra;

    @Column(name = "don_gia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "tong_tien_tra", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTienTra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "ngay_tra", nullable = false)
    private LocalDateTime ngayTra;

    @Column(name = "ly_do_tra", columnDefinition = "TEXT")
    private String lyDoTra;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;

    @PrePersist
    @PreUpdate
    public void calculateTongTienTra() {
        if (soLuongTra != null && donGia != null) {
            this.tongTienTra = donGia.multiply(BigDecimal.valueOf(soLuongTra));
        }
    }
}