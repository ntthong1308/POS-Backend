import apiClient, { publicApiClient } from './client';
import { Customer, ApiResponse, PaginatedResponse } from '@/lib/types';

export const customersAPI = {
  // Admin APIs - Lấy danh sách khách hàng
  // Theo tài liệu: GET /api/v1/admin/customers?page=0&size=20
  // Response: ApiResponse<Page<CustomerDTO>> với structure:
  // { data: { content: [...], page: 0, size: 20, totalElements: 100, totalPages: 5 }, paging: {...}, meta: {...} }
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<PaginatedResponse<Customer>> => {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Customer>> | ApiResponse<Customer[]>>('/admin/customers', { params });
      const data = response.data;
    
    // Case 1: ApiResponse<Page<CustomerDTO>> - data.data là Page object
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      // Nếu innerData có content, page, size, totalElements, totalPages -> là Page object
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        return innerData as PaginatedResponse<Customer>;
      }
      // Nếu innerData là array -> wrap thành Page
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
      return data as PaginatedResponse<Customer>;
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
    } catch (error: any) {
      console.error('Error fetching customers from API:', error);
      // Return empty result instead of throwing
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: params?.size || 20,
        number: params?.page || 0,
      };
    }
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await publicApiClient.get<Customer>(`/customers/${id}`);
    return response.data?.data || response.data;
  },

  getByPhone: async (phone: string): Promise<Customer | null> => {
    try {
      const response = await publicApiClient.get<Customer>(`/customers/phone/${phone}`);
      return response.data?.data || response.data;
    } catch (error) {
      return null;
    }
  },

  search: async (keyword: string): Promise<Customer[]> => {
    const response = await publicApiClient.get<Customer[] | ApiResponse<Customer[]>>('/customers/search', {
      params: { keyword }
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<Customer[]>).data || [];
  },

  // Admin APIs
  create: async (data: Partial<Customer>): Promise<Customer> => {
    console.log('Sending customer data to API:', data);
    const response = await apiClient.post<ApiResponse<Customer>>('/admin/customers', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/admin/customers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/customers/${id}`);
  },

  updatePoints: async (id: number, points: number): Promise<Customer> => {
    // Theo tài liệu: PATCH /api/v1/admin/customers/{id}/points?points={points}
    const response = await apiClient.patch<ApiResponse<Customer>>(`/admin/customers/${id}/points`, null, {
      params: { points }
    });
    return response.data.data;
  },
};