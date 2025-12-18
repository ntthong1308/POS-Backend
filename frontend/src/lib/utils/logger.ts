/**
 * Logger utility - Replaces console.log with environment-aware logging
 * Only logs in development mode to avoid exposing sensitive data in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * Sanitize data before logging to remove sensitive information
 */
function sanitizeForLog(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'token',
    'password',
    'cardNumber',
    'cvv',
    'pin',
    'secret',
    'authorization',
    'apiKey',
    'accessToken',
    'refreshToken',
  ];

  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }

  const sanitized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLog(data[key]);
      }
    }
  }

  return sanitized;
}

export const logger = {
  /**
   * Log information (only in development)
   */
  log: (...args: any[]) => {
    if (isDev) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeForLog(arg) : arg
      );
      console.log(...sanitized);
    }
  },

  /**
   * Log errors (always logged, but sanitized in production)
   */
  error: (...args: any[]) => {
    if (isProd) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeForLog(arg) : arg
      );
      console.error(...sanitized);
    } else {
      console.error(...args);
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeForLog(arg) : arg
      );
      console.warn(...sanitized);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeForLog(arg) : arg
      );
      console.debug(...sanitized);
    }
  },

  /**
   * Log info (only in development)
   */
  info: (...args: any[]) => {
    if (isDev) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeForLog(arg) : arg
      );
      console.info(...sanitized);
    }
  },
};


