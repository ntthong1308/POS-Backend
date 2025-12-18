/**
 * Validation helper functions
 * Use Zod schemas to validate form data
 */

import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Validate form data with Zod schema
 * @param schema - Zod schema
 * @param data - Form data to validate
 * @returns Validation result with success flag and errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      // Kiểm tra error.errors có tồn tại và là array không
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (path) {
            errors[path] = err.message;
          } else {
            // If no path, it's a general error
            errors._general = err.message;
          }
        });
      } else {
        // Fallback nếu error.errors không phải array
        errors._general = error.message || 'Validation failed';
      }
      
      return { success: false, errors };
    }
    
    return { success: false, errors: { _general: 'Validation failed' } };
  }
}

/**
 * Validate form and show toast error if invalid
 * @param schema - Zod schema
 * @param data - Form data to validate
 * @returns Validation result
 */
export function validateFormWithToast<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T } {
  const result = validateForm(schema, data);
  
  if (!result.success && result.errors) {
    // Show first error message
    const firstError = Object.values(result.errors)[0];
    if (firstError) {
      toast.error(firstError);
    }
  }
  
  return { success: result.success, data: result.data };
}

/**
 * Get field error message
 * @param errors - Errors object from validation
 * @param fieldName - Field name
 * @returns Error message or undefined
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  fieldName: string
): string | undefined {
  if (!errors) return undefined;
  return errors[fieldName];
}

/**
 * Check if field has error
 * @param errors - Errors object from validation
 * @param fieldName - Field name
 * @returns true if field has error
 */
export function hasFieldError(
  errors: Record<string, string> | undefined,
  fieldName: string
): boolean {
  return !!getFieldError(errors, fieldName);
}

