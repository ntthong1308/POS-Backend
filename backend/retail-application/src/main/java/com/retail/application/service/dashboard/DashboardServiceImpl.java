package com.retail.application.service.dashboard;

import com.retail.application.dto.DashboardStatsDTO;
import com.retail.common.constant.Status;
import com.retail.domain.entity.HoaDon;
import com.retail.persistence.repository.ChiTietHoaDonRepository;
import com.retail.persistence.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        log.info("Getting dashboard stats for date: {}", date);

        // Thống kê hôm nay
        DashboardStatsDTO.TodayStatsDTO todayStats = calculateTodayStats(date);

        // Thống kê đơn hàng theo ngày (7 ngày gần nhất)
        List<DashboardStatsDTO.OrderStatsByDateDTO> orderStatsByDate = calculateOrderStatsByDate(date);

        // Tổng quan doanh số (7 ngày gần nhất)
        List<DashboardStatsDTO.SalesOverviewDTO> salesOverview = calculateSalesOverview(date);

        // Sản phẩm bán được trong ngày (chỉ tên và số lượng)
        List<DashboardStatsDTO.ProductSoldDTO> topProducts = getProductsSoldByDate(date);

        return DashboardStatsDTO.builder()
                .todayStats(todayStats)
                .orderStatsByDate(orderStatsByDate)
                .salesOverview(salesOverview)
                .topProducts(topProducts)
                .build();
    }

    private DashboardStatsDTO.TodayStatsDTO calculateTodayStats(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Hôm nay
        List<HoaDon> todayInvoices = hoaDonRepository.getInvoicesForRevenueReport(
                startOfDay, endOfDay, Status.COMPLETED);

        BigDecimal todayRevenue = todayInvoices.stream()
                .map(HoaDon::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long todayOrders = (long) todayInvoices.size();

        // Tính lợi nhuận (giả sử lợi nhuận = 10% doanh thu, hoặc tính từ giá nhập/giá bán)
        BigDecimal todayProfit = todayRevenue.multiply(BigDecimal.valueOf(0.1))
                .setScale(0, RoundingMode.HALF_UP);

        Long todayCustomers = todayInvoices.stream()
                .map(HoaDon::getKhachHang)
                .filter(kh -> kh != null)
                .map(kh -> kh.getId())
                .distinct()
                .count();

        // Hôm qua (để tính % thay đổi)
        LocalDate yesterday = date.minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(23, 59, 59);

        List<HoaDon> yesterdayInvoices = hoaDonRepository.getInvoicesForRevenueReport(
                startOfYesterday, endOfYesterday, Status.COMPLETED);

        BigDecimal yesterdayRevenue = yesterdayInvoices.stream()
                .map(HoaDon::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long yesterdayOrders = (long) yesterdayInvoices.size();

        BigDecimal yesterdayProfit = yesterdayRevenue.multiply(BigDecimal.valueOf(0.1))
                .setScale(0, RoundingMode.HALF_UP);

        Long yesterdayCustomers = yesterdayInvoices.stream()
                .map(HoaDon::getKhachHang)
                .filter(kh -> kh != null)
                .map(kh -> kh.getId())
                .distinct()
                .count();

        // Tính % thay đổi
        BigDecimal revenueChange = calculatePercentageChange(todayRevenue, yesterdayRevenue);
        BigDecimal ordersChange = calculatePercentageChange(
                BigDecimal.valueOf(todayOrders), BigDecimal.valueOf(yesterdayOrders));
        BigDecimal profitChange = calculatePercentageChange(todayProfit, yesterdayProfit);
        BigDecimal customersChange = calculatePercentageChange(
                BigDecimal.valueOf(todayCustomers), BigDecimal.valueOf(yesterdayCustomers));

        return DashboardStatsDTO.TodayStatsDTO.builder()
                .doanhThu(todayRevenue)
                .doanhThuChange(revenueChange)
                .tongDon(todayOrders)
                .tongDonChange(ordersChange)
                .loiNhuan(todayProfit)
                .loiNhuanChange(profitChange)
                .khachHang(todayCustomers)
                .khachHangChange(customersChange)
                .build();
    }

    private List<DashboardStatsDTO.OrderStatsByDateDTO> calculateOrderStatsByDate(LocalDate endDate) {
        List<DashboardStatsDTO.OrderStatsByDateDTO> result = new ArrayList<>();
        LocalDate startDate = endDate.minusDays(6); // 7 ngày

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);

            List<HoaDon> invoices = hoaDonRepository.getInvoicesForRevenueReport(
                    startOfDay, endOfDay, Status.COMPLETED);

            Long donHang = (long) invoices.size();
            BigDecimal doanhSo = invoices.stream()
                    .map(HoaDon::getThanhTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(DashboardStatsDTO.OrderStatsByDateDTO.builder()
                    .date(date.format(DateTimeFormatter.ofPattern("d MMM")))
                    .donHang(donHang)
                    .doanhSo(doanhSo)
                    .build());
        }

        return result;
    }

    private List<DashboardStatsDTO.SalesOverviewDTO> calculateSalesOverview(LocalDate endDate) {
        List<DashboardStatsDTO.SalesOverviewDTO> result = new ArrayList<>();
        LocalDate startDate = endDate.minusDays(6); // 7 ngày

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);

            List<HoaDon> invoices = hoaDonRepository.getInvoicesForRevenueReport(
                    startOfDay, endOfDay, Status.COMPLETED);

            BigDecimal doanhSo = invoices.stream()
                    .map(HoaDon::getThanhTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal loiNhuan = doanhSo.multiply(BigDecimal.valueOf(0.1))
                    .setScale(0, RoundingMode.HALF_UP);

            String dayOfWeek = date.format(DateTimeFormatter.ofPattern("EEE")).toUpperCase();

            result.add(DashboardStatsDTO.SalesOverviewDTO.builder()
                    .date(dayOfWeek)
                    .doanhSo(doanhSo)
                    .loiNhuan(loiNhuan)
                    .build());
        }

        return result;
    }

    private BigDecimal calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Lấy tất cả sản phẩm bán được trong ngày (chỉ tên và số lượng)
     */
    private List<DashboardStatsDTO.ProductSoldDTO> getProductsSoldByDate(LocalDate date) {
        log.info("Getting products sold on date: {}", date);
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<Object[]> results = chiTietHoaDonRepository.getProductsSoldByDate(
                startOfDay, endOfDay, Status.COMPLETED);
        
        List<DashboardStatsDTO.ProductSoldDTO> products = results.stream()
                .map(result -> DashboardStatsDTO.ProductSoldDTO.builder()
                        .tenSanPham((String) result[0])
                        .soLuongBan(((Number) result[1]).longValue())
                        .build())
                .collect(Collectors.toList());
        
        log.info("Found {} products sold on date {}", products.size(), date);
        return products;
    }
}

