package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nha_cung_cap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaCungCap extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_ncc", nullable = false, unique = true, length = 20)
    private String maNcc;

    @Column(name = "ten_ncc", nullable = false, length = 200)
    private String tenNcc;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "email", length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;
}