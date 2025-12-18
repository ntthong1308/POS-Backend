package com.retail.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

/**
 * DTO cho batch nhập/xuất nguyên liệu
 * Hỗ trợ nhiều nguyên liệu trong 1 request
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchNhapXuatNguyenLieuRequest {

    @NotNull(message = "Nhân viên ID không được để trống")
    private Long nhanVienId;

    @NotEmpty(message = "Danh sách nguyên liệu không được trống")
    @Valid
    private List<ItemRequest> items;

    /**
     * Ghi chú chung cho toàn bộ phiếu
     */
    private String ghiChu;

    /**
     * Mã phiếu tùy chọn (nếu không có thì backend tự generate)
     * Nếu có, tất cả items sẽ dùng cùng mã phiếu này
     */
    private String maPhieu;

    /**
     * Inner class cho từng item trong batch
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "Nguyên liệu ID không được để trống")
        private Long nguyenLieuId;

        @NotNull(message = "Số lượng không được để trống")
        @jakarta.validation.constraints.Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer soLuong;

        /**
         * Ghi chú riêng cho từng item
         */
        private String ghiChu;
    }
}

