// src/services/adminApiEmail.js
import api from './api';


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const adminApiEmail = {
  /** ดึงข่าวที่เผยแพร่แล้ว (published) */
  listPublishedNews: (params = {}) =>
    api
      .get('/admin/news', {
        params: {
          status: 'published',
          sort: '-created_at',
          per_page: 50,
          ...params,
        },
      })
      .then((r) => r.data),

  /** สรุปจำนวนผู้สมัครรับข่าวสาร */
  subscribersSummary: () =>
    api.get('/admin/email/subscribers/summary').then((r) => r.data),

  /** ส่งข่าวเดี่ยวตาม id พร้อมข้อความแนบ (option) */
  broadcastOne: (newsId, { message = '' } = {}) =>
    api
      .post(`/admin/news/${newsId}/broadcast`, { message })
      .then((r) => r.data),

  /** ส่งหลายข่าวพร้อมกัน (เฉพาะ id ที่ส่งมา และต้องเป็น published) */
  broadcastBulk: (newsIds = [], { message = '' } = {}) =>
    api
      .post('/admin/email/broadcast', { news_ids: newsIds, message })
      .then((r) => r.data),
};

export default adminApiEmail;
