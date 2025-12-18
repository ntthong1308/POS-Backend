package com.retail.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Thống kê hôm nay
    private TodayStatsDTO todayStats;
    
    // Thống kê đơn hàng theo ngày (cho bar chart)
    private List<OrderStatsByDateDTO> orderStatsByDate;
    
    // Tổng quan doanh số (cho line chart)
    private List<SalesOverviewDTO> salesOverview;
    
    // Sản phẩm bán được trong ngày (chỉ tên và số lượng)
    private List<ProductSoldDTO> topProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayStatsDTO {
        private BigDecimal doanhThu;          // Doanh thu hôm nay
        private BigDecimal doanhThuChange;    // % thay đổi so với hôm qua
        private Long tongDon;                 // Tổng đơn hôm nay
        private BigDecimal tongDonChange;     // % thay đổi
        private BigDecimal loiNhuan;          // Lợi nhuận hôm nay
        private BigDecimal loiNhuanChange;    // % thay đổi
        private Long khachHang;                // Khách hàng hôm nay
        private BigDecimal khachHangChange;   // % thay đổi
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatsByDateDTO {
        private String date;                  // Format: "2 Jan"
        private Long donHang;                 // Số đơn hàng
        private BigDecimal doanhSo;           // Doanh số
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesOverviewDTO {
        private String date;                  // Format: "SAT", "SUN", etc.
        private BigDecimal doanhSo;           // Doanh số
        private BigDecimal loiNhuan;          // Lợi nhuận
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSoldDTO {
        private String tenSanPham;            // Tên sản phẩm
        private Long soLuongBan;              // Số lượng bán được trong ngày
    }
}

