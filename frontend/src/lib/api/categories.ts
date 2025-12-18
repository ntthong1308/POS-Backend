import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/lib/types';

export interface Category {
  id: number;
  maDanhMuc: string;
  tenDanhMuc: string;
  moTa?: string;
  trangThai: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

export interface CreateCategoryRequest {
  maDanhMuc: string;
  tenDanhMuc: string;
  moTa?: string;
}

export interface UpdateCategoryRequest {
  maDanhMuc?: string;
  tenDanhMuc?: string;
  moTa?: string;
}

export const categoriesAPI = {
  // GET /api/v1/admin/danh-muc
  getAll: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Category>> | PaginatedResponse<Category>>('/admin/danh-muc', { params });
    const data = response.data;
    
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<Category>;
      }
    }
    
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<Category>;
    }
    
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: params?.size || 20,
      number: params?.page || 0,
    };
  },

  // GET /api/v1/admin/danh-muc/{id}
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/admin/danh-muc/${id}`);
    return response.data.data;
  },

  // GET /api/v1/admin/danh-muc/search?keyword=...
  search: async (params: {
    keyword: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Category>> | PaginatedResponse<Category>>('/admin/danh-muc/search', { params });
    const data = response.data;
    
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<Category>;
      }
    }
    
    if (data && typeof data === 'object' && 'content' in data) {
      return data as PaginatedResponse<Category>;
    }
    
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: params?.size || 20,
      number: params?.page || 0,
    };
  },

  // POST /api/v1/admin/danh-muc
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/admin/danh-muc', data);
    return response.data.data;
  },

  // PUT /api/v1/admin/danh-muc/{id}
  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/admin/danh-muc/${id}`, data);
    return response.data.data;
  },

  // DELETE /api/v1/admin/danh-muc/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/danh-muc/${id}`);
  },

  // PATCH /api/v1/admin/danh-muc/{id}/status?status=...
  updateStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'DELETED'): Promise<void> => {
    await apiClient.patch(`/admin/danh-muc/${id}/status`, null, {
      params: { status },
    });
  },
};

