import apiClient, { publicApiClient } from './client';
import { ApiResponse } from '@/lib/types';

export interface ReportParams {
  fromDate?: string;
  toDate?: string;
  startDate?: string;
  endDate?: string;
  branchId?: number;
  chiNhanhId?: number;
  limit?: number;
}

export interface RevenueReport {
  startDate: string; // "2024-12-31T00:00:00"
  endDate: string; // "2025-12-06T23:59:59"
  totalOrders: number;
  totalRevenue: number; // Doanh thu trước giảm giá
  totalDiscount: number;
  netRevenue: number; // Doanh thu thực tế (sau giảm giá) - DÙNG CHO TỔNG QUAN
  totalProfit: number; // Lợi nhuận
  totalCustomers: number;
  averageOrderValue: number;
  revenueByDate?: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByMonth?: Array<{
    month: string; // Format: "YYYY-MM" (ví dụ: "2025-01")
    revenue: number;
    orders: number;
  }>;
}

export interface TopProduct {
  sanPhamId: number; // ID sản phẩm
  maSanPham: string; // Mã sản phẩm
  tenSanPham: string; // Tên sản phẩm
  tenDanhMuc?: string; // Tên danh mục (Đồ ăn hoặc Đồ uống)
  totalQuantitySold: number; // Số lượng bán (map to soLuongBan)
  totalRevenue: number; // Doanh thu (map to doanhThu)
  rank: number; // Hạng (1, 2, 3, ...)
}

export const reportsAPI = {
  // Theo tài liệu: GET /api/v1/admin/reports/revenue?startDate=2025-12-01&endDate=2025-12-06
  getRevenueReport: async (params: {
    startDate: string; // Format: YYYY-MM-DD
    endDate: string; // Format: YYYY-MM-DD
    branchId?: number; // Optional: filter by branch
  }): Promise<RevenueReport> => {
    const response = await apiClient.get<ApiResponse<RevenueReport>>('/admin/reports/revenue', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        branchId: params.branchId,
      },
    });
    return response.data.data;
  },

  // Theo tài liệu: GET /api/v1/admin/reports/top-products?startDate=...&endDate=...&limit=10
  getTopProducts: async (params: {
    startDate: string; // Format: YYYY-MM-DD
    endDate: string; // Format: YYYY-MM-DD
    limit?: number; // Default: 10
  }): Promise<TopProduct[]> => {
    const response = await apiClient.get<ApiResponse<TopProduct[]>>('/admin/reports/top-products', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        limit: params.limit || 10,
      },
    });
    const rawData = response.data.data;
    console.log('[reportsAPI] Raw top products response:', rawData);
    // API trả về đúng format TopProduct với totalQuantitySold và totalRevenue
    if (Array.isArray(rawData)) {
      return rawData.map((item: any) => ({
        sanPhamId: item.sanPhamId || item.id || 0,
        maSanPham: item.maSanPham || '',
        tenSanPham: item.tenSanPham || '',
        tenDanhMuc: item.tenDanhMuc || item.danhMuc || undefined, // Lấy từ backend
        totalQuantitySold: item.totalQuantitySold || 0,
        totalRevenue: item.totalRevenue || 0,
        rank: item.rank || 0,
      }));
    }
    return [];
  },

  // Theo tài liệu: GET /api/v1/admin/reports/low-stock
  getLowStock: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/admin/reports/low-stock');
    return response.data.data;
  },

  // Download Excel Report - Báo cáo doanh thu
  downloadRevenueReport: async (params: ReportParams): Promise<Blob> => {
    const response = await publicApiClient.get('/reports/revenue/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

