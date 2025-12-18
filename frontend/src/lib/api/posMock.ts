/**
 * Mock POS API - Sử dụng khi chưa có backend
 * Để sử dụng mock API, set VITE_USE_MOCK_API=true trong .env
 */

import { Product } from '@/lib/types';
import { CheckoutRequest, CheckoutResponse } from './pos';
import { mockPOSAPI } from './mock/posMockData';

// Check if we should use mock API
const USE_MOCK_API = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' || 
                     (import.meta as any).env?.VITE_USE_MOCK_API === '1';

if (USE_MOCK_API) {
  console.log('🔧 POS API Mode: MOCK');
}

export const posAPIMock = {
  // Get products for POS
  getProducts: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<Product[]> => {
    // Always return mock data (no need to check USE_MOCK_API here)
    return mockPOSAPI.getProducts(params);
  },

  // Search products
  searchProducts: async (keyword: string): Promise<Product[]> => {
    return mockPOSAPI.searchProducts(keyword);
  },

  // Scan barcode
  scanBarcode: async (barcode: string): Promise<Product> => {
    return mockPOSAPI.scanBarcode(barcode);
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product> => {
    return mockPOSAPI.getProductById(id);
  },

  // Validate cart before checkout
  validateCheckout: async (items: CheckoutRequest['items']): Promise<{ valid: boolean; errors?: string[] }> => {
    return mockPOSAPI.validateCheckout(items);
  },

  // Checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    return mockPOSAPI.checkout(data);
  },
};

