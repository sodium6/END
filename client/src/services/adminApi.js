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

  // Member API
  getMembers: async ({ page = 1, pageSize = 10, q = '', status = '' } = {}) => {
    const params = { page, pageSize, q };
    if (status) {
      params.status = status;
    }
    const { data } = await api.get('admin/members', { params });
    return data; // { data, total }
  },

  getMemberById: async (memberId) => {
    const { data } = await api.get(`admin/members/${memberId}`);
    return data; // { member }
  },

  updateMemberStatus: async (memberId, status) => {
    const { data } = await api.patch(`admin/members/${memberId}/status`, { status });
    return data;
  },

  resetMemberPassword: async (memberId, password) => {
    const payload = {};
    if (password) {
      payload.password = password;
    }
    const { data } = await api.post(`admin/members/${memberId}/reset-password`, payload);
    return data; // { memberId, newPassword, generated }
  },

  deleteMember: async (memberId) => {
    const { data } = await api.delete(`admin/members/${memberId}`);
    return data;
  },
  // Analytics API
  getAnalyticsSummary: async () => {
    const { data } = await api.get('admin/analytics/summary');
    return data;
  },


  // News API
  getNews: async ({ page = 1, pageSize = 10, q = '', category, excludeCategory } = {}) => {
    const params = { page, pageSize, q };
    if (category) {
      params.category = category;
    }
    if (excludeCategory) {
      params.excludeCategory = excludeCategory;
    }
    const { data } = await api.get('admin/news', { params });
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

  // Category API
  getCategories: async () => {
    const { data } = await api.get('admin/news/categories');
    return data; // { categories: [] }
  },

  createCategory: async (categoryData) => {
    const { data } = await api.post('admin/news/categories', categoryData);
    return data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const { data } = await api.put(`admin/news/categories/${categoryId}`, categoryData);
    return data;
  },

  deleteCategory: async (categoryId) => {
    const { data } = await api.delete(`admin/news/categories/${categoryId}`);
    return data;
  },
};








