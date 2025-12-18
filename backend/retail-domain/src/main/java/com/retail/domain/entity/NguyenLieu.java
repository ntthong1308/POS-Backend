package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nguyen_lieu", indexes = {
        @Index(name = "idx_ma_nguyen_lieu", columnList = "ma_nguyen_lieu"),
        @Index(name = "idx_ten_nguyen_lieu", columnList = "ten_nguyen_lieu")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguyenLieu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_nguyen_lieu", nullable = false, unique = true, length = 50)
    private String maNguyenLieu;

    @Column(name = "ten_nguyen_lieu", nullable = false, length = 200)
    private String tenNguyenLieu;

    @Column(name = "don_vi_tinh", length = 50)
    private String donViTinh;

    @Column(name = "so_luong", nullable = false)
    @Builder.Default
    private Integer soLuong = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id")
    private ChiNhanh chiNhanh;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;

    /**
     * Tăng số lượng (khi nhập)
     */
    public void tangSoLuong(Integer soLuongNhap) {
        if (soLuongNhap > 0) {
            this.soLuong += soLuongNhap;
        }
    }

    /**
     * Giảm số lượng (khi xuất)
     */
    public void giamSoLuong(Integer soLuongXuat) {
        if (soLuongXuat > 0 && this.soLuong >= soLuongXuat) {
            this.soLuong -= soLuongXuat;
        }
    }
}

