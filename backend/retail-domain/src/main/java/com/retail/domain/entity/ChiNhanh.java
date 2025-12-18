package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_nhanh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiNhanh extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_chi_nhanh", nullable = false, unique = true, length = 20)
    private String maChiNhanh;

    @Column(name = "ten_chi_nhanh", nullable = false, length = 200)
    private String tenChiNhanh;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;
}