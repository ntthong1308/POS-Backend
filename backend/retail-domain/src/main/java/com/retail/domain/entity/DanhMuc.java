package com.retail.domain.entity;

import com.retail.common.constant.Status;
import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "danh_muc", indexes = {
        @Index(name = "idx_ma_danh_muc", columnList = "ma_danh_muc"),
        @Index(name = "idx_ten_danh_muc", columnList = "ten_danh_muc")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMuc extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_danh_muc", nullable = false, unique = true, length = 50)
    private String maDanhMuc;

    @Column(name = "ten_danh_muc", nullable = false, length = 200)
    private String tenDanhMuc;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private Status trangThai;
}


