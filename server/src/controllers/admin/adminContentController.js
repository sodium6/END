// controllers/news.controller.js
const path = require('path');
const fs = require('fs');
const uploadImage = require('../../middlewares/uploadImage');
const pool = require('../../db/database');

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
        featured_image_url,
      } = req.body;

      let imageRelUrl = normImage(featured_image_url);
      if (req.file) {
        // ชื่อ field ใน FE ต้องตรงกับที่ multer ตั้งไว้ (เช่น 'image')
        imageRelUrl = path.posix.join('/uploads/news', path.basename(req.file.path));
      }

      const sql =
        'INSERT INTO news (title, content, admin_id, status, category, featured_image_url) VALUES (?, ?, ?, ?, ?, ?)';
      const params = [
        title,
        content,
        adminId,
        normStatus(status),
        normCategory(category),
        imageRelUrl,
      ];

      const [result] = await pool.execute(sql, params);
      const id = result.insertId;

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
        featured_image_url = existing.featured_image_url,
        remove_featured_image, // '1' เมื่อต้องการลบรูป
      } = req.body;

      let imageRelUrl = normImage(featured_image_url);

      if (remove_featured_image === '1') {
        removeFileByRelativeUrl(existing.featured_image_url);
        imageRelUrl = null;
      }

      if (req.file) {
        // อัปโหลดใหม่ -> ลบของเก่าแล้วใช้ไฟล์ใหม่
        removeFileByRelativeUrl(existing.featured_image_url);
        imageRelUrl = path.posix.join('/uploads/news', path.basename(req.file.path));
      }

      const sql =
        'UPDATE news SET title = ?, content = ?, status = ?, category = ?, featured_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE news_id = ?';
      const params = [
        title,
        content,
        normStatus(status),
        normCategory(category),
        imageRelUrl,
        id,
      ];

      await pool.execute(sql, params);

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
exports.getAllNews = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const offset   = (page - 1) * pageSize;

    const q        = (req.query.q || '').trim();
    const category = (req.query.category || '').trim().toLowerCase();
    const exclude  = (req.query.excludeCategory || '').trim().toLowerCase();

    const where = [];
    const params = [];

    if (q) {
      where.push('title LIKE ?');
      params.push(`%${q}%`);
    }
    if (category) {
      where.push('LOWER(category) = ?');
      params.push(category);
    }
    if (exclude) {
      where.push('(category IS NULL OR LOWER(category) <> ?)');
      params.push(exclude);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // อย่าใช้ placeholder กับ LIMIT/OFFSET -> ใช้ค่าที่ sanitize แล้วฝังลง SQL
    const dataSql  = `SELECT * FROM news ${whereSql} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
    const countSql = `SELECT COUNT(*) AS total FROM news ${whereSql}`;

    const [rows]        = await pool.execute(dataSql, params);
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
    const [rows] = await pool.execute('SELECT * FROM news WHERE news_id = ?', [req.params.id]);
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
