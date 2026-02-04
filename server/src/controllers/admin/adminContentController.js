// controllers/news.controller.js
const path = require('path');
const fs = require('fs');
const uploadImage = require('../../middlewares/uploadImage');
const pool = require('../../db/database');
const { sendNewsNotification } = require('./Email/emailController'); // Import notification helper

const ROOT = process.cwd();

/* ---------- helpers ---------- */
const getAdminId = (req) =>
  req.admin?.admin_id ?? req.admin?.id ?? req.user?.admin_id ?? req.user?.id ?? null;

function removeFileByRelativeUrl(relUrl) {
  if (!relUrl) return;
  const abs = path.join(ROOT, relUrl.replace(/^\//, ''));
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (e) {
    console.warn('[News] remove file failed:', e.message);
  }
}

const normStatus = (s) =>
  (s || 'draft').toString().trim().toLowerCase() === 'published' ? 'published' : 'draft';

const normCategory = (c) => {
  const v = (c || '').toString().trim();
  return v ? v.toLowerCase() : null;
};

const normImage = (u) => {
  const v = (u || '').toString().trim();
  return v || null;
};

/* ---------- CREATE ---------- */
exports.createNews = (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const adminId = getAdminId(req);
      if (!adminId) return res.status(400).json({ message: 'admin_id is required' });

      const {
        title = '',
        content = '',
        status = 'draft',
        category = null,
        category_id = null,
        featured_image_url,
        send_notification, // boolean or 'true'
      } = req.body;

      let imageRelUrl = normImage(featured_image_url);
      if (req.file) {
        // ชื่อ field ใน FE ต้องตรงกับที่ multer ตั้งไว้ (เช่น 'image')
        imageRelUrl = path.posix.join('/uploads/news', path.basename(req.file.path));
      }

      const sql =
        'INSERT INTO news (title, content, admin_id, status, category, category_id, featured_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [
        title,
        content,
        adminId,
        normStatus(status),
        normCategory(category),
        category_id || null,
        imageRelUrl,
      ];

      const [result] = await pool.execute(sql, params);
      const id = result.insertId;

      // Handle Notification
      if ((send_notification === true || String(send_notification) === 'true') && normStatus(status) === 'published') {
        // Send notification asynchronously
        sendNewsNotification(req, id).then(r => console.log(`[News] Notification sent for ${id}:`, r));
      }

      return res.status(201).json({
        message: 'Created',
        news_id: id,
        featured_image_url: imageRelUrl,
        featured_image_full: imageRelUrl ? `${req.protocol}://${req.get('host')}${imageRelUrl}` : null,
      });
    } catch (e) {
      if (e?.code === 'ER_NO_REFERENCED_ROW_2') {
        // FK admin_id ไม่ตรงตาราง admins
        return res.status(400).json({ message: 'admin_id does not exist in admins table' });
      }
      console.error('[News] create failed:', e);
      return res.status(500).json({ message: 'Create failed' });
    }
  });
};

/* ---------- UPDATE ---------- */
exports.updateNews = (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const { id } = req.params;

      const [rows] = await pool.execute('SELECT * FROM news WHERE news_id = ?', [id]);
      const existing = rows[0];
      if (!existing) return res.status(404).json({ message: 'Not found' });

      const {
        title = existing.title,
        content = existing.content,
        status = existing.status,
        category = existing.category,
        category_id = existing.category_id,
        featured_image_url = existing.featured_image_url,
        remove_featured_image, // '1' เมื่อต้องการลบรูป
        send_notification,
      } = req.body;

      console.log('[updateNews] file:', req.file);
      console.log('[updateNews] body:', req.body);

      let imageRelUrl = normImage(featured_image_url);

      if (remove_featured_image === '1') {
        removeFileByRelativeUrl(existing.featured_image_url);
        imageRelUrl = null;
      }

      if (req.file) {
        // อัปโหลดใหม่ -> ลบของเก่าแล้วใช้ไฟล์ใหม่
        console.log('[updateNews] New file received, removing old:', existing.featured_image_url);
        removeFileByRelativeUrl(existing.featured_image_url);
        imageRelUrl = path.posix.join('/uploads/news', path.basename(req.file.path));
        console.log('[updateNews] New imageRelUrl:', imageRelUrl);
      }

      const sql =
        'UPDATE news SET title = ?, content = ?, status = ?, category = ?, category_id = ?, featured_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE news_id = ?';
      const params = [
        title,
        content,
        normStatus(status),
        normCategory(category),
        category_id || null,
        imageRelUrl,
        id,
      ];

      await pool.execute(sql, params);

      // Handle Notification
      if ((send_notification === true || String(send_notification) === 'true') && normStatus(status) === 'published') {
        sendNewsNotification(req, id).then(r => console.log(`[News] Notification sent for ${id}:`, r));
      }

      return res.json({
        message: 'Updated',
        featured_image_url: imageRelUrl,
        featured_image_full: imageRelUrl ? `${req.protocol}://${req.get('host')}${imageRelUrl}` : null,
      });
    } catch (e) {
      console.error('[News] update failed:', e);
      return res.status(500).json({ message: 'Update failed' });
    }
  });
};

/* ---------- GET LIST ---------- */

// controllers/news.controller.js - getAllNews (MySQL / mysql2)
exports.getAllNews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const offset = (page - 1) * pageSize;

    const qRaw = (req.query.q || '').trim();
    const qLower = qRaw.toLowerCase();
    const category = (req.query.category || '').trim().toLowerCase();
    const exclude = (req.query.excludeCategory || '').trim().toLowerCase();
    const statusFilter = (req.query.status || '').trim().toLowerCase();
    const dateFromRaw = (req.query.dateFrom || '').trim(); // 'YYYY-MM-DD' หรือ 'DD/MM/YYYY(พ.ศ./ค.ศ.)'
    const dateToRaw = (req.query.dateTo || '').trim();
    const categoryId = req.query.categoryId; // New filter

    const where = [];
    const params = [];

    // helper: แปลง DD/MM/YYYY (พ.ศ./ค.ศ.) -> YYYY-MM-DD
    const toISO = (s) => {
      if (!s) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // ISO แล้ว
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!m) return null;
      let [_, d, mo, y] = m;
      d = d.padStart(2, '0'); mo = mo.padStart(2, '0');
      let year = Number(y);
      if (year > 2400) year -= 543; // พ.ศ. -> ค.ศ.
      return `${year}-${mo}-${d}`;
    };

    // map คำค้นไทย/อังกฤษ -> status ที่เก็บใน DB
    const mapStatusKeyword = (kw) => {
      if (!kw) return null;
      if (kw.includes('เผยแพร่')) return 'published';
      if (kw.includes('ร่าง')) return 'draft';
      if (kw.includes('published')) return 'published';
      if (kw.includes('draft')) return 'draft';
      return null;
    };

    // ค้นหารวม: title / status / วันที่ (รองรับ DD/MM/YYYY และ YYYY-MM-DD)
    if (qRaw) {
      params.push(`%${qRaw}%`);    // title LIKE
      params.push(`%${qLower}%`);  // LOWER(status) LIKE
      params.push(`%${qRaw}%`);    // DATE_FORMAT(created_at, '%d/%m/%Y') LIKE
      params.push(`%${qRaw}%`);    // DATE_FORMAT(created_at, '%Y-%m-%d') LIKE

      const orParts = [
        `n.title LIKE ?`,
        `LOWER(n.status) LIKE ?`,
        `DATE_FORMAT(n.created_at, '%d/%m/%Y') LIKE ?`,
        `DATE_FORMAT(n.created_at, '%Y-%m-%d') LIKE ?`,
      ];

      // ถ้าคีย์เวิร์ดเป็นสถานะที่รู้จัก ให้เทียบเท่ากับด้วย (แม่นกว่า LIKE)
      const mappedStatus = mapStatusKeyword(qLower);
      if (mappedStatus) {
        orParts.push(`LOWER(n.status) = ?`);
        params.push(mappedStatus);
      }

      // ถ้าคีย์เวิร์ดเป็นวันที่จริง ให้เทียบเท่ากับวันด้วย (แม่นกว่า LIKE)
      const qISO = toISO(qRaw);
      if (qISO) {
        orParts.push(`DATE(n.created_at) = ?`);
        params.push(qISO);
      }

      where.push(`(${orParts.join(' OR ')})`);
    }

    // ฟิลเตอร์สถานะตรง ๆ (เช่น ?status=published)
    if (statusFilter) {
      where.push(`LOWER(n.status) = ?`);
      params.push(statusFilter);
    }

    // ฟิลเตอร์ช่วงวันที่สร้าง
    const dateFromISO = toISO(dateFromRaw);
    const dateToISO = toISO(dateToRaw);
    if (dateFromISO) { where.push(`DATE(n.created_at) >= ?`); params.push(dateFromISO); }
    if (dateToISO) { where.push(`DATE(n.created_at) <= ?`); params.push(dateToISO); }

    // ฟิลเตอร์หมวดหมู่/ตัดหมวดหมู่
    if (categoryId) {
      where.push(`n.category_id = ?`);
      params.push(categoryId);
    } else if (category) {
      where.push(`(LOWER(n.category) = ? OR LOWER(nc.name) = ?)`);
      params.push(category, category);
    }

    if (exclude) {
      where.push(`((n.category IS NULL OR LOWER(n.category) <> ?) AND (nc.name IS NULL OR LOWER(nc.name) <> ?))`);
      params.push(exclude, exclude);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // NOTE: LIMIT/OFFSET ต้องฝังค่า (ใช้ค่าที่ sanitize แล้ว)
    const dataSql = `
      SELECT n.*, nc.name as category_name
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.category_id
      ${whereSql}
      ORDER BY n.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    const countSql = `
        SELECT COUNT(*) AS total 
        FROM news n 
        LEFT JOIN news_categories nc ON n.category_id = nc.category_id
        ${whereSql}
    `;

    const [rows] = await pool.execute(dataSql, params);
    const [[{ total }]] = await pool.execute(countSql, params);

    res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error('[News] fetch list failed:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};



/* ---------- GET ONE ---------- */
exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
        SELECT n.*, nc.name as category_name 
        FROM news n 
        LEFT JOIN news_categories nc ON n.category_id = nc.category_id
        WHERE n.news_id = ?
    `, [req.params.id]);
    const news = rows[0];
    if (!news) return res.status(404).json({ message: 'Not found' });

    const featured_image_full = news.featured_image_url
      ? `${req.protocol}://${req.get('host')}${news.featured_image_url}`
      : null;

    return res.json({ news: { ...news, featured_image_full } });
  } catch (e) {
    console.error('[News] fetch one failed:', e);
    return res.status(500).json({ message: 'Fetch failed' });
  }
};

/* ---------- DELETE ---------- */
exports.deleteNews = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM news WHERE news_id = ?', [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ message: 'Not found' });

    removeFileByRelativeUrl(existing.featured_image_url);
    await pool.execute('DELETE FROM news WHERE news_id = ?', [req.params.id]);

    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('[News] delete failed:', e);
    return res.status(500).json({ message: 'Delete failed' });
  }
};

