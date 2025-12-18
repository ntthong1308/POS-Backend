package com.retail.admin.controller;

import com.retail.application.dto.DashboardStatsDTO;
import com.retail.application.service.dashboard.DashboardService;
import com.retail.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Getting dashboard stats for date: {}", date != null ? date : "today");
        DashboardStatsDTO stats = dashboardService.getDashboardStats(date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

