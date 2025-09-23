import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminApi = {
  getUsers: async ({ page = 1, pageSize = 10, q = '' } = {}) => {
    const { data } = await api.get('admin/users', {
      params: { page, pageSize, q },
    });
    return data; // { data, total }
  },

  getUserById: async (userId) => {
    const { data } = await api.get(`admin/users/${userId}`);
    return data; // { user }
  },

  createUser: async (userData) => {
    const { data } = await api.post('admin/users', userData);
    return data;
  },

  updateUser: async (userId, userData) => {
    const { data } = await api.put(`admin/users/${userId}`, userData);
    return data;
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`admin/users/${userId}`);
    return data;
  },

  // News API
  getNews: async ({ page = 1, pageSize = 10, q = '' } = {}) => {
    const { data } = await api.get('admin/news', {
      params: { page, pageSize, q },
    });
    return data; // { data, total }
  },

  getNewsById: async (newsId) => {
    const { data } = await api.get(`admin/news/${newsId}`);
    return data; // { news }
  },

  createNews: async (newsData) => {
    const { data } = await api.post('admin/news', newsData);
    return data;
  },

  updateNews: async (newsId, newsData) => {
    const { data } = await api.put(`admin/news/${newsId}`, newsData);
    return data;
  },

  deleteNews: async (newsId) => {
    const { data } = await api.delete(`admin/news/${newsId}`);
    return data;
  },
};


