import axios from 'axios';

// Create a dedicated axios instance for the admin API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// Add an interceptor to include the admin token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAuthApi = {
  login: (username, password) => api.post('admin/auth/login', { username, password }),
  me: () => api.get('admin/me'),
};
