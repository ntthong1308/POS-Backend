import apiClient from './client';
import { ApiResponse } from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const filesAPI = {
  /**
   * Upload hình ảnh sản phẩm
   * @param file File hình ảnh (max 10MB)
   * @returns URL của hình ảnh đã upload (relative path)
   */
  uploadProductImage: async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ chấp nhận file hình ảnh!');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File không được vượt quá 10MB!');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Không set Content-Type header để axios tự động set với boundary
      const response = await apiClient.post(
        '/files/products/upload',
        formData,
        {
          headers: {
            // Không set Content-Type, axios sẽ tự động set với boundary cho multipart/form-data
          },
        }
      );

      // Handle different response formats
      const responseData = response.data;
      
      // Debug: Log response để xem format
      console.log('[File Upload] Response data:', responseData);
      console.log('[File Upload] Response data type:', typeof responseData);
      console.log('[File Upload] Response data keys:', responseData && typeof responseData === 'object' ? Object.keys(responseData) : 'N/A');
      
      // Case 1: Direct string response (backend trả về trực tiếp path)
      if (typeof responseData === 'string') {
        console.log('[File Upload] Detected: Direct string response');
        return responseData;
      }
      
      // Case 2: ApiResponse format { success: true, data: "...", message: null, errorCode: null }
      if (responseData && typeof responseData === 'object') {
        if (responseData.success !== undefined) {
          // Có field success -> ApiResponse format
          console.log('[File Upload] Detected: ApiResponse format');
          if (responseData.success && responseData.data) {
            return responseData.data;
          }
          throw new Error(responseData.message || 'Upload thất bại');
        }
        // Case 3: Response with data field directly (không có success field)
        if (responseData.data && typeof responseData.data === 'string') {
          console.log('[File Upload] Detected: Object with data field');
          return responseData.data;
        }
        // Case 4: Direct object với field là URL
        if (responseData.url && typeof responseData.url === 'string') {
          console.log('[File Upload] Detected: Object with url field');
          return responseData.url;
        }
        // Case 5: Response là object nhưng không có format rõ ràng - thử lấy bất kỳ string value nào
        const stringValues = Object.values(responseData).filter(v => typeof v === 'string');
        if (stringValues.length > 0) {
          console.log('[File Upload] Detected: Object with string values, using first:', stringValues[0]);
          return stringValues[0] as string;
        }
      }

      // Nếu không match format nào, log và throw error
      console.error('[File Upload] Unknown response format:', responseData);
      throw new Error('Format response không hợp lệ từ server');
    } catch (error: any) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      if (error.response) {
        // Backend returned an error response
        const errorData = error.response.data;
        if (errorData) {
          if (typeof errorData === 'string') {
            throw new Error(errorData);
          }
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        }
        throw new Error(`Upload thất bại: ${error.response.status} ${error.response.statusText}`);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Lỗi không xác định khi upload file');
    }
  },

  /**
   * Upload hình ảnh khách hàng
   * @param file File hình ảnh (max 10MB)
   * @returns URL của hình ảnh đã upload (relative path)
   */
  uploadCustomerImage: async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ chấp nhận file hình ảnh!');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File không được vượt quá 10MB!');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Không set Content-Type header để axios tự động set với boundary
      const response = await apiClient.post(
        '/files/customers/upload',
        formData,
        {
          headers: {
            // Không set Content-Type, axios sẽ tự động set với boundary cho multipart/form-data
          },
        }
      );

      // Handle different response formats
      const responseData = response.data;
      
      // Case 1: Direct string response (backend trả về trực tiếp path)
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      // Case 2: ApiResponse format { success: true, data: "...", message: null, errorCode: null }
      if (responseData && typeof responseData === 'object') {
        if (responseData.success !== undefined) {
          if (responseData.success && responseData.data) {
            return responseData.data;
          }
          throw new Error(responseData.message || 'Upload thất bại');
        }
        // Case 3: Response with data field directly
        if (responseData.data && typeof responseData.data === 'string') {
          return responseData.data;
        }
        // Case 4: Direct object với field là URL
        if (responseData.url && typeof responseData.url === 'string') {
          return responseData.url;
        }
        // Case 5: Thử lấy bất kỳ string value nào trong object
        const stringValues = Object.values(responseData).filter(v => typeof v === 'string');
        if (stringValues.length > 0) {
          return stringValues[0] as string;
        }
      }

      throw new Error('Format response không hợp lệ');
    } catch (error: any) {
      console.error('Upload error details:', error);
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        }
        throw new Error(`Upload thất bại: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  },

  /**
   * Xóa file đã upload
   * @param fileUrl Relative URL của file (ví dụ: /uploads/products/abc123.jpg)
   */
  deleteFile: async (fileUrl: string): Promise<void> => {
    await apiClient.delete('/files/delete', {
      params: { fileUrl },
    });
  },

  /**
   * Lấy full URL để hiển thị hình ảnh
   * @param relativeUrl Relative URL từ backend (ví dụ: /uploads/products/abc123.jpg)
   * @returns Full URL để hiển thị
   * 
   * LƯU Ý: Nếu backend yêu cầu authentication để xem ảnh, 
   * cần sử dụng component AuthenticatedImage thay vì <img> thông thường
   */
  getImageUrl: (relativeUrl?: string): string => {
    if (!relativeUrl) return '';
    // Nếu đã là full URL thì trả về nguyên
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    // Nếu là relative URL thì thêm base URL
    // Backend có thể serve files ở /api/v1/uploads/... hoặc /uploads/...
    // Thử cả 2 cách
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    
    // Nếu URL bắt đầu bằng /uploads, có thể cần thêm /api/v1
    // Tuy nhiên, tốt nhất là backend nên permit all cho /uploads/**
    return `${baseUrl}${cleanUrl}`;
  },
};

