package com.retail.domain.entity;

import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_nhap_xuat_nguyen_lieu", indexes = {
        @Index(name = "idx_nguyen_lieu_id", columnList = "nguyen_lieu_id"),
        @Index(name = "idx_ngay_nhap_xuat", columnList = "ngay_nhap_xuat"),
        @Index(name = "idx_loai_phieu", columnList = "loai_phieu")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuNhapXuatNguyenLieu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_phieu", nullable = false, unique = true, length = 50)
    private String maPhieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguyen_lieu_id", nullable = false)
    private NguyenLieu nguyenLieu;

    @Column(name = "ngay_nhap_xuat", nullable = false)
    private LocalDateTime ngayNhapXuat;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_phieu", nullable = false, length = 20)
    private LoaiPhieu loaiPhieu;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "so_luong_truoc")
    private Integer soLuongTruoc; // Số lượng trước khi giao dịch (cho điều chỉnh)

    @Column(name = "so_luong_con_lai")
    private Integer soLuongConLai; // Số lượng tồn kho còn lại sau giao dịch

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    public enum LoaiPhieu {
        NHAP,        // Nhập nguyên liệu (tăng số lượng)
        XUAT,        // Xuất nguyên liệu (giảm số lượng)
        DIEU_CHINH   // Điều chỉnh số lượng (thay đổi trực tiếp)
    }
}

