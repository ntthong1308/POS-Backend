/**
 * JWT token utilities
 * Parse and validate JWT tokens
 */

interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Parse JWT token payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64 payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false if valid, null if invalid token
 */
export function isJWTExpired(token: string): boolean | null {
  const payload = parseJWT(token);
  
  if (!payload) {
    return null; // Invalid token
  }

  if (!payload.exp) {
    return true; // No expiry claim, consider expired
  }

  // exp is in seconds, convert to milliseconds
  const expiryTime = payload.exp * 1000;
  const now = Date.now();

  return now >= expiryTime;
}

/**
 * Get token expiry date
 * @param token - JWT token string
 * @returns Expiry date or null if invalid
 */
export function getTokenExpiry(token: string): Date | null {
  const payload = parseJWT(token);
  
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Get time until token expires (in milliseconds)
 * @param token - JWT token string
 * @returns Milliseconds until expiry, or null if invalid/expired
 */
export function getTimeUntilExpiry(token: string): number | null {
  const payload = parseJWT(token);
  
  if (!payload || !payload.exp) {
    return null;
  }

  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  const timeUntilExpiry = expiryTime - now;

  return timeUntilExpiry > 0 ? timeUntilExpiry : null;
}

/**
 * Check if token will expire soon (within threshold)
 * @param token - JWT token string
 * @param thresholdMs - Threshold in milliseconds (default: 5 minutes)
 * @returns true if expiring soon, false otherwise
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  
  if (timeUntilExpiry === null) {
    return true; // Consider expired/invalid as "expiring soon"
  }

  return timeUntilExpiry <= thresholdMs;
}


