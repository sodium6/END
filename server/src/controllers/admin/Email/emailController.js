// controllers/admin/adminContentController.js  (หรือไฟล์ controller เดิมของคุณ)
const pool = require('../../../db/database');
const nodemailer = require('nodemailer');
const path = require('path');

const MAIL_FROM = process.env.MAIL_FROM || '"University PR" <no-reply@example.com>';

/* -------------------- helpers -------------------- */
const getAdminId = (req) =>
    req.admin?.admin_id ?? req.admin?.id ?? req.user?.admin_id ?? req.user?.id ?? null;
  
// สร้าง nodemailer transporter (ถ้าไม่ตั้งค่า SMTP จะ fallback เป็น Ethereal ฟรี)
async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: /^true$/i.test(process.env.SMTP_SECURE || ''), // true ใช้ 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: test.user, pass: test.pass },
  });
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function absUrl(req, maybeUrl) {
  if (!maybeUrl) return '';
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}${maybeUrl.startsWith('/') ? maybeUrl : `/${maybeUrl}`}`;
}

async function getSubscribers() {
  const [rows] = await pool.query('SELECT email FROM newsletter_subscriptions');
  // กรอง null/ซ้ำแบบคร่าว ๆ
  const set = new Set(rows.map(r => (r.email || '').trim()).filter(Boolean));
  return [...set];
}

// ส่งอีเมลหา subscriber ทั้งหมด (ส่งทีละคนเพื่อไม่เปิดเผยอีเมลกัน)
async function sendToAllSubscribers({ subject, html }) {
  const recipients = await getSubscribers();
  if (recipients.length === 0) {
    return { total: 0, sent: 0, failed: 0, firstPreviewUrl: null };
  }

  const transporter = await getTransporter();
  let sent = 0, failed = 0, firstPreviewUrl = null;

  for (const to of recipients) {
    try {
      const info = await transporter.sendMail({ from: MAIL_FROM, to, subject, html });
      sent += 1;
      // เก็บลิงก์ดูอีเมลบน Ethereal (ถ้าใช้ Ethereal)
      if (!firstPreviewUrl) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) firstPreviewUrl = preview;
      }
    } catch (e) {
      failed += 1;
      // ไม่ throw เพื่อให้ลูปไปต่อ
    }
  }
  return { total: recipients.length, sent, failed, firstPreviewUrl };
}

// ดึงข่าวที่เผยแพร่แล้วตาม id (เดี่ยว)
async function getPublishedNewsById(id) {
  const [rows] = await pool.query(
    `SELECT news_id, title, content, category, status, featured_image_url, created_at, updated_at
     FROM news WHERE news_id = ? AND status = 'published'`, [id]
  );
  return rows[0] || null;
}

// ดึงข่าวหลายอัน (เฉพาะที่ published)
async function getPublishedNewsByIds(ids = []) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT news_id, title, content, category, status, featured_image_url, created_at, updated_at
     FROM news WHERE status = 'published' AND news_id IN (${placeholders})`,
    ids
  );
  // รักษาลำดับตาม ids ที่ส่งมา
  const map = new Map(rows.map(r => [r.news_id, r]));
  return ids.map(id => map.get(id)).filter(Boolean);
}

/* -------------------- HTML template -------------------- */

function buildSingleNewsHtml(req, news, message = '') {
  const img = news.featured_image_url ? `<div style="margin:12px 0">
    <img src="${absUrl(req, news.featured_image_url)}" alt="${escapeHtml(news.title)}" style="max-width:100%;border-radius:8px;border:1px solid #eee"/>
  </div>` : '';

  const msg = message ? `<p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr/>` : '';

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;line-height:1.6;color:#111">
    ${msg}
    <h2 style="margin:0 0 6px 0">${escapeHtml(news.title)}</h2>
    <div style="color:#555;font-size:12px;margin-bottom:8px">
      หมวดหมู่: ${escapeHtml(news.category || 'ทั่วไป')} • อัปเดต: ${new Date(news.updated_at || news.created_at).toLocaleString('th-TH')}
    </div>
    ${img}
    <div>${escapeHtml(news.content)}</div>
    <hr style="margin-top:16px"/>
    <div style="color:#666;font-size:12px">อีเมลนี้ถูกส่งจากระบบข่าวประชาสัมพันธ์</div>
  </div>`;
}

function buildMultiNewsHtml(req, list = [], message = '') {
  const msg = message ? `<p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr/>` : '';
  const items = list.map(n => `
    <div style="margin:18px 0">
      <h3 style="margin:0 0 6px 0">${escapeHtml(n.title)}</h3>
      <div style="color:#555;font-size:12px;margin-bottom:8px">
        หมวดหมู่: ${escapeHtml(n.category || 'ทั่วไป')} • อัปเดต: ${new Date(n.updated_at || n.created_at).toLocaleString('th-TH')}
      </div>
      ${n.featured_image_url ? `<img src="${absUrl(req, n.featured_image_url)}" alt="${escapeHtml(n.title)}" style="max-width:100%;border-radius:8px;border:1px solid #eee;margin-bottom:8px"/>` : ''}
      <div>${escapeHtml(n.content)}</div>
    </div>
    <hr/>
  `).join('');

  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;line-height:1.6;color:#111">
    ${msg}
    ${items || '<p>ไม่มีรายการข่าว</p>'}
    <div style="color:#666;font-size:12px;margin-top:12px">อีเมลนี้ถูกส่งจากระบบข่าวประชาสัมพันธ์</div>
  </div>`;
}

/* -------------------- controllers -------------------- */

// สรุปจำนวนผู้สมัครรับข่าวสาร
exports.subscribersSummary = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM newsletter_subscriptions');
    res.json({ total: rows[0]?.total || 0 });
  } catch (e) {
    console.error('[email] subscribersSummary failed:', e);
    res.status(500).json({ message: 'summary_failed' });
  }
};

// ส่งข่าวเดี่ยว (มีอยู่เดิม—อัปเดตให้รองรับ message)
exports.broadcastNews = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid_id' });

    const news = await getPublishedNewsById(id);
    if (!news) return res.status(404).json({ message: 'news_not_found_or_not_published' });

    const message = (req.body?.message || '').toString();
    const subject = `ข่าวประชาสัมพันธ์: ${news.title}`;
    const html = buildSingleNewsHtml(req, news, message);

    const result = await sendToAllSubscribers({ subject, html });
    res.json({ ok: true, news_id: id, ...result });
  } catch (e) {
    console.error('[email] broadcastNews failed:', e);
    res.status(500).json({ message: 'broadcast_failed' });
  }
};

// ส่งข่าวหลายอันในคำขอเดียว
exports.broadcastBulk = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.news_ids) ? req.body.news_ids.map(Number).filter(n => Number.isInteger(n)) : [];
    if (ids.length === 0) return res.status(400).json({ message: 'news_ids_required' });

    const list = await getPublishedNewsByIds(ids);
    if (list.length === 0) return res.status(404).json({ message: 'no_published_news_found' });

    const message = (req.body?.message || '').toString();
    const subject = `ข่าวประชาสัมพันธ์ (${list.length} รายการ)`;
    const html = buildMultiNewsHtml(req, list, message);

    const result = await sendToAllSubscribers({ subject, html });
    res.json({ ok: true, count: list.length, ids: list.map(x => x.news_id), ...result });
  } catch (e) {
    console.error('[email] broadcastBulk failed:', e);
    res.status(500).json({ message: 'broadcast_bulk_failed' });
  }
};
