/**
 * Error handling utilities
 * Provides consistent error message extraction and user-friendly error handling
 */

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        field?: string;
        message?: string;
        defaultMessage?: string;
      }>;
      error?: string;
    };
  };
  message?: string;
}

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'UNAUTHORIZED': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'FORBIDDEN': 'Bạn không có quyền thực hiện thao tác này.',
  'TOKEN_EXPIRED': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  
  // Validation errors
  'VALIDATION_ERROR': 'Vui lòng kiểm tra lại thông tin đã nhập.',
  'INVALID_INPUT': 'Thông tin nhập vào không hợp lệ.',
  
  // Business logic errors
  'INSUFFICIENT_STOCK': 'Sản phẩm không đủ tồn kho.',
  'PRODUCT_NOT_FOUND': 'Không tìm thấy sản phẩm.',
  'INACTIVE_PRODUCT': 'Sản phẩm đã ngừng hoạt động.',
  'INVALID_QUANTITY': 'Số lượng không hợp lệ.',
  'DUPLICATE_PHONE': 'Số điện thoại này đã được sử dụng.',
  'DUPLICATE_EMAIL': 'Email này đã được sử dụng.',
  'DUPLICATE_CODE': 'Mã này đã tồn tại.',
  
  // Payment errors
  'PAYMENT_FAILED': 'Thanh toán thất bại. Vui lòng thử lại.',
  'INSUFFICIENT_BALANCE': 'Số dư không đủ.',
  'INVALID_PAYMENT_METHOD': 'Phương thức thanh toán không hợp lệ.',
  
  // Network errors
  'NETWORK_ERROR': 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.',
  'TIMEOUT': 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  
  // Server errors
  'INTERNAL_SERVER_ERROR': 'Lỗi hệ thống. Vui lòng thử lại sau.',
  'SERVICE_UNAVAILABLE': 'Dịch vụ tạm thời không khả dụng.',
};

/**
 * Extract error message from API error response
 * @param error - Error object from API call
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
// Type guard for error with response property
function isErrorWithResponse(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'response' in error;
}

// Type guard for error with message property
function isErrorWithMessage(error: unknown): error is { message?: string } {
  return typeof error === 'object' && error !== null;
}

export function handleApiError(error: unknown, defaultMessage: string = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  // Handle network errors
  if (!isErrorWithResponse(error)) {
    if (isErrorWithMessage(error) && (error.message?.includes('Network Error') || error.message?.includes('timeout'))) {
      return ERROR_MESSAGES.NETWORK_ERROR || 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.';
    }
    return (isErrorWithMessage(error) && error.message) || defaultMessage;
  }

  const errorData = error.response?.data;
  if (!errorData) {
    return defaultMessage;
  }

  // Check for validation errors array (Spring Boot format)
  if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
    const firstError = errorData.errors[0];
    const errorMessage = firstError.message || firstError.defaultMessage;
    
    // Check for specific field errors
    if (firstError.field) {
      // Map common field errors to user-friendly messages
      const fieldMessages: Record<string, string> = {
        'soDienThoai': 'Số điện thoại không hợp lệ.',
        'email': 'Email không hợp lệ.',
        'soLuong': 'Số lượng phải lớn hơn 0.',
        'donGia': 'Đơn giá phải lớn hơn 0.',
        'ngayBatDau': 'Ngày bắt đầu không hợp lệ.',
        'ngayKetThuc': 'Ngày kết thúc phải sau ngày bắt đầu.',
      };
      
      if (fieldMessages[firstError.field]) {
        return fieldMessages[firstError.field];
      }
    }
    
    return errorMessage || ERROR_MESSAGES.VALIDATION_ERROR || defaultMessage;
  }

  // Check for error message string
  if (errorData.message) {
    const message = errorData.message;
    
    // Check if message matches any known error codes
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
      if (message.toUpperCase().includes(key)) {
        return value;
      }
    }
    
    // Check for duplicate errors
    if (message.includes('số điện thoại') || message.includes('phone') || message.includes('duplicate')) {
      return ERROR_MESSAGES.DUPLICATE_PHONE || 'Số điện thoại này đã được sử dụng.';
    }
    
    if (message.includes('email') && message.includes('duplicate')) {
      return ERROR_MESSAGES.DUPLICATE_EMAIL || 'Email này đã được sử dụng.';
    }
    
    // Check for stock errors
    if (message.includes('tồn kho') || message.includes('stock') || message.includes('INSUFFICIENT_STOCK')) {
      return ERROR_MESSAGES.INSUFFICIENT_STOCK || 'Sản phẩm không đủ tồn kho.';
    }
    
    return message;
  }

  // Check for error code
  if (errorData.error) {
    const errorCode = errorData.error.toUpperCase();
    if (ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }
  }

  // Check HTTP status codes
  const status = error.response?.status;
  if (status === 401) {
    return ERROR_MESSAGES.UNAUTHORIZED || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (status === 403) {
    return ERROR_MESSAGES.FORBIDDEN || 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (status === 404) {
    return 'Không tìm thấy dữ liệu.';
  }
  if (status === 500) {
    return ERROR_MESSAGES.INTERNAL_SERVER_ERROR || 'Lỗi hệ thống. Vui lòng thử lại sau.';
  }
  if (status === 503) {
    return ERROR_MESSAGES.SERVICE_UNAVAILABLE || 'Dịch vụ tạm thời không khả dụng.';
  }

  return defaultMessage;
}

/**
 * Extract field-specific errors from validation error response
 * @param error - Error object from API call
 * @returns Map of field names to error messages
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  if (isErrorWithResponse(error) && error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });
  }
  
  return fieldErrors;
}


