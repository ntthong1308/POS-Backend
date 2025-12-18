/**
 * Phone number formatting and validation utilities
 */

/**
 * Format phone number to Vietnamese standard format (0XXXXXXXXX)
 * @param phone - Phone number string (can be in various formats)
 * @returns Formatted phone number (10 digits starting with 0)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 84 (Vietnam country code), convert to 0
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  // Ensure it starts with 0
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  // Take only first 10 digits
  cleaned = cleaned.substring(0, 10);
  
  return cleaned;
}

/**
 * Validate Vietnamese phone number format
 * @param phone - Phone number string
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  const formatted = formatPhoneNumber(phone);
  
  // Vietnamese phone numbers: 10 digits starting with 0
  // Common prefixes: 03, 05, 07, 08, 09
  const phoneRegex = /^0[35789]\d{8}$/;
  
  return phoneRegex.test(formatted);
}

/**
 * Display phone number in user-friendly format
 * @param phone - Phone number string
 * @returns Formatted display string (e.g., "0901 234 567")
 */
export function displayPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  
  if (formatted.length !== 10) return phone;
  
  // Format: 0XXX XXX XXX
  return `${formatted.substring(0, 4)} ${formatted.substring(4, 7)} ${formatted.substring(7)}`;
}


