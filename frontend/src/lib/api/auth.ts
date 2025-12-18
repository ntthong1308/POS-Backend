import apiClient from './client';
import { LoginRequest, LoginResponse, ApiResponse, User } from '../types';

export const authAPI = {
  // Theo tài liệu: POST /api/v1/auth/login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data.data;
  },

  // Theo tài liệu: GET /api/v1/auth/me
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  // Theo tài liệu: POST /api/v1/auth/logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};