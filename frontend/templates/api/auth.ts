import axios from "axios";

const API_URL = "http://localhost:8000"; // adjust if needed

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async (email: string, password: string, username: string) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    username
  });
  return response.data;
};
