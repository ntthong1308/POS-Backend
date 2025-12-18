import axios from 'axios';
import { isJWTExpired } from '@/lib/utils/jwt';

// Base URL for API v1 endpoints
const API_BASE_URL_V1 = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
// Base URL for public API endpoints (no version)
const API_BASE_URL_PUBLIC = import.meta.env.VITE_API_BASE_URL_PUBLIC || 'http://localhost:8081/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL_V1,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API client (for endpoints without /v1)
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL_PUBLIC,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token for both clients
const addTokenInterceptor = (config: any) => {
  const token = localStorage.getItem('retail_pos_token');
  if (token) {
    // Check if token is expired before sending request
    // Only reject if we're CERTAIN it's expired (JWT parsed and expired = true)
    const expired = isJWTExpired(token);
    if (expired === true) {
      // Token is definitely expired (JWT parsed successfully and expired)
      localStorage.removeItem('retail_pos_token');
      localStorage.removeItem('retail_pos_user');
      // Don't redirect here - let the response interceptor handle 401
      // This prevents redirect loops and allows proper error handling
      return Promise.reject(new Error('Token expired'));
    }
    
    // If expired is null (can't parse JWT), still add token
    // Backend will validate and return 401 if invalid
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Nếu là FormData (upload file), không set Content-Type để axios tự động set với boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  // Loại bỏ undefined values từ request body để tránh serialize thành null
  // Axios có thể serialize undefined thành null, gây lỗi validation ở backend
  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    const cleanData = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanData);
      } else if (obj !== null && typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
            cleaned[key] = cleanData(obj[key]);
          }
        }
        return cleaned;
      }
      return obj;
    };
    config.data = cleanData(config.data);
  }
  
  return config;
};

apiClient.interceptors.request.use(addTokenInterceptor, (error) => Promise.reject(error));
publicApiClient.interceptors.request.use(addTokenInterceptor, (error) => Promise.reject(error));

// Response interceptor - Handle errors
const handleErrorInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    // Token invalid or expired - clear and redirect to login
    localStorage.removeItem('retail_pos_token');
    localStorage.removeItem('retail_pos_user');
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login' && window.location.pathname !== '/payments/vnpay/return') {
    window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use((response) => response, handleErrorInterceptor);
publicApiClient.interceptors.response.use((response) => response, handleErrorInterceptor);

export default apiClient;