import apiClient, { publicApiClient } from './client';
import { Product, ApiResponse, PaginatedResponse } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

export const productsAPI = {
  // Public APIs - Theo tài liệu: GET /api/products/{id}
  getById: async (id: number): Promise<Product> => {
    const response = await publicApiClient.get<Product | ApiResponse<Product>>(`/products/${id}`);
    // Handle both direct response and wrapped response
    return (response.data as ApiResponse<Product>)?.data || (response.data as Product);
  },

  // Admin APIs - Theo tài liệu: GET /api/v1/admin/products?page=0&size=20
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    danhMuc?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>> | PaginatedResponse<Product>>('/admin/products', { params });
    const data = response.data;
    
    // Case 1: ApiResponse<Page<ProductDTO>>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<Product>;
      }
    }
    
    // Case 2: Direct Page object
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<Product>;
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

  // Admin APIs - Theo tài liệu: GET /api/v1/admin/products/search?keyword={keyword}&page=0&size=20
  search: async (params: {
    keyword: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>> | PaginatedResponse<Product>>('/admin/products/search', {
      params
    });
    const data = response.data;
    
    // Case 1: ApiResponse<Page<ProductDTO>>
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<Product>;
      }
    }
    
    // Case 2: Direct Page object
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<Product>;
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

  // Admin APIs - Theo tài liệu: POST /api/v1/admin/products
  create: async (data: Partial<Product>): Promise<Product> => {
    // Loại bỏ các trường frontend-only (không có trong ProductDTO)
    const { 
      danhMuc, 
      tenChiNhanh, 
      tenNhaCungCap, 
      tenDanhMuc,
      ...productData 
    } = data;
    
    // Helper function để normalize empty string thành null (theo hướng dẫn API)
    const normalizeField = (value: any): any => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
      }
      return value === undefined ? null : value;
    };
    
    // Normalize tất cả các optional string fields
    const cleanedData: any = {};
    Object.keys(productData).forEach(key => {
      const value = (productData as any)[key];
      
      // Bỏ qua undefined
      if (value === undefined) {
        return;
      }
      
      // Xử lý đặc biệt cho barcode (theo hướng dẫn API)
      if (key === 'barcode') {
        const normalizedBarcode = normalizeField(value);
        // Theo hướng dẫn: 
        // - Nếu không có barcode: không gửi field hoặc gửi null
        // - Nếu có barcode: chỉ gửi nếu có giá trị hợp lệ (không phải null hoặc empty)
        // Best practice: không gửi field nếu null để tránh unique constraint violation
        if (normalizedBarcode !== null && normalizedBarcode !== '') {
          cleanedData[key] = normalizedBarcode;
        }
        // Nếu normalizedBarcode === null, không gửi field (không thêm vào cleanedData)
      } else {
        // Các field khác: normalize empty string thành null
        const normalized = normalizeField(value);
        // Chỉ thêm nếu không phải null (hoặc là số 0, boolean false, etc.)
        if (normalized !== null || (typeof value === 'number' && value === 0) || typeof value === 'boolean') {
          cleanedData[key] = normalized !== null ? normalized : value;
        }
      }
    });
    
    logger.debug('[productsAPI] Sending data to backend:', cleanedData);
    logger.debug('[productsAPI] Barcode field included:', 'barcode' in cleanedData ? cleanedData.barcode : 'NOT INCLUDED');
    
    const response = await apiClient.post<ApiResponse<Product>>('/admin/products', cleanedData);
    return response.data.data;
  },

  // Admin APIs - Theo tài liệu: PUT /api/v1/admin/products/{id}
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    // Loại bỏ danhMuc trước khi gửi lên backend (không có trong ProductDTO)
    const { danhMuc, ...productData } = data;
    const response = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, productData);
    return response.data.data;
  },

  // Admin APIs - Theo tài liệu: GET /api/v1/admin/products/{id}
  getByIdAdmin: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return response.data.data;
  },

  // Admin APIs - Theo tài liệu: DELETE /api/v1/admin/products/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  // Admin APIs - Theo tài liệu: GET /api/v1/admin/products/low-stock
  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[] | ApiResponse<Product[]>>('/admin/products/low-stock');
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<Product[]>).data || [];
  },

  // Admin APIs - Theo tài liệu: PATCH /api/v1/admin/products/{id}/status?status={status}
  updateStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Product> => {
    // Theo tài liệu, status chỉ có ACTIVE và INACTIVE (không có DISCONTINUED)
    const response = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}/status`, null, {
      params: { status }
    });
    return response.data.data;
  },
};