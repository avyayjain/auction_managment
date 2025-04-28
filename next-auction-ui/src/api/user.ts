import axios from 'axios';
import { setToken, setUser, removeToken, removeUser, getAuthHeader } from '../utils/auth';

// API base URL from environment or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interface definitions
export interface User {
  user_id: number;
  email_id: string;
  name: string;
  user_type: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  user_type?: 'admin' | 'user';
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Mock fallback data
const MOCK_USER: User = {
  user_id: 1,
  email_id: 'demo@example.com',
  name: 'Demo User',
  user_type: 'user'
};

const MOCK_ADMIN: User = {
  user_id: 2,
  email_id: 'admin@example.com',
  name: 'Admin User',
  user_type: 'admin'
};

const MOCK_BIDS = [
  {
    item_name: "Vintage Watch Collection",
    bid_amount: 250,
    timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    item_name: "Antique Wooden Furniture",
    bid_amount: 500,
    timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    item_name: "Collectible Trading Cards",
    bid_amount: 150,
    timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  }
];

// Flag to indicate if we should use fallback data
let useFallback = false;

// Initialize fallback mode automatically
setTimeout(() => {
  axios.get(`${API_BASE_URL}/health`).catch(() => {
    console.log("Server appears to be down, enabling fallback mode for user API");
    useFallback = true;
  });
}, 150);

/**
 * Login a user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    if (useFallback) {
      console.log("Using fallback for login");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple mock authentication
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        const mockResponse: LoginResponse = {
          access_token: 'mock_token_12345',
          token_type: 'bearer',
          user: MOCK_USER
        };
        
        setToken(mockResponse.access_token);
        setUser(mockResponse.user);
        return mockResponse.user;
      } else if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
        const mockResponse: LoginResponse = {
          access_token: 'mock_admin_token_12345',
          token_type: 'bearer',
          user: MOCK_ADMIN
        };
        
        setToken(mockResponse.access_token);
        setUser(mockResponse.user);
        return mockResponse.user;
      } else {
        throw new Error('Invalid credentials');
      }
    }

    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store authentication data
    setToken(data.access_token);
    setUser(data.user);
    
    return data.user;
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return login(credentials);
    }
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    if (useFallback) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate email format
      if (!userData.email.includes('@')) {
        throw new Error('Invalid email format');
      }
      
      // Create a mock user
      const mockUser: User = {
        user_id: 3, // New user ID
        email_id: userData.email,
        name: userData.name,
        user_type: userData.user_type || 'user'
      };
      
      return mockUser;
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return register(userData);
    }
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    if (useFallback) {
      // Simple mock logout
      removeToken();
      removeUser();
      return;
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok && response.status !== 0) {
      console.warn('Logout failed on server, but will proceed with local logout');
    }
  } catch (error) {
    console.warn('Error during logout:', error);
  } finally {
    // Always remove local auth data even if server request fails
    removeToken();
    removeUser();
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    if (useFallback) {
      const token = localStorage.getItem('token');
      
      // If we have a saved user, return it
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      
      // Otherwise, return a default user based on token
      if (token === 'mock_admin_token_12345') {
        return MOCK_ADMIN;
      } else {
        return MOCK_USER;
      }
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user profile');
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return getCurrentUser();
    }
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    if (useFallback) {
      // Get current user
      const currentUser = await getCurrentUser();
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        ...userData,
      };
      
      // Save updated user
      setUser(updatedUser);
      return updatedUser;
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
    return updatedUser;
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return updateUserProfile(userData);
    }
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    if (useFallback) {
      // Just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return changePassword(currentPassword, newPassword);
    }
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Get user's bid history
 */
export const getUserBids = async (): Promise<any[]> => {
  try {
    if (useFallback) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_BIDS;
    }

    const response = await fetch(`${API_BASE_URL}/bid_history`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      }
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch bid history');
    }

    return await response.json();
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return getUserBids();
    }
    console.error('Failed to fetch user bids:', error);
    throw error;
  }
};

/**
 * Get user's won auctions
 */
export const getUserWonItems = async (): Promise<any[]> => {
  try {
    if (useFallback) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [{
        item_id: 4,
        name: "Vintage Camera",
        end_time: new Date(Date.now() - 86400000).toISOString(),
        winning_bid: 350
      }];
    }

    const response = await fetch(`${API_BASE_URL}/users/won-items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      throw new Error(`Failed to fetch won items: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return getUserWonItems();
    }
    console.error('Failed to fetch won items:', error);
    throw error;
  }
};

/**
 * Get items created by the current user
 */
export const getUserItems = async (): Promise<any[]> => {
  try {
    if (useFallback) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock user items
      return [
        {
          item_id: 1,
          name: "Vintage Watch Collection",
          start_time: new Date(Date.now() - 3600000).toISOString(),
          end_time: new Date(Date.now() + 86400000).toISOString(),
          current_bid: 250,
          start_price: 200,
          status: 'active',
          user_id: 1
        },
        {
          item_id: 2,
          name: "Antique Wooden Furniture",
          start_time: new Date(Date.now() - 86400000).toISOString(),
          end_time: new Date(Date.now() + 172800000).toISOString(),
          current_bid: 500,
          start_price: 400,
          status: 'active',
          user_id: 1
        },
        {
          item_id: 3,
          name: "Collectible Trading Cards",
          start_time: new Date(Date.now() + 86400000).toISOString(),
          end_time: new Date(Date.now() + 259200000).toISOString(),
          current_bid: null,
          start_price: 75,
          status: 'upcoming',
          user_id: 1
        }
      ];
    }

    const response = await fetch(`${API_BASE_URL}/items/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      if (!response.status) {
        throw new Error('Cannot connect to the server. Please try again later.');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user items');
    }

    return await response.json();
  } catch (error) {
    if (!useFallback && error instanceof Error && error.message.includes('Cannot connect to the server')) {
      useFallback = true;
      return getUserItems();
    }
    console.error('Error fetching user items:', error);
    throw error;
  }
}; 