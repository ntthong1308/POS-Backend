import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

// Theo tài liệu: NguyenLieuDTO
export interface RawMaterial {
  id: number;
  maNguyenLieu: string;
  tenNguyenLieu: string;
  donViTinh?: string;
  tonKho: number; // Backend có thể trả về tonKho hoặc soLuong
  soLuong?: number; // Một số API có thể trả về soLuong
  tonKhoToiThieu?: number;
  chiNhanhId?: number;
  tenChiNhanh?: string;
  trangThai: 'ACTIVE' | 'INACTIVE';
}

// Request body cho CREATE/UPDATE (theo tài liệu dùng soLuong)
export interface CreateUpdateRawMaterialRequest {
  maNguyenLieu?: string; // Required khi tạo, optional khi update
  tenNguyenLieu: string; // Required
  donViTinh?: string; // Optional
  soLuong?: number; // Optional, default = 0
  chiNhanhId?: number; // Optional
}

// Theo tài liệu: NhapXuatNguyenLieuRequest
// Lưu ý: loaiPhieu không cần gửi trong request body vì có 2 endpoint riêng: /nhap và /xuat
export interface ImportExportRawMaterialRequest {
  nguyenLieuId: number;
  soLuong: number;
  nhanVienId: number;
  ghiChu?: string;
  maPhieu?: string; // Mã phiếu để gộp nhiều nguyên liệu vào 1 phiếu
}

// ✅ Batch import/export request - gộp nhiều nguyên liệu vào 1 phiếu
// Theo tài liệu: POST /api/v1/admin/nguyen-lieu/nhap/batch hoặc /xuat/batch
export interface BatchImportExportRequest {
  nhanVienId: number; // Required - ID nhân viên
  items: Array<{ // Required - Danh sách nguyên liệu (ít nhất 1 item)
    nguyenLieuId: number; // Required - ID nguyên liệu
    soLuong: number; // Required - Số lượng (phải > 0)
    ghiChu?: string; // Optional - Ghi chú riêng cho item
  }>;
  ghiChu?: string; // Optional - Ghi chú chung cho toàn bộ phiếu
  maPhieu?: string; // Optional - Mã phiếu (nếu không có thì backend tự generate)
}

export const rawMaterialsAPI = {
  // Theo tài liệu: GET /api/v1/admin/nguyen-lieu?page=0&size=20
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<PaginatedResponse<RawMaterial>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawMaterial>> | PaginatedResponse<RawMaterial>>('/admin/nguyen-lieu', { params });
    const data = response.data;
    
    // Case 1: ApiResponse<Page<RawMaterialDTO>>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<RawMaterial>;
      }
      if (Array.isArray(innerData)) {
        return {
          content: innerData,
          totalElements: innerData.length,
          totalPages: 1,
          size: innerData.length,
          number: params?.page || 0,
        };
      }
    }
    
    // Case 2: Direct Page object
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<RawMaterial>;
    }
    
    // Case 3: Direct array
    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: params?.page || 0,
      };
    }
    
    // Fallback
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: params?.size || 20,
      number: params?.page || 0,
    };
  },

  // Theo tài liệu: GET /api/v1/admin/nguyen-lieu/{id}
  getById: async (id: number): Promise<RawMaterial> => {
    const response = await apiClient.get<ApiResponse<RawMaterial>>(`/admin/nguyen-lieu/${id}`);
    return response.data.data;
  },

  // Theo tài liệu: POST /api/v1/admin/nguyen-lieu
  // Request Body: maNguyenLieu (required, unique), tenNguyenLieu (required), donViTinh (optional), soLuong (optional, default=0), chiNhanhId (optional)
  create: async (data: CreateUpdateRawMaterialRequest): Promise<RawMaterial> => {
    const response = await apiClient.post<ApiResponse<RawMaterial>>('/admin/nguyen-lieu', data);
    return response.data.data;
  },

  // Theo tài liệu: PUT /api/v1/admin/nguyen-lieu/{id}
  // Request Body: maNguyenLieu, tenNguyenLieu, donViTinh, soLuong, chiNhanhId
  update: async (id: number, data: CreateUpdateRawMaterialRequest): Promise<RawMaterial> => {
    const response = await apiClient.put<ApiResponse<RawMaterial>>(`/admin/nguyen-lieu/${id}`, data);
    return response.data.data;
  },

  // Theo tài liệu: DELETE /api/v1/admin/nguyen-lieu/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/nguyen-lieu/${id}`);
  },

  // Theo tài liệu: GET /api/v1/admin/nguyen-lieu/search?keyword={keyword}&page=0&size=20
  search: async (params: {
    keyword: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<RawMaterial>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawMaterial>> | PaginatedResponse<RawMaterial>>('/admin/nguyen-lieu/search', {
      params
    });
    const data = response.data;
    
    // Case 1: ApiResponse<Page<RawMaterialDTO>>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<RawMaterial>;
      }
    }
    
    // Case 2: Direct Page object
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<RawMaterial>;
    }
    
    // Fallback
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: params?.size || 20,
      number: params?.page || 0,
    };
  },

  // Theo tài liệu: POST /api/v1/admin/nguyen-lieu/nhap
  import: async (data: ImportExportRawMaterialRequest): Promise<void> => {
    await apiClient.post('/admin/nguyen-lieu/nhap', data);
  },

  // ✅ Batch import - tạo 1 phiếu nhập với nhiều nguyên liệu
  // Endpoint: POST /api/v1/admin/nguyen-lieu/nhap/batch
  // Backend đã hỗ trợ batch API, không cần fallback
  batchImport: async (data: BatchImportExportRequest): Promise<void> => {
    logger.debug('[rawMaterialsAPI] Batch import request:', data);
    
    // Validate: items không được rỗng
    if (!data.items || data.items.length === 0) {
      throw new Error('Danh sách nguyên liệu không được trống');
    }
    
    // Validate: tất cả items phải có nguyenLieuId và soLuong > 0
    for (const item of data.items) {
      if (!item.nguyenLieuId || item.nguyenLieuId <= 0) {
        throw new Error('Vui lòng chọn nguyên liệu');
      }
      if (!item.soLuong || item.soLuong <= 0) {
        throw new Error('Số lượng phải lớn hơn 0');
      }
    }
    
    const response = await apiClient.post<ApiResponse<null>>('/admin/nguyen-lieu/nhap/batch', data);
    logger.info('[rawMaterialsAPI] Batch import successful:', response.data.message);
  },

  // Theo tài liệu: POST /api/v1/admin/nguyen-lieu/xuat
  export: async (data: ImportExportRawMaterialRequest): Promise<void> => {
    await apiClient.post('/admin/nguyen-lieu/xuat', data);
  },

  // ✅ Batch export - tạo 1 phiếu xuất với nhiều nguyên liệu
  // Endpoint: POST /api/v1/admin/nguyen-lieu/xuat/batch
  // Backend đã hỗ trợ batch API, không cần fallback
  // Lưu ý: Backend sẽ kiểm tra tồn kho TRƯỚC khi xử lý. Nếu có bất kỳ item nào không đủ tồn kho → Throw error và KHÔNG xử lý item nào
  batchExport: async (data: BatchImportExportRequest): Promise<void> => {
    logger.debug('[rawMaterialsAPI] Batch export request:', data);
    
    // Validate: items không được rỗng
    if (!data.items || data.items.length === 0) {
      throw new Error('Danh sách nguyên liệu không được trống');
    }
    
    // Validate: tất cả items phải có nguyenLieuId và soLuong > 0
    for (const item of data.items) {
      if (!item.nguyenLieuId || item.nguyenLieuId <= 0) {
        throw new Error('Vui lòng chọn nguyên liệu');
      }
      if (!item.soLuong || item.soLuong <= 0) {
        throw new Error('Số lượng phải lớn hơn 0');
      }
    }
    
    const response = await apiClient.post<ApiResponse<null>>('/admin/nguyen-lieu/xuat/batch', data);
    logger.info('[rawMaterialsAPI] Batch export successful:', response.data.message);
  },

  // Theo tài liệu: GET /api/v1/admin/nguyen-lieu/low-stock
  getLowStock: async (): Promise<RawMaterial[]> => {
    const response = await apiClient.get<RawMaterial[] | ApiResponse<RawMaterial[]>>('/admin/nguyen-lieu/low-stock');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<RawMaterial[]>).data || [];
  },

  // Theo tài liệu: PATCH /api/v1/admin/nguyen-lieu/{id}/status?status={status}
  updateStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<RawMaterial> => {
    const response = await apiClient.patch<ApiResponse<RawMaterial>>(`/admin/nguyen-lieu/${id}/status`, null, {
      params: { status }
    });
    return response.data.data;
  },

  // Get import history - GET /api/v1/admin/nguyen-lieu/nhap/history
  // Response: { success: true, data: { content: [...], totalElements, totalPages, size, number }, pageInfo: {...} }
  getImportHistory: async (params?: {
    page?: number;
    size?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<any>> | PaginatedResponse<any>>('/admin/nguyen-lieu/nhap/history', { params });
    const data = response.data;
    
    // Case 1: ApiResponse<PaginatedResponse>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<PaginatedResponse<any>>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData.content || [];
      }
    }
    
    // Case 2: Direct PaginatedResponse
    if (data && typeof data === 'object' && 'content' in data) {
      return (data as PaginatedResponse<any>).content || [];
    }
    
    return [];
  },

  // Get export history - GET /api/v1/admin/nguyen-lieu/xuat/history
  // Response: { success: true, data: { content: [...], totalElements, totalPages, size, number }, pageInfo: {...} }
  getExportHistory: async (params?: {
    page?: number;
    size?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<any>> | PaginatedResponse<any>>('/admin/nguyen-lieu/xuat/history', { params });
    const data = response.data;
    
    // Case 1: ApiResponse<PaginatedResponse>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<PaginatedResponse<any>>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData.content || [];
      }
    }
    
    // Case 2: Direct PaginatedResponse
    if (data && typeof data === 'object' && 'content' in data) {
      return (data as PaginatedResponse<any>).content || [];
    }
    
    return [];
  },

  // Get transaction history - GET /api/v1/admin/nguyen-lieu/transactions
  // Response: { success: true, data: { content: [...], totalElements, totalPages, size, number }, pageInfo: {...} }
  getTransactionHistory: async (params?: {
    page?: number;
    size?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<any>> | PaginatedResponse<any>>('/admin/nguyen-lieu/transactions', { params });
    const data = response.data;
    
    // Case 1: ApiResponse<PaginatedResponse>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<PaginatedResponse<any>>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData.content || [];
      }
    }
    
    // Case 2: Direct PaginatedResponse
    if (data && typeof data === 'object' && 'content' in data) {
      return (data as PaginatedResponse<any>).content || [];
    }
    
    return [];
  },

  // Adjust quantity - POST /api/v1/admin/nguyen-lieu/dieu-chinh
  adjustQuantity: async (data: {
    nguyenLieuId: number;
    soLuongMoi: number;
    nhanVienId: number;
    ghiChu?: string;
  }): Promise<void> => {
    await apiClient.post('/admin/nguyen-lieu/dieu-chinh', data);
  },

  // Export Excel - GET /api/v1/admin/nguyen-lieu/ton-kho/excel
  exportTonKhoExcel: async (): Promise<Blob> => {
    const response = await apiClient.get('/admin/nguyen-lieu/ton-kho/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export Excel - GET /api/v1/admin/nguyen-lieu/nhap-kho/excel
  exportNhapKhoExcel: async (): Promise<Blob> => {
    const response = await apiClient.get('/admin/nguyen-lieu/nhap-kho/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export Excel - GET /api/v1/admin/nguyen-lieu/xuat-kho/excel
  exportXuatKhoExcel: async (): Promise<Blob> => {
    const response = await apiClient.get('/admin/nguyen-lieu/xuat-kho/excel', {
      responseType: 'blob',
    });
    return response.data;
  },

  // ✅ Delete receipt - Xóa phiếu nhập/xuất kho
  // Endpoint: DELETE /api/v1/admin/nguyen-lieu/phieu/{id}
  // Backend sẽ tự động rollback tồn kho khi xóa phiếu:
  // - NHAP: Trừ lại số lượng từ tồn kho
  // - XUAT: Cộng lại số lượng vào tồn kho
  // - DIEU_CHINH: Khôi phục số lượng cũ
  deleteReceipt: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/nguyen-lieu/phieu/${id}`);
    logger.info('[rawMaterialsAPI] Delete receipt successful:', response.data.message);
  },
};

