'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { RegisterRequest } from '../../src/api/auth';

interface User {
  user_id: number;
  email_id: string;
  name: string;
  user_type: 'user' | 'admin';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token and user data
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({
        email_id: email,
        password: password
      });
      
      // Extract user data
      const userData = response.user;
      
      setUser(userData);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.signup(userData);
      // After signup, login the user
      await login(userData.email, userData.password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail?.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 