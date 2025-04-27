import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",  // 🛠️ adjust if your FastAPI server runs elsewhere
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add token automatically if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
