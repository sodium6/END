// controllers/admin/adminContentController.js
const pool = require('../../../db/database');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

/* ======================= ENV & CONSTANTS ======================= */
const EMAIL_DEBUG = /^true$/i.test(process.env.EMAIL_DEBUG || '');
const RAW_MAIL_FROM = process.env.MAIL_FROM || ''; // รองรับ: "Name <email@dom>" หรือ "email@dom"
const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';
/* ======================= HELPERS ======================= */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

function fileFromRelUrl(relUrl) {
  if (!relUrl || /^https?:\/\//i.test(relUrl)) return null;

  // normalize
  const raw = decodeURI(String(relUrl).trim());
  const cleaned = raw.replace(/^[\\/]+/, '').replace(/\\/g, '/'); // ตัด slash หน้าแรก + กันเคส Windows

  // ตัด prefix 'uploads/' หรือ '/uploads/' ให้เหลือส่วนหลัง
  const underUploads = cleaned.replace(/^uploads\//i, '');

  // กำหนดตำแหน่ง uploads ต้นทาง (ไม่ใช่ public/)
  const rootUploads = path.resolve(ROOT, UPLOADS_DIR);

  // candidate ที่เป็นไปได้
  const candidates = [
    // กรณีให้มาเป็น 'uploads/news/xxx.png' หรือ '/uploads/news/xxx.png'
    path.join(rootUploads, underUploads),
    // กันเคสที่ให้มาทั้งพาธอยู่แล้ว (เช่น 'uploads/news/xxx.png')
    path.resolve(ROOT, cleaned),
    // กันเคสเขียนพลาดเป็น 'public/uploads/...'
    path.resolve(ROOT, 'public', cleaned),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {}
  }

  if (EMAIL_DEBUG) {
    console.warn('[EMAIL] image file not found for', relUrl, 'tried:', candidates);
  }
  return null;
}
function buildSingleNewsEmail(req, news, message = '') {
  const attachments = [];
  let imgHtml = '';

  if (news.featured_image_url) {
    if (/^https?:\/\//i.test(news.featured_image_url)) {
      // เป็น URL สาธารณะ
      imgHtml = `
        <div style="margin:12px 0">
          <img src="${absUrl(req, news.featured_image_url)}"
               alt="${escapeHtml(news.title)}"
               style="max-width:100%;border-radius:8px;border:1px solid #eee"/>
        </div>`;
    } else {
      // เป็นไฟล์ในเครื่อง → แนบเป็น CID
      const absPath = fileFromRelUrl(news.featured_image_url);
      if (absPath) {
        const cid = `news-${news.news_id || 'item'}@inline`;
        attachments.push({ filename: path.basename(absPath), path: absPath, cid });
        imgHtml = `
          <div style="margin:12px 0">
            <img src="cid:${cid}" alt="${escapeHtml(news.title)}"
                 style="max-width:100%;border-radius:8px;border:1px solid #eee"/>
          </div>`;
      }
    }
  }

  const msg = message ? `<p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr/>` : '';

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;line-height:1.6;color:#111">
    ${msg}
    <h2 style="margin:0 0 6px 0">${escapeHtml(news.title)}</h2>
    <div style="color:#555;font-size:12px;margin-bottom:8px">
      หมวดหมู่: ${escapeHtml(news.category || 'ทั่วไป')} • อัปเดต: ${new Date(news.updated_at || news.created_at).toLocaleString('th-TH')}
    </div>
    ${imgHtml}
    <div>${escapeHtml(news.content)}</div>
    <hr style="margin-top:16px"/>
    <div style="color:#666;font-size:12px">อีเมลนี้ถูกส่งจากระบบข่าวประชาสัมพันธ์</div>
  </div>`;

  return { html, attachments };
}

function buildMultiNewsEmail(req, list = [], message = '') {
  const attachments = [];
  const msg = message ? `<p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr/>` : '';

  const itemsHtml = list.map((n, i) => {
    let img = '';
    if (n.featured_image_url) {
      if (/^https?:\/\//i.test(n.featured_image_url)) {
        img = `<img src="${absUrl(req, n.featured_image_url)}"
                    alt="${escapeHtml(n.title)}"
                    style="max-width:100%;border-radius:8px;border:1px solid #eee;margin-bottom:8px"/>`;
      } else {
        const absPath = fileFromRelUrl(n.featured_image_url);
        if (absPath) {
          const cid = `news-${n.news_id || i}@inline`;
          attachments.push({ filename: path.basename(absPath), path: absPath, cid });
          img = `<img src="cid:${cid}" alt="${escapeHtml(n.title)}"
                     style="max-width:100%;border-radius:8px;border:1px solid #eee;margin-bottom:8px"/>`;
        }
      }
    }
    return `
      <div style="margin:18px 0">
        <h3 style="margin:0 0 6px 0">${escapeHtml(n.title)}</h3>
        <div style="color:#555;font-size:12px;margin-bottom:8px">
          หมวดหมู่: ${escapeHtml(n.category || 'ทั่วไป')} • อัปเดต: ${new Date(n.updated_at || n.created_at).toLocaleString('th-TH')}
        </div>
        ${img}
        <div>${escapeHtml(n.content)}</div>
      </div>
      <hr/>`;
  }).join('');

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;line-height:1.6;color:#111">
    ${msg}
    ${itemsHtml || '<p>ไม่มีรายการข่าว</p>'}
    <div style="color:#666;font-size:12px;margin-top:12px">อีเมลนี้ถูกส่งจากระบบข่าวประชาสัมพันธ์</div>
  </div>`;

  return { html, attachments };
}




// ปิดบังอีเมลตอน log
const mask = (e = '') => String(e).replace(/(.{2}).*(@.*)/, '$1***$2');

// parse MAIL_FROM ให้ได้รูปแบบที่ nodemailer รับแน่ ๆ
function parseFrom(raw = RAW_MAIL_FROM) {
  const s = String(raw || '').trim();

  // case: "Name <email@dom>"
  const m = s.match(/^\s*([^<]+?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) {
    const name = m[1].trim().replace(/^"|"$/g, '');
    const address = m[2].trim();
    return { name, address };
  }

  // case: email เดี่ยว
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    return { address: s };
  }

  // fallback: บังคับให้ตั้งค่าใน .env
  const fallback = process.env.SMTP_USER && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.SMTP_USER)
    ? process.env.SMTP_USER
    : 'no-reply@example.com';

  if (EMAIL_DEBUG) {
    console.warn('[EMAIL] MAIL_FROM invalid, fallback to', fallback);
  }
  return { address: fallback };
}

// คืนค่า base URL โดยดู x-forwarded-* ด้วย (รองรับ reverse proxy)
function getBaseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}

// แปลงพาธสัมพัทธ์ให้เป็น absolute URL
function absUrl(req, maybeUrl) {
  if (!maybeUrl) return '';
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  const base = getBaseUrl(req);
  return `${base}${maybeUrl.startsWith('/') ? maybeUrl : `/${maybeUrl}`}`;
}

// อ่านรายชื่อผู้สมัครรับข่าวสาร จากตาราง newsletter_subscriptions
async function getSubscribers() {
  const [rows] = await pool.query('SELECT email FROM newsletter_subscriptions');
  const set = new Set(
    rows.map(r => (r.email || '').trim()).filter(v => v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
  );
  return [...set];
}

// เตรียม nodemailer transporter (Brevo: host=smtp-relay.brevo.com, user='apikey', pass=<api_key>)
async function getTransporter() {
  const host   = process.env.SMTP_HOST;
  const port   = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user   = process.env.SMTP_USER;
  const pass   = process.env.SMTP_PASS;
  const debug  = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,                 // 587 => false, 465 => true
    auth: { user, pass },
    logger: debug,
    debug,
    // ช่วยกรณี network แปลก ๆ
    requireTLS: !secure,
    tls: { minVersion: 'TLSv1.2' },
  });

  // ตรวจสอบก่อนส่งจริง
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP verified OK:', { host, port, secure, user });
  } catch (err) {
    console.error('❌ [EMAIL] verify failed:', err.message);
    throw err;
  }
  return transporter;
}
/* ======================= NEWS FETCHERS ======================= */

// ข่าวเดี่ยว (เฉพาะที่เผยแพร่แล้ว)
async function getPublishedNewsById(id) {
  const [rows] = await pool.query(
    `SELECT news_id, title, content, category, status, featured_image_url, created_at, updated_at
     FROM news WHERE news_id = ? AND status = 'published'`,
    [id]
  );
  return rows[0] || null;
}

// ข่าวหลายอัน (เฉพาะที่เผยแพร่แล้ว)
async function getPublishedNewsByIds(ids = []) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT news_id, title, content, category, status, featured_image_url, created_at, updated_at
     FROM news WHERE status = 'published' AND news_id IN (${placeholders})`,
    ids
  );
  const map = new Map(rows.map(r => [r.news_id, r]));
  return ids.map(id => map.get(id)).filter(Boolean);
}

/* ======================= EMAIL HTML ======================= */

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildSingleNewsHtml(req, news, message = '') {
  const img = news.featured_image_url
    ? `<div style="margin:12px 0">
         <img src="${absUrl(req, news.featured_image_url)}" alt="${escapeHtml(news.title)}" style="max-width:100%;border-radius:8px;border:1px solid #eee"/>
       </div>`
    : '';

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

/* ======================= SENDER CORE ======================= */

// ส่งหา subscriber ทั้งหมดแบบ “ทีละคน”
async function sendToAllSubscribers({ subject, html }) {
  const recipients = await getSubscribers();
  if (recipients.length === 0) {
    console.log('[EMAIL] no subscribers');
    return { total: 0, sent: 0, failed: 0, firstPreviewUrl: null };
  }

  const from = parseFrom();
  console.log('[EMAIL] preparing to send', {
    from: from.name ? `${from.name} <${mask(from.address)}>` : mask(from.address),
    subject,
    totalRecipients: recipients.length,
    sample: recipients.slice(0, 5).map(mask),
  });

  const transporter = await getTransporter();
  let sent = 0, failed = 0, firstPreviewUrl = null;

  for (const to of recipients) {
    try {
      if (EMAIL_DEBUG) {
        console.log('[EMAIL] sending →', { to: mask(to), subject });
      }

      const info = await transporter.sendMail({
        from,          // ← ใช้ object { name, address } หรือ { address }
        to,
        subject,
        html,
      });

      if (EMAIL_DEBUG) {
        console.log('[EMAIL] sent ✓', {
          to: mask(to),
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
        });
      }

      sent += 1;

      const preview = nodemailer.getTestMessageUrl(info); // มีเฉพาะ Ethereal
      if (!firstPreviewUrl && preview) {
        firstPreviewUrl = preview;
        console.log('[EMAIL] preview URL:', preview);
      }
    } catch (e) {
      failed += 1;
      console.error('[EMAIL] sent ✗', { to: mask(to), error: e.message });
    }
  }

  console.log('[EMAIL] summary', { total: recipients.length, sent, failed });
  return { total: recipients.length, sent, failed, firstPreviewUrl };
}

/* ======================= CONTROLLERS ======================= */

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

// ส่งข่าวเดี่ยว
// เดี่ยว
exports.broadcastNews = async (req, res) => {
  try {
    const id = Number(req.params.id ?? req.params.news_id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid_id' });

    const news = await getPublishedNewsById(id);
    if (!news) return res.status(404).json({ message: 'news_not_found_or_not_published' });

    const message = (req.body?.message || '').toString();
    const subject = `ข่าวประชาสัมพันธ์: ${news.title}`;
    const { html, attachments } = buildSingleNewsEmail(req, news, message);

    const transporter = await getTransporter();
    const recipients = await getSubscribers();
    let sent = 0, failed = 0;

    for (const to of recipients) {
      try {
        await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html, attachments });
        sent++;
      } catch {
        failed++;
      }
    }
    res.json({ ok: true, news_id: id, total: recipients.length, sent, failed });
  } catch (e) {
    console.error('[email] broadcastNews failed:', e);
    res.status(500).json({ message: 'broadcast_failed' });
  }
};

// หลายข่าว
exports.broadcastBulk = async (req, res) => {
  try {
    const ids = [...new Set((req.body?.news_ids || []).map(Number).filter(Number.isInteger))];
    if (ids.length === 0) return res.status(400).json({ message: 'news_ids_required' });

    const list = await getPublishedNewsByIds(ids);
    if (list.length === 0) return res.status(404).json({ message: 'no_published_news_found' });

    const message = (req.body?.message || '').toString();
    const subject = `ข่าวประชาสัมพันธ์ (${list.length} รายการ)`;
    const { html, attachments } = buildMultiNewsEmail(req, list, message);

    const transporter = await getTransporter();
    const recipients = await getSubscribers();
    let sent = 0, failed = 0;

    for (const to of recipients) {
      try {
        await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html, attachments });
        sent++;
      } catch {
        failed++;
      }
    }
    res.json({ ok: true, count: list.length, ids, total: recipients.length, sent, failed });
  } catch (e) {
    console.error('[email] broadcastBulk failed:', e);
    res.status(500).json({ message: 'broadcast_bulk_failed' });
  }
};

