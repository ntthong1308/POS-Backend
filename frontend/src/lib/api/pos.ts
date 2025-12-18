import apiClient from './client';
import { Product, ApiResponse } from '@/lib/types';

// CheckoutRequest theo tài liệu
export interface CheckoutRequest {
  khachHangId?: number;
  nhanVienId: number;
  chiNhanhId: number;
  items: {
    sanPhamId: number;
    soLuong: number;
    donGia: number; // Required theo tài liệu
    ghiChu?: string;
  }[];
  giamGia?: number;
  maKhuyenMai?: string; // Mã khuyến mãi để backend cập nhật số lần sử dụng
  phuongThucThanhToan?: 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'VNPAY' | 'OTHER'; // Optional cho treo bill
  ghiChu?: string;
}

// HoldBillRequest - DTO riêng cho treo bill, KHÔNG cần phuongThucThanhToan
export interface HoldBillRequest {
  khachHangId?: number;
  nhanVienId: number;
  chiNhanhId: number;
  items: {
    sanPhamId: number;
    soLuong: number;
    donGia: number;
    ghiChu?: string;
  }[];
  giamGia?: number;
  maKhuyenMai?: string;
  // ❌ KHÔNG có phuongThucThanhToan - Backend đã có DTO riêng
  ghiChu?: string;
}

// CheckoutResponse theo InvoiceDTO trong tài liệu
export interface CheckoutResponse {
  id: number;
  maHoaDon: string;
  khachHangId?: number;
  tenKhachHang?: string;
  soDienThoaiKhachHang?: string;
  nhanVienId: number;
  tenNhanVien: string;
  chiNhanhId: number;
  tenChiNhanh: string;
  ngayTao: string;
  tongTien: number;
  giamGia: number;
  thanhTien: number;
  phuongThucThanhToan: string;
  diemTichLuy: number; // 1000 VND = 1 điểm (backend đã tính: thanhTien / 1000)
  ghiChu?: string;
  trangThai: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  chiTietHoaDons?: Array<{
    id: number;
    sanPhamId: number;
    tenSanPham: string;
    maSanPham: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
    ghiChu?: string;
  }>;
}

export const posAPI = {
  // Get products for POS
  getProducts: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<Product[]> => {
    try {
      console.log('[POS API] Calling /pos/products with params:', params);
      const response = await apiClient.get<Product[] | ApiResponse<Product[]>>('/pos/products', { params });
      console.log('[POS API] Response status:', response.status);
      console.log('[POS API] Response data:', response.data);
      console.log('[POS API] Response data type:', typeof response.data);
      console.log('[POS API] Is array?', Array.isArray(response.data));
      
      const data = response.data;
      
      // Case 1: Direct array
      if (Array.isArray(data)) {
        console.log('[POS API] Returning array directly, length:', data.length);
        return data;
      }
      
      // Case 2: PaginatedResponse format { content: [...], ... }
      if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
        console.log('[POS API] Returning data.content, length:', data.content.length);
        return data.content;
      }
      
      // Case 3: ApiResponse format { data: [...], success: true, ... }
      if (data && typeof data === 'object' && 'data' in data) {
        const innerData = (data as any).data;
        if (Array.isArray(innerData)) {
          console.log('[POS API] Returning data.data (array), length:', innerData.length);
          return innerData;
        }
        // Nếu data.data là object, có thể là PaginatedResponse
        if (innerData && typeof innerData === 'object' && 'content' in innerData && Array.isArray(innerData.content)) {
          console.log('[POS API] Returning data.data.content, length:', innerData.content.length);
          return innerData.content;
        }
      }
      
      // Case 4: Object với structure { data: {...}, paging: {...}, meta: {...} }
      // Có thể data.data là object chứa products array
      if (data && typeof data === 'object' && 'data' in data) {
        const innerData = (data as any).data;
        console.log('[POS API] data.data type:', typeof innerData);
        console.log('[POS API] data.data is array?', Array.isArray(innerData));
        
        // Nếu data.data là array trực tiếp
        if (Array.isArray(innerData)) {
          console.log('[POS API] Returning data.data (array), length:', innerData.length);
          return innerData;
        }
        
        // Thử tìm array trong object
        if (innerData && typeof innerData === 'object') {
          // Kiểm tra các field có thể chứa array
          const possibleArrayFields = ['items', 'products', 'content', 'list', 'data'];
          for (const field of possibleArrayFields) {
            if (field in innerData && Array.isArray(innerData[field])) {
              console.log(`[POS API] Returning data.data.${field}, length:`, innerData[field].length);
              return innerData[field];
            }
          }
          
          // Log tất cả keys để debug
          console.log('[POS API] data.data keys:', Object.keys(innerData));
          console.log('[POS API] data.data structure:', innerData);
        }
      }
      
      console.warn('[POS API] Unknown response format:', data);
      console.warn('[POS API] Response structure:', JSON.stringify(data, null, 2));
      return [];
    } catch (error: any) {
      console.error('[POS API] Error in getProducts:', error);
      console.error('[POS API] Error response:', error.response);
      throw error;
    }
  },

  // Search products
  searchProducts: async (keyword: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[] | ApiResponse<Product[]>>('/pos/products/search', {
      params: { keyword }
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<Product[]>)?.data || [];
  },

  // Scan barcode - Theo tài liệu: GET /api/v1/pos/products/barcode/{barcode}
  scanBarcode: async (barcode: string): Promise<Product> => {
    const response = await apiClient.get<Product | ApiResponse<Product>>(`/pos/products/barcode/${barcode}`);
    return (response.data as ApiResponse<Product>)?.data || (response.data as Product);
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product | ApiResponse<Product>>(`/pos/products/${id}`);
    return (response.data as ApiResponse<Product>)?.data || (response.data as Product);
  },

  // Validate cart before checkout
  validateCheckout: async (request: CheckoutRequest): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const response = await apiClient.post<any>('/pos/checkout/validate', request);
      console.log('[POS API] Validation response:', response.data);
      
      const responseData = response.data;
      
      // Case 1: ApiResponse<{ valid: boolean, errors?: string[] }>
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        const innerData = responseData.data;
        if (innerData && typeof innerData === 'object' && 'valid' in innerData) {
          return innerData;
        }
      }
      
      // Case 2: Direct { valid: boolean, errors?: string[] }
      if (responseData && typeof responseData === 'object' && 'valid' in responseData) {
        return responseData;
      }
      
      // Case 3: String response (e.g., "Giỏ hàng hợp lệ")
      if (typeof responseData === 'string') {
        return { valid: true };
      }
      
      // Case 4: ApiResponse with string message
      if (responseData && typeof responseData === 'object' && 'message' in responseData) {
        const message = responseData.message;
        if (typeof message === 'string' && message.includes('hợp lệ')) {
          return { valid: true };
        }
        return { valid: false, errors: [message] };
      }
      
      console.warn('[POS API] Unknown validation response format:', responseData);
      return { valid: true }; // Default to valid if format is unknown
    } catch (error: any) {
      console.error('[POS API] Validation error:', error);
      return { valid: false, errors: [error.response?.data?.message || 'Lỗi xác thực giỏ hàng'] };
    }
  },

  // Checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    console.log('[POS API] Checkout request:', data);
    try {
      const response = await apiClient.post<CheckoutResponse | ApiResponse<CheckoutResponse>>('/pos/checkout', data);
      console.log('[POS API] Checkout response status:', response.status);
      console.log('[POS API] Checkout response data:', response.data);
      
      const responseData = response.data;
      
      // Case 1: ApiResponse<CheckoutResponse>
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        const innerData = (responseData as ApiResponse<CheckoutResponse>).data;
        console.log('[POS API] Returning invoice from ApiResponse.data:', innerData);
        return innerData;
      }
      
      // Case 2: Direct CheckoutResponse
      if (responseData && typeof responseData === 'object' && 'id' in responseData) {
        console.log('[POS API] Returning direct invoice:', responseData);
        return responseData as CheckoutResponse;
      }
      
      console.warn('[POS API] Unknown checkout response format:', responseData);
      throw new Error('Invalid checkout response format');
    } catch (error: any) {
      console.error('[POS API] Checkout error:', error);
      console.error('[POS API] Checkout error response:', error.response);
      console.error('[POS API] Checkout error data:', error.response?.data);
      throw error;
    }
  },

  // Payment APIs - Theo tài liệu
  processPayment: async (data: {
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    metadata?: Record<string, any>;
  }): Promise<{ 
    transactionId: string | null; 
    transactionCode?: string;
    invoiceId: number | null; 
    amount: number; 
    paymentMethod: string; 
    status: string; 
    transactionDate?: string;
    paymentUrl?: string; // VNPay payment URL
    redirectUrl?: string; // VNPay redirect URL
    requiresConfirmation?: boolean;
    gatewayTransactionId?: string;
    errorMessage?: string; // Error message if payment failed
    message?: string; // General message
  }> => {
    const response = await apiClient.post<ApiResponse<{
      transactionId: string;
      transactionCode?: string;
      invoiceId: number;
      amount: number;
      paymentMethod: string;
      status: string;
      transactionDate: string;
      paymentUrl?: string;
      redirectUrl?: string;
      requiresConfirmation?: boolean;
      gatewayTransactionId?: string;
    }>>('/pos/payments/process', data);
    return response.data.data;
  },

  verifyPayment: async (transactionId: string): Promise<any> => {
    // Theo tài liệu: GET /api/v1/pos/payments/verify/{transactionId}
    const response = await apiClient.get<ApiResponse<any>>(
      `/pos/payments/verify/${transactionId}`
    );
    return response.data.data;
  },

  refund: async (transactionId: string, amount: number): Promise<any> => {
    // Theo tài liệu: POST /api/v1/pos/payments/refund?transactionId={id}&amount={amount}
    const response = await apiClient.post<ApiResponse<any>>(
      '/pos/payments/refund',
      null,
      {
        params: { transactionId, amount }
      }
    );
    return response.data.data;
  },

  getTransaction: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/pos/payments/${transactionId}`);
    return response.data.data;
  },

  getTransactionsByInvoice: async (invoiceId: number): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/pos/payments/invoice/${invoiceId}`);
    return response.data.data;
  },

  reconcile: async (transactionId: string): Promise<void> => {
    await apiClient.post(`/pos/payments/reconcile/${transactionId}`);
  },

  // Hold Bill APIs
  holdBill: async (data: HoldBillRequest): Promise<CheckoutResponse> => {
    console.log('[POS API] Hold bill request:', data);
    const response = await apiClient.post<CheckoutResponse | ApiResponse<CheckoutResponse>>('/pos/checkout/hold', data);
    console.log('[POS API] Hold bill response status:', response.status);
    console.log('[POS API] Hold bill response data:', response.data);
    
    const responseData = response.data;
    
    // Case 1: ApiResponse<CheckoutResponse>
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const innerData = (responseData as ApiResponse<CheckoutResponse>).data;
      console.log('[POS API] Returning invoice from ApiResponse.data:', innerData);
      return innerData;
    }
    
    // Case 2: Direct CheckoutResponse
    if (responseData && typeof responseData === 'object' && 'id' in responseData) {
      console.log('[POS API] Returning direct invoice:', responseData);
      return responseData as CheckoutResponse;
    }
    
    console.warn('[POS API] Unknown hold bill response format:', responseData);
    throw new Error('Invalid hold bill response format');
  },

  getPendingInvoices: async (chiNhanhId: number): Promise<CheckoutResponse[]> => {
    console.log('[POS API] Getting pending invoices for branch:', chiNhanhId);
    const response = await apiClient.get<CheckoutResponse[] | ApiResponse<CheckoutResponse[]>>('/pos/invoices/pending', {
      params: { chiNhanhId }
    });
    console.log('[POS API] Pending invoices response:', response.data);
    
    const data = response.data;
    if (Array.isArray(data)) return data;
    return (data as ApiResponse<CheckoutResponse[]>).data || [];
  },

  completePendingInvoice: async (invoiceId: number, phuongThucThanhToan: string): Promise<CheckoutResponse> => {
    console.log('[POS API] Completing pending invoice:', invoiceId, phuongThucThanhToan);
    const response = await apiClient.post<CheckoutResponse | ApiResponse<CheckoutResponse>>(
      `/pos/invoices/${invoiceId}/complete`,
      null,
      {
        params: { phuongThucThanhToan }
      }
    );
    console.log('[POS API] Complete pending invoice response:', response.data);
    
    const responseData = response.data;
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as ApiResponse<CheckoutResponse>).data;
    }
    return responseData as CheckoutResponse;
  },

  // Resume PENDING invoice - Lấy chi tiết đơn để tiếp tục xử lý
  resumeInvoice: async (invoiceId: number): Promise<CheckoutResponse> => {
    console.log('[POS API] Resuming invoice:', invoiceId);
    const response = await apiClient.get<CheckoutResponse | ApiResponse<CheckoutResponse>>(
      `/pos/invoices/${invoiceId}/resume`
    );
    console.log('[POS API] Resume invoice response:', response.data);
    
    const responseData = response.data;
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as ApiResponse<CheckoutResponse>).data;
    }
    return responseData as CheckoutResponse;
  },

  // Update PENDING invoice - Cập nhật sản phẩm trong đơn PENDING
  updatePendingInvoice: async (invoiceId: number, data: HoldBillRequest): Promise<CheckoutResponse> => {
    console.log('[POS API] Updating pending invoice:', invoiceId, data);
    const response = await apiClient.put<CheckoutResponse | ApiResponse<CheckoutResponse>>(
      `/pos/invoices/${invoiceId}/update-pending`,
      data
    );
    console.log('[POS API] Update pending invoice response:', response.data);
    
    const responseData = response.data;
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as ApiResponse<CheckoutResponse>).data;
    }
    return responseData as CheckoutResponse;
  },

  // Cancel PENDING invoice - Hủy đơn PENDING
  cancelPendingInvoice: async (invoiceId: number): Promise<CheckoutResponse> => {
    console.log('[POS API] Cancelling pending invoice:', invoiceId);
    const response = await apiClient.post<CheckoutResponse | ApiResponse<CheckoutResponse>>(
      `/pos/invoices/${invoiceId}/cancel-pending`
    );
    console.log('[POS API] Cancel pending invoice response:', response.data);
    
    const responseData = response.data;
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as ApiResponse<CheckoutResponse>).data;
    }
    return responseData as CheckoutResponse;
  },
};
