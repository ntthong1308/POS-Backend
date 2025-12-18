package com.retail.application.service.report;

import com.retail.application.dto.ProductDTO;
import com.retail.application.dto.RevenueByMonthDTO;
import com.retail.application.dto.RevenueReportDTO;
import com.retail.application.dto.TopProductDTO;
import com.retail.application.mapper.ProductMapper;
import com.retail.common.constant.Status;
import com.retail.domain.entity.HoaDon;
import com.retail.domain.entity.SanPham;
import com.retail.persistence.repository.ChiTietHoaDonRepository;
import com.retail.persistence.repository.HoaDonRepository;
import com.retail.persistence.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final HoaDonRepository hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final SanPhamRepository sanPhamRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating revenue report from {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByDateRange(
                startDateTime, endDateTime, Status.COMPLETED);

        return calculateRevenueReport(invoices, startDateTime, endDateTime);
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueReportDTO getRevenueReportByBranch(Long chiNhanhId,
                                                     LocalDate startDate,
                                                     LocalDate endDate) {
        log.info("Generating revenue report for branch {} from {} to {}",
                chiNhanhId, startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<HoaDon> invoices = hoaDonRepository.findByChiNhanhAndDateRange(
                chiNhanhId, startDateTime, endDateTime, Status.COMPLETED);

        return calculateRevenueReport(invoices, startDateTime, endDateTime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductDTO> getTopSellingProducts(LocalDate startDate,
                                                     LocalDate endDate,
                                                     int limit) {
        log.info("Getting top {} selling products from {} to {}", limit, startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Object[]> results = chiTietHoaDonRepository.getTopSellingProductsReport(
                startDateTime, endDateTime, Status.COMPLETED);

        List<TopProductDTO> products = IntStream.range(0, Math.min(results.size(), limit))
                .mapToObj(i -> {
                    Object[] result = results.get(i);
                    return TopProductDTO.builder()
                            .sanPhamId((Long) result[0])
                            .maSanPham((String) result[1])
                            .tenSanPham((String) result[2])
                            .totalQuantitySold(((Number) result[3]).longValue())
                            .totalRevenue((BigDecimal) result[4])
                            .rank(i + 1)  // Rank bắt đầu từ 1
                            .build();
                })
                .collect(Collectors.toList());

        log.info("Found {} top selling products with ranks", products.size());
        return products;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts() {
        log.info("Getting low stock products");

        List<SanPham> products = sanPhamRepository.findLowStockProducts(Status.ACTIVE);
        return productMapper.toDtoList(products);
    }

    private RevenueReportDTO calculateRevenueReport(List<HoaDon> invoices,
                                                    LocalDateTime startDate,
                                                    LocalDateTime endDate) {
        if (invoices.isEmpty()) {
            return RevenueReportDTO.builder()
                    .startDate(startDate)
                    .endDate(endDate)
                    .totalOrders(0L)
                    .totalRevenue(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .netRevenue(BigDecimal.ZERO)
                    .totalProfit(BigDecimal.ZERO)
                    .totalCustomers(0L)
                    .averageOrderValue(BigDecimal.ZERO)
                    .revenueByMonth(new ArrayList<>())
                    .build();
        }

        long totalOrders = invoices.size();

        BigDecimal totalRevenue = invoices.stream()
                .map(HoaDon::getTongTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscount = invoices.stream()
                .map(HoaDon::getGiamGia)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netRevenue = invoices.stream()
                .map(HoaDon::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalCustomers = invoices.stream()
                .map(HoaDon::getKhachHang)
                .filter(kh -> kh != null)
                .map(kh -> kh.getId())
                .distinct()
                .count();

        BigDecimal averageOrderValue = totalOrders > 0
                ? netRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Tính lợi nhuận (10% của netRevenue)
        BigDecimal totalProfit = netRevenue.multiply(BigDecimal.valueOf(0.1))
                .setScale(0, RoundingMode.HALF_UP);

        // Tính doanh thu theo tháng
        List<RevenueByMonthDTO> revenueByMonth = calculateRevenueByMonth(invoices);

        return RevenueReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalDiscount(totalDiscount)
                .netRevenue(netRevenue)
                .totalProfit(totalProfit)
                .totalCustomers(totalCustomers)
                .averageOrderValue(averageOrderValue)
                .revenueByMonth(revenueByMonth)
                .build();
    }

    /**
     * Tính doanh thu theo tháng từ danh sách hóa đơn
     */
    private List<RevenueByMonthDTO> calculateRevenueByMonth(List<HoaDon> invoices) {
        // Nhóm hóa đơn theo tháng
        Map<String, List<HoaDon>> invoicesByMonth = invoices.stream()
                .collect(Collectors.groupingBy(invoice -> {
                    LocalDate date = invoice.getNgayTao().toLocalDate();
                    return date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                }));

        // Tính doanh thu và số đơn hàng cho mỗi tháng
        List<RevenueByMonthDTO> revenueByMonth = new ArrayList<>();
        invoicesByMonth.forEach((month, monthInvoices) -> {
            BigDecimal monthRevenue = monthInvoices.stream()
                    .map(HoaDon::getThanhTien)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Long monthOrders = (long) monthInvoices.size();

            revenueByMonth.add(RevenueByMonthDTO.builder()
                    .month(month)
                    .revenue(monthRevenue)
                    .orders(monthOrders)
                    .build());
        });

        // Sắp xếp theo tháng tăng dần
        revenueByMonth.sort(Comparator.comparing(RevenueByMonthDTO::getMonth));

        log.info("Calculated revenue for {} months", revenueByMonth.size());
        return revenueByMonth;
    }
}