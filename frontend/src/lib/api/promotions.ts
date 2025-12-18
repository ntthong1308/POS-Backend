import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/lib/types';
import { Promotion } from '@/store/cartStore';

export const promotionsAPI = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  }): Promise<PaginatedResponse<Promotion>> => {
    const response = await apiClient.get<PaginatedResponse<Promotion>>('/admin/promotions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Promotion> => {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/admin/promotions/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.post<ApiResponse<Promotion>>('/admin/promotions', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.put<ApiResponse<Promotion>>(`/admin/promotions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/promotions/${id}`);
  },

  getByCode: async (maKhuyenMai: string): Promise<Promotion> => {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/admin/promotions/code/${maKhuyenMai}`);
    return response.data.data;
  },

  getActiveByBranch: async (branchId: number): Promise<Promotion[]> => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>(`/admin/promotions/branch/${branchId}/active`);
    return response.data.data;
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`/admin/promotions/${id}/activate`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`/admin/promotions/${id}/deactivate`);
  },

  // POS API
  getActiveForPOS: async (branchId: number): Promise<Promotion[]> => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>(`/pos/promotions/branch/${branchId}/active`);
    return response.data.data;
  },
};

