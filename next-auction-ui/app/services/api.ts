import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auction_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authService = {
  login: async (email_id: string, password: string) => {
    const response = await api.post('/token', { email_id, password });
    return response.data;
  },
  
  signup: async (userData: { 
    email: string;
    password: string;
    name: string;
    user_type: string;
  }) => {
    const response = await api.post('/user/sign-up/', userData);
    return response.data;
  }
};

// Item endpoints
export const itemService = {
  addItem: async (itemData: {
    item_name: string;
    start_time: string;
    end_time: string;
    start_price: number;
  }) => {
    const response = await api.post('/item/add_item_details', itemData);
    return response.data;
  },
  
  getAllItems: async () => {
    const response = await api.get('/v1/item/get_item_details');
    return response.data;
  },
  
  getItemById: async (id: number) => {
    const response = await api.get(`/v1/item/get_item_details/${id}`);
    return response.data;
  },
  
  updateItem: async (id: number, itemData: {
    item_name: string;
    start_time: string;
    end_time: string;
    start_price: number;
    current_bid?: number;
    user_id?: number;
    status?: boolean;
    won_by?: number | null;
  }) => {
    const response = await api.put(`/v1/item/update_item_details/${id}`, itemData);
    return response.data;
  }
};

export default api; 