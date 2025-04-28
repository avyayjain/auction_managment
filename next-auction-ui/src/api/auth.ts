import api from './api';

// Type definitions for auth-related data
export interface User {
  user_id: number;
  email_id: string;
  name: string;
  user_type: 'user' | 'admin';
  token?: string;
}

export interface LoginRequest {
  email_id: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  user_type: 'user' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ProfileUpdateRequest {
  email?: string;
  current_password?: string;
  new_password?: string;
  profile_image?: string;
}

// Helper functions for token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Auth service methods
export const authService = {
  /**
   * Log in a user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/token', credentials);
    
    // Store token
    if (response.data.access_token) {
      setToken(response.data.access_token);
      
      // Add user data to response
      const userData = {
        user_id: response.data.user_id,
        email_id: credentials.email_id,
        name: response.data.name || 'User',
        user_type: response.data.user_type || 'user',
        token: response.data.access_token
      };
      
      response.data.user = userData;
    }
    
    return response.data;
  },
  
  /**
   * Register a new user
   */
  signup: async (userData: RegisterRequest): Promise<any> => {
    const response = await api.post('/api/user/sign-up/', userData);
    return response.data;
  },
  
  /**
   * Log out the current user
   */
  logout: (): void => {
    removeToken();
    localStorage.removeItem('user');
  },
  
  /**
   * Get current user profile (using token information)
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<User> => {
    const response = await api.put<User>('/users/me', profileData);
    return response.data;
  },
  
  /**
   * Check if current token is valid
   */
  validateToken: async (): Promise<boolean> => {
    try {
      // Try making a request that requires authentication
      await api.get('/api/item/get_item_details');
      return true;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        removeToken();
        localStorage.removeItem('user');
        return false;
      }
      // If it's not an auth error, consider token still valid
      return true;
    }
  },
};

export default authService; 