// // controllers/user/certificates/certificatesController.js
// const path = require('path');
// const fs = require('fs');
// const pool = require('../../../db/database');

// const ROOT = process.cwd();
// function getUserId(req) {
//   // ปรับให้อ่านจาก JWT เท่านั้น (ถ้าไม่มี = 401)
//   return req.user?.user_id ?? req.user?.id ?? null;
// }
// function getBaseUrl(req) {
//   const proto = req.get('x-forwarded-proto') || req.protocol;
//   const host  = req.get('x-forwarded-host') || req.get('host');
//   return `${proto}://${host}`;
// }
// function absUrl(req, rel) {
//   if (!rel) return null;
//   if (/^https?:\/\//i.test(rel)) return rel;
//   return `${getBaseUrl(req)}${rel.startsWith('/') ? rel : `/${rel}`}`;
// }
// function removeFile(rel) {
//   if (!rel) return;
//   try {
//     const abs = path.join(ROOT, rel.replace(/^\//, ''));
//     if (fs.existsSync(abs)) fs.unlinkSync(abs);
//   } catch (e) {
//     console.warn('[cert] remove file failed:', e.message);
//   }
// }

// /* ---------- CREATE ---------- */
// async function createCertificate(req, res) {
//   try {
//     const userId = req.user?.id;                    // ← จาก token เท่านั้น
//     if (!userId) return res.status(401).json({ message: 'unauthorized' });
//     if (!req.file) return res.status(400).json({ message: 'file_required' });

//     const { title = '', description = '' } = req.body;
//     const fileRel = path.posix.join('/uploads/certificates', path.basename(req.file.path));

//     const [result] = await pool.execute(
//       `INSERT INTO certificates (user_id, title, description, file_url)
//        VALUES (?, ?, ?, ?)`,
//       [userId, title, description, fileRel]
//     );

//     res.status(201).json({
//       message: 'created',
//       cer_id: result.insertId,
//       user_id: userId,
//       title, description,
//       file_url: fileRel,
//       file_full: absUrl(req, fileRel),
//     });
//   } catch (e) {
//     console.error('[cert] create failed:', e);
//     res.status(500).json({ message: 'create_failed' });
//   }
// }

// /* ---------- UPDATE ---------- */
// async function updateCertificate(req, res) {
//   try {
//     const userId = req.user?.id;                    // ← บังคับมี
//     if (!userId) return res.status(401).json({ message: 'unauthorized' });

//     const cerId = Number(req.params.id);
//     if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

//     const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
//     const existing = rows[0];
//     if (!existing) return res.status(404).json({ message: 'not_found' });
//     if (existing.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

//     const {
//       title = existing.title,
//       description = existing.description,
//       remove_file,
//     } = req.body;

//     let fileRel = existing.file_url;

//     if (remove_file === '1') {
//       removeFile(existing.file_url);
//       fileRel = '';
//     }

//     if (req.file) {
//       removeFile(existing.file_url);
//       fileRel = path.posix.join('/uploads/certificates', path.basename(req.file.path));
//     }

//     await pool.execute(
//       `UPDATE certificates SET title=?, description=?, file_url=? WHERE cer_id=?`,
//       [title, description, fileRel, cerId]
//     );

//     res.json({
//       message: 'updated',
//       cer_id: cerId,
//       title, description,
//       file_url: fileRel,
//       file_full: fileRel ? absUrl(req, fileRel) : null,
//     });
//   } catch (e) {
//     console.error('[cert] update failed:', e);
//     res.status(500).json({ message: 'update_failed' });
//   }
// }

// /* ---------- DELETE ---------- */
// async function deleteCertificate(req, res) {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: 'unauthorized' });

//     const cerId = Number(req.params.id);
//     if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

//     const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
//     const existing = rows[0];
//     if (!existing) return res.status(404).json({ message: 'not_found' });
//     if (existing.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

//     removeFile(existing.file_url);
//     await pool.execute('DELETE FROM certificates WHERE cer_id = ?', [cerId]);

//     res.json({ message: 'deleted' });
//   } catch (e) {
//     console.error('[cert] delete failed:', e);
//     res.status(500).json({ message: 'delete_failed' });
//   }
// }

// /* ---------- GET ONE ---------- */
// async function getCertificateById(req, res) {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: 'unauthorized' });

//     const cerId = Number(req.params.id);
//     if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

//     const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
//     const c = rows[0];
//     if (!c) return res.status(404).json({ message: 'not_found' });
//     if (c.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

//     res.json({ certificate: { ...c, file_full: absUrl(req, c.file_url) } });
//   } catch (e) {
//     console.error('[cert] get one failed:', e);
//     res.status(500).json({ message: 'fetch_failed' });
//   }
// }






// async function listMyCertificates(req, res) {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     // paging ที่ปลอดภัย
//     const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//     const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page, 10) || 10));
//     const offset = (page - 1) * perPage;

//     // filter เสริม (ถ้าอยากค้นหา)
//     const q = (req.query.q || '').trim();

//     const where = ['user_id = ?'];
//     const params = [userId];

//     if (q) {
//       where.push('(title LIKE ? OR description LIKE ?)');
//       params.push(`%${q}%`, `%${q}%`);
//     }

//     const whereSql = `WHERE ${where.join(' AND ')}`;

//     // นับจำนวนทั้งหมด (ใช้ params ได้)
//     const [cntRows] = await pool.execute(
//       `SELECT COUNT(*) AS total FROM certificates ${whereSql}`,
//       params
//     );
//     const total = cntRows[0]?.total ?? 0;

//     // ดึงรายการ — ฝังเลข page/perPage ลง SQL โดยตรง (ห้ามใช้ ? ตรงนี้)
//     // หมายเหตุ: ใช้ชื่อคอลัมน์ให้ตรงกับตารางจริง หากคอลัมน์คุณชื่อ created_at ให้เปลี่ยนตรงนี้
//     const listSql = `
//       SELECT cer_id, user_id, title, description, file_url, create_at
//       FROM certificates
//       ${whereSql}
//       ORDER BY create_at DESC
//       LIMIT ${perPage} OFFSET ${offset}
//     `;
//     const [rows] = await pool.execute(listSql, params);

//     return res.json({
//       data: rows,
//       meta: {
//         page,
//         per_page: perPage,
//         total,
//         total_pages: Math.ceil(total / perPage),
//       },
//     });
//   } catch (e) {
//     console.error('[cert] list failed:', e);
//     return res.status(500).json({ message: 'server_error' });
//   }
// };



// /* ---------- VIEW FILE (redirect) ---------- */
// async function viewCertificateFile(req, res) {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: 'unauthorized' });

//     const cerId = Number(req.params.id);
//     if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

//     const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
//     const c = rows[0];
//     if (!c || !c.file_url) return res.status(404).json({ message: 'file_not_found' });
//     if (c.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

//     return res.redirect(302, c.file_url);
//   } catch (e) {
//     console.error('[cert] view failed:', e);
//     res.status(500).json({ message: 'view_failed' });
//   }
// }

// module.exports = {
//   createCertificate,
//   updateCertificate,
//   deleteCertificate,
//   getCertificateById,
//   listMyCertificates,
//   viewCertificateFile,
// };
// controllers/user/certificates/certificatesController.js
const path = require('path');
const fs = require('fs');
const pool = require('../../../db/database');

const ROOT = process.cwd();

function getUserId(req) {
  return req.user?.user_id ?? req.user?.id ?? null;
}
function getBaseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host  = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}
function absUrl(req, rel) {
  if (!rel) return null;
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${getBaseUrl(req)}${rel.startsWith('/') ? rel : `/${rel}`}`;
}
function removeFile(rel) {
  if (!rel) return;
  try {
    const abs = path.join(ROOT, rel.replace(/^\//, ''));
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (e) {
    console.warn('[cert] remove file failed:', e.message);
  }
}

/* ---------- CREATE ---------- */
async function createCertificate(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'file_required' });

    const { title = '', description = '' } = req.body;
    const fileRel = path.posix.join('/uploads/certificates', path.basename(req.file.path));

    const [result] = await pool.execute(
      `INSERT INTO certificates (user_id, title, description, file_url)
       VALUES (?, ?, ?, ?)`,
      [userId, title, description, fileRel]
    );

    res.status(201).json({
      message: 'created',
      cer_id: result.insertId,
      user_id: userId,
      title,
      description,
      file_url: fileRel,
      file_full: absUrl(req, fileRel),
    });
  } catch (e) {
    console.error('[cert] create failed:', e);
    res.status(500).json({ message: 'create_failed' });
  }
}

/* ---------- UPDATE ---------- */
async function updateCertificate(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'unauthorized' });

    const cerId = Number(req.params.id);
    if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

    const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ message: 'not_found' });
    if (existing.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

    const { title = existing.title, description = existing.description, remove_file } = req.body;

    let fileRel = existing.file_url;

    if (remove_file === '1') {
      removeFile(existing.file_url);
      fileRel = '';
    }

    if (req.file) {
      removeFile(existing.file_url);
      fileRel = path.posix.join('/uploads/certificates', path.basename(req.file.path));
    }

    await pool.execute(
      `UPDATE certificates SET title=?, description=?, file_url=? WHERE cer_id=?`,
      [title, description, fileRel, cerId]
    );

    res.json({
      message: 'updated',
      cer_id: cerId,
      title,
      description,
      file_url: fileRel,
      file_full: fileRel ? absUrl(req, fileRel) : null,
    });
  } catch (e) {
    console.error('[cert] update failed:', e);
    res.status(500).json({ message: 'update_failed' });
  }
}

/* ---------- DELETE ---------- */
async function deleteCertificate(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'unauthorized' });

    const cerId = Number(req.params.id);
    if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

    const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ message: 'not_found' });
    if (existing.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

    removeFile(existing.file_url);
    await pool.execute('DELETE FROM certificates WHERE cer_id = ?', [cerId]);

    res.json({ message: 'deleted' });
  } catch (e) {
    console.error('[cert] delete failed:', e);
    res.status(500).json({ message: 'delete_failed' });
  }
}

/* ---------- GET ONE ---------- */
async function getCertificateById(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'unauthorized' });

    const cerId = Number(req.params.id);
    if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

    const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
    const c = rows[0];
    if (!c) return res.status(404).json({ message: 'not_found' });
    if (c.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

    res.json({ certificate: { ...c, file_full: absUrl(req, c.file_url) } });
  } catch (e) {
    console.error('[cert] get one failed:', e);
    res.status(500).json({ message: 'fetch_failed' });
  }
}

/* ---------- LIST (My certificates) ---------- */
async function listMyCertificates(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page    = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page, 10) || 10));
    const offset  = (page - 1) * perPage;

    const q = (req.query.q || '').trim();

    const where  = ['user_id = ?'];
    const params = [userId];

    if (q) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [cntRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM certificates ${whereSql}`,
      params
    );
    const total = cntRows[0]?.total ?? 0;

    const listSql = `
      SELECT cer_id, user_id, title, description, file_url, create_at
      FROM certificates
      ${whereSql}
      ORDER BY create_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(listSql, params);

    // ✅ แนบ URL เต็มของไฟล์ให้ทุกแถว
    const data = rows.map(r => ({ ...r, file_full: absUrl(req, r.file_url) }));

    return res.json({
      data,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (e) {
    console.error('[cert] list failed:', e);
    return res.status(500).json({ message: 'server_error' });
  }
}

/* ---------- VIEW FILE (redirect) ---------- */
async function viewCertificateFile(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'unauthorized' });

    const cerId = Number(req.params.id);
    if (!Number.isInteger(cerId)) return res.status(400).json({ message: 'invalid_id' });

    const [rows] = await pool.execute('SELECT * FROM certificates WHERE cer_id = ?', [cerId]);
    const c = rows[0];
    if (!c || !c.file_url) return res.status(404).json({ message: 'file_not_found' });
    if (c.user_id !== userId) return res.status(403).json({ message: 'forbidden' });

    // ใช้ absolute URL กันปัญหา redirect แบบ relative
    return res.redirect(302, absUrl(req, c.file_url));
  } catch (e) {
    console.error('[cert] view failed:', e);
    res.status(500).json({ message: 'view_failed' });
  }
}

module.exports = {
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateById,
  listMyCertificates,
  viewCertificateFile,
};
