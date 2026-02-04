// controllers/news.controller.js
const pool = require("../../../db/database");

// ป้องกัน sort column แปลก ๆ
const SORTABLE = new Set(["created_at", "updated_at", "title", "news_id"]);

// แปลง url สัมพัทธ์ -> absolute (ใช้ host ปัจจุบัน)
const toFullUrl = (req, maybeUrl) => {
  if (!maybeUrl) return null;
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  return `${req.protocol}://${req.get("host")}${maybeUrl}`;
};

exports.listNews = async (req, res) => {
  try {
    const {
      q,
      status,
      category,
      sort = "-created_at",
      page = 1,
      per_page = 10,
      include_admin, // ถ้าอยากส่ง admin_id กลับด้วยให้ใส่ ?include_admin=1
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(per_page, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * perPage;

    // WHERE + params
    const where = [];
    const params = [];

    if (status) { where.push("status = ?"); params.push(status); }
    if (category) { where.push("category = ?"); params.push(category); }
    if (q) {
      where.push("(title LIKE ? OR content LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    // sort
    const baseCol = sort.replace(/^-/, "");
    const col = SORTABLE.has(baseCol) ? baseCol : "created_at";
    const dir = sort.startsWith("-") ? "DESC" : "ASC";

    // count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM news ${whereSql}`,
      params
    );

    // data
    const [rows] = await pool.query(
      `
      SELECT n.news_id, n.title, n.content, n.admin_id, n.status, n.category,
             n.featured_image_url, n.created_at, n.updated_at,
             nc.name AS category_name
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.category_id
      ${whereSql}
      ORDER BY ${col} ${dir}
      LIMIT ? OFFSET ?
      `,
      [...params, perPage, offset]
    );

    const sendAdmin = String(include_admin) === "1";

    const data = rows.map((r) => ({
      id: r.news_id,
      title: r.title,
      content: r.content,
      category: r.category_name || r.category, // Prefer category_name
      status: r.status,
      featured_image_url: r.featured_image_url,
      featured_image_full: toFullUrl(res.req, r.featured_image_url), // ✅ absolute
      ...(sendAdmin ? { admin_id: r.admin_id } : {}),                // ✅ ส่งเมื่อขอเท่านั้น
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    res.json({
      data,
      meta: {
        page: pageNum,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
        sort,
        filters: { q: q || null, status: status || null, category: category || null },
      },
    });
  } catch (err) {
    console.error("[news:list] error:", err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.getNews = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid_id" });

    const [rows] = await pool.query(
      `
      SELECT n.news_id, n.title, n.content, n.admin_id, n.status, n.category,
             n.featured_image_url, n.created_at, n.updated_at,
             nc.name AS category_name
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.category_id
      WHERE n.news_id = ?
      `,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "not_found" });

    const r = rows[0];
    res.json({
      id: r.news_id,
      title: r.title,
      content: r.content,
      category: r.category_name || r.category, // Prefer category_name
      status: r.status,
      featured_image_url: r.featured_image_url,
      featured_image_full: toFullUrl(res.req, r.featured_image_url), // ✅ absolute
      // เลือกส่ง admin_id เฉพาะภายในระบบแอดมิน/ endpoint ส่วนตัว
      // admin_id: r.admin_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
    });
  } catch (err) {
    console.error("[news:get] error:", err);
    res.status(500).json({ error: "server_error" });
  }
};


// ตรวจรูปแบบอีเมลแบบง่าย
const isValidEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

/**
 * POST /api/newsletter/subscribe
 * body: { email: string }
 * เก็บเฉพาะ email
 */
exports.subscribe = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    if (!emailRaw || !isValidEmail(emailRaw)) {
      return res.status(400).json({ message: "invalid_email" });
    }
    const email = String(emailRaw).trim().toLowerCase();

    // พยายาม insert; ถ้าซ้ำให้ตอบแบบ idempotent
    try {
      await pool.execute(
        "INSERT INTO newsletter_subscriptions (email) VALUES (?)",
        [email]
      );
      return res.status(201).json({ message: "subscribed" });
    } catch (e) {
      if (e?.code === "ER_DUP_ENTRY") {
        // ลงทะเบียนไว้แล้ว — ถือว่าสำเร็จเหมือนเดิม
        return res.status(200).json({ message: "already_subscribed" });
      }
      throw e;
    }
  } catch (e) {
    console.error("[newsletter] subscribe failed:", e);
    return res.status(500).json({ message: "server_error" });
  }
};

/**
 * (ทางเลือก) ยกเลิกสมัคร
 * POST /api/newsletter/unsubscribe
 * body: { email }
 */
exports.unsubscribe = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    if (!emailRaw || !isValidEmail(emailRaw)) {
      return res.status(400).json({ message: "invalid_email" });
    }
    const email = String(emailRaw).trim().toLowerCase();

    const [result] = await pool.execute(
      "DELETE FROM newsletter_subscriptions WHERE email = ?",
      [email]
    );
    if (result.affectedRows > 0) {
      return res.json({ message: "unsubscribed" });
    }
    return res.status(404).json({ message: "not_found" });
  } catch (e) {
    console.error("[newsletter] unsubscribe failed:", e);
    return res.status(500).json({ message: "server_error" });
  }
};

/**
 * (ทางเลือก/แอดมิน) list subscribers แบบง่าย
 * GET /api/admin/newsletter/subscribers?page=1&per_page=20
 */
exports.listSubscribers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 20, 1), 200);
    const offset = (page - 1) * perPage;

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM newsletter_subscriptions"
    );
    const [rows] = await pool.query(
      "SELECT id, email, created_at FROM newsletter_subscriptions ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [perPage, offset]
    );

    res.json({
      data: rows,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (e) {
    console.error("[newsletter] list failed:", e);
    res.status(500).json({ message: "server_error" });
  }
};















const { sendMail } = require("../../../utils/mailer");

// ช่วยตัดเป็นก้อนๆ เวลาส่ง
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// เทมเพลต HTML ของอีเมลข่าว
function buildNewsHTML(news) {
  const img = news.featured_image_url
    ? `${process.env.PUBLIC_BASE_URL || ''}${news.featured_image_url}`
    : null;

  return `
  <div style="font-family:Arial, sans-serif; line-height:1.6; color:#111">
    <h2 style="margin:0 0 12px">${news.title || '(ไม่มีหัวข้อ)'}</h2>
    <p style="color:#666;margin:0 0 16px">
      หมวดหมู่: ${news.category || 'ทั่วไป'} • วันที่: ${new Date(news.created_at).toLocaleString('th-TH')}
    </p>
    ${img ? `<img src="${img}" style="max-width:100%;border-radius:8px;margin:0 0 16px"/>` : ''}
    <div style="white-space:pre-line">${(news.content || '').replace(/</g, '&lt;')}</div>
  </div>
  `;
}

/**
 * POST /api/admin/news/:id/broadcast
 * ส่งข่าวชิ้นนี้ให้ “ผู้สมัครรับข่าวสารทั้งหมด” ในตาราง newsletter_subscriptions
 */
exports.broadcastNews = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid_id' });

    // ดึงข้อมูลข่าว
    const [nRows] = await pool.query('SELECT * FROM news WHERE news_id = ?', [id]);
    const news = nRows[0];
    if (!news) return res.status(404).json({ message: 'not_found' });

    // (ถ้าต้องการจะส่งเฉพาะ published)
    // if (news.status !== 'published') return res.status(400).json({ message: 'news_not_published' });

    // ดึงอีเมลผู้สมัครทั้งหมด
    const [subs] = await pool.query('SELECT email FROM newsletter_subscriptions');
    if (subs.length === 0) return res.json({ message: 'no_subscribers', sent: 0 });

    const subject = `[PR] ${news.title || 'ข่าวประชาสัมพันธ์'}`;
    const html = buildNewsHTML(news);

    // ส่งเป็นชุดทาง BCC (ประหยัดจำนวนครั้ง; เหมาะกับ SMTP ฟรี)
    const batches = chunk(subs.map(s => s.email), 50); // 50 ต่อชุด
    let sent = 0, failed = 0;

    for (const b of batches) {
      try {
        await sendMail({ bcc: b, subject, html });
        sent += b.length;
      } catch (e) {
        failed += b.length;
        console.error('[broadcast] batch failed:', e.message);
      }
    }

    return res.json({ message: 'broadcast_done', total: subs.length, sent, failed });
  } catch (e) {
    console.error('[broadcast] failed:', e);
    res.status(500).json({ message: 'broadcast_failed' });
  }
};