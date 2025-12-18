import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '@/lib/types';

// Employee theo EmployeeDTO trong tài liệu
export interface Employee {
  id: number;
  maNhanVien: string;
  tenNhanVien: string;
  username: string;
  password?: string; // Chỉ dùng khi tạo/cập nhật
  email?: string;
  soDienThoai?: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  chiNhanhId?: number;
  tenChiNhanh?: string;
  trangThai: 'ACTIVE' | 'INACTIVE'; // Theo tài liệu
  ngayBatDau?: string; // Format: YYYY-MM-DD - Ngày bắt đầu làm việc
  // Tương thích ngược (cho UI)
  name?: string; // Alias cho tenNhanVien
  avatar?: string;
  date?: string;
  jobTitle?: string;
  employmentType?: 'Employment' | 'Contractor';
  status?: 'active' | 'onboarding' | 'off-boarding' | 'dismissed';
  phone?: string; // Alias cho soDienThoai
  address?: string;
}

export const employeesAPI = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    status?: 'active' | 'onboarding' | 'off-boarding' | 'dismissed';
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Employee>> | ApiResponse<Employee[]> | PaginatedResponse<Employee>>('/admin/employees', { params });
    const data = response.data;
    
    console.log('[employeesAPI] Raw response:', data);
    
    // Case 1: ApiResponse<Page<EmployeeDTO>> - data.data là Page object
    if (data && typeof data === 'object' && 'data' in data) {
      const innerData = (data as ApiResponse<any>).data;
      console.log('[employeesAPI] Inner data:', innerData);
      // Nếu innerData có content, page, size, totalElements, totalPages -> là Page object
      if (innerData && typeof innerData === 'object' && 'content' in innerData) {
        console.log('[employeesAPI] Found PaginatedResponse with content:', innerData.content);
        return innerData as PaginatedResponse<Employee>;
      }
      // Nếu innerData là array -> wrap thành Page
      if (Array.isArray(innerData)) {
        console.log('[employeesAPI] Found array, wrapping to PaginatedResponse:', innerData.length);
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
      console.log('[employeesAPI] Found direct PaginatedResponse:', (data as PaginatedResponse<Employee>).content.length);
      return data as PaginatedResponse<Employee>;
    }
    
    // Case 3: Direct array
    if (Array.isArray(data)) {
      console.log('[employeesAPI] Found direct array:', data.length);
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size: data.length,
        number: params?.page || 0,
      };
    }
    
    // Fallback
    console.warn('[employeesAPI] Unknown response format, returning empty:', data);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: params?.size || 20,
      number: params?.page || 0,
    };
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/admin/employees/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee>>('/admin/employees', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/admin/employees/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/employees/${id}`);
  },
};

