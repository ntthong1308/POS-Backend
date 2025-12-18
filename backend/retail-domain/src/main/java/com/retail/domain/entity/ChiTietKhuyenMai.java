package com.retail.domain.entity;

import com.retail.domain.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity liên kết khuyến mãi với sản phẩm
 */
@Entity
@Table(name = "chi_tiet_khuyen_mai", indexes = {
        @Index(name = "idx_khuyen_mai_id", columnList = "khuyen_mai_id"),
        @Index(name = "idx_san_pham_id", columnList = "san_pham_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietKhuyenMai extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khuyen_mai_id", nullable = false)
    private KhuyenMai khuyenMai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private SanPham sanPham;

    /**
     * Áp dụng khuyến mãi cho sản phẩm này
     * null = áp dụng cho tất cả sản phẩm trong khuyến mãi
     */
    @Column(name = "ap_dung", nullable = false)
    @Builder.Default
    private Boolean apDung = true;
}

