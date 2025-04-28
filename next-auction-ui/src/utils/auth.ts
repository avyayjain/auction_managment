// Authentication utility functions

import { User } from '../api/user';

// Token management
const TOKEN_KEY = 'auction_token';
const USER_KEY = 'auction_user';

/**
 * Set the authentication token in local storage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get the authentication token from local storage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Set the user data in local storage
 */
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get the user data from local storage
 */
export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Remove the user data from local storage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

/**
 * Check if the user is an admin
 */
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.user_type === 'admin';
};

/**
 * Get the authentication header for API requests
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Handle expired tokens by redirecting to login page
 * This should be used in API response handling when a 401 status is received
 */
export const handleTokenExpiration = (): void => {
  removeToken();
  removeUser();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Setup auth-related listeners
 * This function should be called once when the app initializes
 */
export const setupAuthListeners = (): void => {
  // Handle storage events for logout synchronization across tabs
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === TOKEN_KEY && !event.newValue) {
        // Token was removed in another tab, redirect to login
        window.location.href = '/login';
      }
    });
  }
};

/**
 * Login user
 */
export const login = (token: string, user: User): void => {
  setToken(token);
  setUser(user);
}; 