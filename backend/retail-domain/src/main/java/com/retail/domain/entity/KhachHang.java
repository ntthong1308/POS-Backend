package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "khach_hang", indexes = {
        @Index(name = "idx_sdt", columnList = "so_dien_thoai"),
        @Index(name = "idx_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_khach_hang", nullable = false, unique = true, length = 20)
    private String maKhachHang;

    @Column(name = "ten_khach_hang", nullable = false, length = 200)
    private String tenKhachHang;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "diem_tich_luy", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal diemTichLuy = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;
}