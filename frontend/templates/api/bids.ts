import axios from "axios";

const API_URL = "http://localhost:8000"; // adjust if needed

export const fetchActiveItems = async () => {
  const response = await axios.get(`${API_URL}/active-items`);
  return response.data;
};

export const fetchBidHistory = async (itemId: number) => {
  const response = await axios.get(`${API_URL}/bid-history/${itemId}`);
  return response.data;
};
