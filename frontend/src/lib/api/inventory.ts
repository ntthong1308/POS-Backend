import apiClient from './client';
import { ApiResponse, Product } from '@/lib/types';

// Theo tài liệu FRONTEND_COMPLETE_GUIDE.md
export interface ImportItem {
  sanPhamId: number;
  soLuong: number;
  donGia: number; // Giá nhập
  ghiChu?: string;
}

export interface ImportRequest {
  nhaCungCapId: number;
  chiNhanhId: number;
  nhanVienId: number;
  items: ImportItem[];
  ghiChu?: string;
}

export interface ReturnRequest {
  hoaDonGocId: number;
  sanPhamId: number;
  soLuongTra: number;
  nhanVienId: number;
  lyDoTra: string;
}

export const inventoryAPI = {
  import: async (data: ImportRequest): Promise<void> => {
    // Theo tài liệu: POST /api/v1/admin/inventory/import
    await apiClient.post('/admin/inventory/import', data);
  },

  return: async (data: ReturnRequest): Promise<void> => {
    // Theo tài liệu: POST /api/v1/admin/inventory/return
    await apiClient.post('/admin/inventory/return', data);
  },

  getStock: async (productId: number): Promise<{ tonKho: number }> => {
    const response = await apiClient.get<ApiResponse<{ tonKho: number }>>(`/admin/inventory/stock/${productId}`);
    return response.data.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/admin/products/low-stock');
    return response.data.data;
  },
};

