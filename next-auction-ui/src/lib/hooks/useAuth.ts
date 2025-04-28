import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginRequest, RegisterRequest } from '@/api/auth';
import { toast } from 'react-toastify';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Custom hook for authentication state management
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch user data if token exists
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Validate token first
      const isValid = await authService.validateToken();
      if (!isValid) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      // Get user profile
      const userData = await authService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user data on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Successfully logged in!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
    router.push('/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };
}

export default useAuth; 