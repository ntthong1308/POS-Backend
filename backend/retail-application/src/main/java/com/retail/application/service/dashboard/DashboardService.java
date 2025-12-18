package com.retail.application.service.dashboard;

import com.retail.application.dto.DashboardStatsDTO;

import java.time.LocalDate;

public interface DashboardService {

    /**
     * Lấy thống kê dashboard
     * @param date Ngày cần lấy thống kê (null = hôm nay)
     * @return DashboardStatsDTO
     */
    DashboardStatsDTO getDashboardStats(LocalDate date);
}

