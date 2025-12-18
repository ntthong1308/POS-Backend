import { useState, useCallback } from 'react';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

interface UseAsyncOperationOptions {
  defaultErrorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for handling async operations with loading and error states
 * @param options - Configuration options
 * @returns Object with loading state, error state, and execute function
 */
export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const { defaultErrorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.', onSuccess, onError } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, defaultErrorMessage);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      } else {
        logger.error('Async operation error:', err);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [defaultErrorMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { 
    loading, 
    error, 
    execute,
    reset,
  };
}


