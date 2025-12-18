import apiClient, { publicApiClient } from './client';
import { Invoice, InvoiceDetail, ApiResponse } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

export const invoicesAPI = {
  // Public APIs
  getById: async (id: number): Promise<Invoice> => {
    const response = await publicApiClient.get<Invoice | ApiResponse<Invoice>>(`/invoices/${id}`);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as ApiResponse<Invoice>).data;
    }
    return data as Invoice;
  },

  // POS API - Lấy hóa đơn theo ngày (Admin có thể dùng POS endpoints)
  // Theo tài liệu: KHÔNG có /api/v1/admin/invoices
  // Chỉ có: GET /api/v1/pos/invoices/by-date?fromDate={fromDate}&toDate={toDate}
  // Response: ApiResponse<List<InvoiceDTO>>
  getAll: async (params?: {
    page?: number;
    size?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }): Promise<Invoice[]> => {
    // Sử dụng POS endpoint (Admin có quyền truy cập)
    const response = await apiClient.get<Invoice[] | ApiResponse<Invoice[]>>('/pos/invoices/by-date', { 
      params: { fromDate: params?.fromDate, toDate: params?.toDate } 
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<Invoice[]>).data || [];
  },

  getByDate: async (params: {
    fromDate?: string;
    toDate?: string;
    date?: string; // Single date (YYYY-MM-DD)
    status?: 'COMPLETED' | 'CANCELLED' | 'PENDING'; // Filter by status
  }): Promise<Invoice[]> => {
    logger.debug('[invoicesAPI.getByDate] Calling API with params:', params);
    const response = await apiClient.get<Invoice[] | ApiResponse<Invoice[]>>('/pos/invoices/by-date', { params });
    const data = response.data;
    const invoices = Array.isArray(data) ? data : ((data as ApiResponse<Invoice[]>)?.data || []);
    logger.debug('[invoicesAPI.getByDate] Received invoices:', { 
      count: invoices.length, 
      status: params.status,
      invoiceIds: invoices.map(i => i.id).slice(0, 10) // Log first 10 IDs
    });
    return invoices;
  },

  print: async (id: number): Promise<Blob> => {
    const response = await publicApiClient.get(`/invoices/${id}/print`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get invoice data for printing (returns JSON InvoiceDTO)
  getPrintData: async (id: number): Promise<Invoice> => {
    const response = await publicApiClient.get<Invoice | ApiResponse<Invoice>>(`/invoices/${id}/print`);
    const data = response.data;
    // Check if response is wrapped in ApiResponse
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as ApiResponse<Invoice>).data;
    }
    return data as Invoice;
  },

  // POS API - Get invoice details
  getInvoiceDetails: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<Invoice | ApiResponse<Invoice>>(`/pos/invoices/${id}`);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as ApiResponse<Invoice>).data;
    }
    return data as Invoice;
  },

  // POS API - Get invoices by customer ID
  // GET /api/v1/pos/invoices/by-customer/{customerId}
  getByCustomer: async (customerId: number): Promise<Invoice[]> => {
    const response = await apiClient.get<Invoice[] | ApiResponse<Invoice[]>>(`/pos/invoices/by-customer/${customerId}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<Invoice[]>).data || [];
  },

  // POS API - Delete invoice (soft delete)
  // DELETE /api/v1/pos/invoices/{id}
  // Sets trangThai = CANCELLED and subtracts points from customer
  delete: async (id: number): Promise<Invoice> => {
    const response = await apiClient.delete<Invoice | ApiResponse<Invoice>>(`/pos/invoices/${id}`);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as ApiResponse<Invoice>).data;
    }
    return data as Invoice;
  },
};