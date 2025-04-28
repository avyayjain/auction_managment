import axios from 'axios';

// Get the API URL from environment variables or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only in browser)
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    // Add token to header if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If running in browser, clear token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }

      // Redirect to login page if in browser and not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api; 