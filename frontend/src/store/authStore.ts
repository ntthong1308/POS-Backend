import { create } from 'zustand';
import { LoginResponse } from '@/lib/types';
import { isJWTExpired, isTokenExpiringSoon, getTokenExpiry } from '@/lib/utils/jwt';

interface AuthState {
  user: LoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Track if auth has been initialized from localStorage
  login: (response: LoginResponse) => void;
  logout: () => void;
  initialize: () => void; // Initialize from localStorage
  checkTokenValidity: () => boolean; // Check if current token is still valid
}

// Token Storage Keys
const TOKEN_KEY = 'retail_pos_token';
const USER_KEY = 'retail_pos_user';

/**
 * Check if token is expired using JWT payload
 * Falls back gracefully if JWT parsing fails (token might not be JWT format)
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  // First, try to check JWT expiry from token payload
  const jwtExpired = isJWTExpired(token);
  if (jwtExpired !== null) {
    return jwtExpired; // Use JWT expiry check (true = expired, false = valid)
  }
  
  // If JWT parsing fails (return null), token might not be JWT format
  // In this case, we should NOT consider it expired automatically
  // Instead, let the backend validate it (via 401 response)
  // Return false to allow token to be used (backend will reject if invalid)
  return false;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  login: (response) => {
    // Validate token before storing
    if (!response.token) {
      return; // Invalid response
    }
    
    // Check if token is already expired (shouldn't happen, but safety check)
    if (isJWTExpired(response.token) === true) {
      return; // Don't store expired token
    }
    
    set({ 
      user: response, 
      token: response.token, 
      isAuthenticated: true 
    });
    
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  checkTokenValidity: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }
    
    // Check JWT expiry
    const expired = isTokenExpired(token);
    if (expired) {
      // Clear expired token
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
    
    // Check if token is expiring soon (within 5 minutes)
    // This can be used to trigger refresh token if needed
    if (isTokenExpiringSoon(token, 5 * 60 * 1000)) {
      // Token expiring soon - could trigger refresh here
      // For now, just return true (still valid)
    }
    
    return true;
  },
  initialize: () => {
    // Mark as initialized first to prevent race conditions
    set({ isInitialized: true });
    
    // Initialize auth state from localStorage on app load
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (!savedToken || !savedUser) {
      // No saved token/user, mark as initialized but not authenticated
      return;
    }
    
    // Check if token is expired using JWT payload
    // Only clear if we're CERTAIN it's expired (JWT parsing succeeded and expired = true)
    const jwtExpired = isJWTExpired(savedToken);
    if (jwtExpired === true) {
      // Token is definitely expired (JWT parsed successfully and expired)
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }
    
    // If jwtExpired is null (can't parse JWT), don't clear token
    // Let backend validate it - if invalid, backend will return 401
    
    try {
      const user = JSON.parse(savedUser);
      if (user && user.token === savedToken) {
        set({ 
          user, 
          token: savedToken, 
          isAuthenticated: true 
        });
      } else {
        // Token mismatch - clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
}));

