import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utilities for easier imports
export { logger } from './utils/logger';
export { handleApiError, getFieldErrors } from './utils/errorHandler';
export { formatPhoneNumber, validatePhoneNumber, displayPhoneNumber } from './utils/phone';
export { parseJWT, isJWTExpired, getTokenExpiry, getTimeUntilExpiry, isTokenExpiringSoon } from './utils/jwt';

/**
 * Format điểm tích lũy để hiển thị
 * Backend đã tính và lưu: 1000 VND = 1 điểm (ví dụ: 35,000 VND → 35 điểm)
 * Frontend chỉ cần hiển thị trực tiếp giá trị từ backend
 * @param points - Số điểm từ backend (đã được tính: thanhTien / 1000)
 * @returns Số điểm để hiển thị (giữ nguyên, không cần chia)
 */
export function formatPoints(points: number | undefined | null): number {
  if (points === undefined || points === null || isNaN(points)) {
    return 0;
  }
  // Backend đã tính sẵn: thanhTien.divide(1000, 0, RoundingMode.HALF_UP)
  // Frontend chỉ cần hiển thị trực tiếp
  return Math.round(points);
}

/**
 * Format điểm tích lũy để hiển thị dạng string (có format số)
 * @param points - Số điểm từ backend (đã được tính: thanhTien / 1000)
 * @returns String đã format (ví dụ: "35")
 */
export function formatPointsString(points: number | undefined | null): string {
  return formatPoints(points).toLocaleString('vi-VN');
}