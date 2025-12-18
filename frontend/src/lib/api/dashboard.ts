import apiClient from './client';
import { ApiResponse } from '@/lib/types';

// Theo tài liệu: DashboardStatsDTO
export interface TodayStats {
  doanhThu: number;
  doanhThuChange: number; // % change from yesterday
  tongDon: number;
  tongDonChange: number;
  loiNhuan: number;
  loiNhuanChange: number;
  khachHang: number;
  khachHangChange: number;
}

export interface OrderStatsByDate {
  date: string; // Format: "2 Jan"
  donHang: number;
  doanhSo: number;
}

export interface SalesOverview {
  date: string; // Format: "SAT" (day of week)
  doanhSo: number;
  loiNhuan: number;
}

// ProductSoldDTO - chỉ có 2 trường
export interface TopProduct {
  tenSanPham: string;
  soLuongBan: number;
}

export interface DashboardStats {
  todayStats: TodayStats;
  orderStatsByDate: OrderStatsByDate[];
  salesOverview: SalesOverview[];
  topProducts: TopProduct[];
}

export const dashboardAPI = {
  // Theo tài liệu: GET /api/v1/admin/dashboard?date=2025-12-06
  getStats: async (params?: {
    date?: string; // Format: YYYY-MM-DD
  }): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard', { 
      params: { date: params?.date } 
    });
    return response.data.data;
  },
};

