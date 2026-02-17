import axios from "axios";

// ตั้ง baseURL ตาม BE ของคุณ
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // เผื่อใช้ session/cookie
});

// Interceptor สำหรับแนบ token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
