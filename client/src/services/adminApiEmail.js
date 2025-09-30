// src/services/adminApiEmail.js
import api from './api';

export const adminApiEmail = {
  // ข่าวที่พร้อมส่ง (เช่น status=published)
  listPublishedNews: (params = {}) =>
    api
      .get('/admin/news', { params: { status: 'published', sort: '-created_at', per_page: 50, ...params } })
      .then((r) => r.data),

  // จำนวนผู้สมัครรับอีเมล
  subscribersSummary: () =>
    api.get('/admin/email/subscribers/summary').then((r) => r.data),

  // ส่งข่าวเดี่ยว พร้อมข้อความแนบ
  broadcastOne: (newsId, { message } = {}) =>
    api.post(`/admin/news/${newsId}/broadcast`, { message }).then((r) => r.data),

  // ส่งหลายข่าวในคำขอเดียว (ถ้ามี endpoint นี้)
  broadcastBulk: (newsIds = [], { message } = {}) =>
    api.post('/admin/email/broadcast', { news_ids: newsIds, message }).then((r) => r.data),
};
