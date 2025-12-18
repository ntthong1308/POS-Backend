package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "nhan_vien", indexes = {
        @Index(name = "idx_username", columnList = "username", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVien extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_nhan_vien", nullable = false, unique = true, length = 20)
    private String maNhanVien;

    @Column(name = "ten_nhan_vien", nullable = false, length = 200)
    private String tenNhanVien;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_nhanh_id")
    private ChiNhanh chiNhanh;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    public enum Role {
        ADMIN,
        MANAGER,
        CASHIER
    }
}