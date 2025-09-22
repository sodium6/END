// src/controllers/portfolio/workController.js
const path = require("path");
const fs = require("fs");
const pool = require("../../../db/database");
const { uploadDir } = require("../../../middlewares/uploadPortfolioFiles");

// ---------- WORK ----------
const getWorkByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ดึงงานแบบ camelCase
    const [works] = await pool.query(
      `SELECT 
         id,
         user_id AS userId,
         job_title AS jobTitle,
         DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
         DATE_FORMAT(end_date, '%Y-%m-%d')   AS endDate,
         job_description AS jobDescription,
         portfolio_link AS portfolioLink,
         created_at AS createdAt
       FROM work_experiences
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );

    if (!works.length) return res.json([]);

    // ดึงไฟล์ทั้งหมดของงานที่ได้มาในครั้งเดียว
    const wkIds = works.map(w => w.id);
    const placeholders = wkIds.map(() => "?").join(",");
    const [files] = await pool.query(
      `SELECT id, wk_id AS wkId, user_id AS userId, file_path AS filePath
       FROM file_upload
       WHERE user_id = ? AND wk_id IN (${placeholders})
       ORDER BY id DESC`,
      [userId, ...wkIds]
    );

    // group ไฟล์ตาม wk_id
    const filesByWork = {};
    for (const f of files) {
      if (!filesByWork[f.wkId]) filesByWork[f.wkId] = [];
      filesByWork[f.wkId].push(f);
    }

    const data = works.map(w => ({
      ...w,
      files: filesByWork[w.id] || []
    }));

    res.json(data);
  } catch (err) {
    console.error("getWorkByUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addWork = async (req, res) => {
  try {
    const { jobTitle, startDate, endDate, jobDescription, portfolioLink } = req.body;
    const safeStart = startDate?.trim() ? startDate : null;
    const safeEnd   = endDate?.trim() ? endDate : null;

    const [result] = await pool.query(
      `INSERT INTO work_experiences 
       (user_id, job_title, start_date, end_date, job_description, portfolio_link) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.userId, jobTitle || null, safeStart, safeEnd, jobDescription || null, portfolioLink || null]
    );

    res.json({
      id: result.insertId,
      userId: Number(req.params.userId),
      jobTitle: jobTitle || "",
      startDate: safeStart,
      endDate: safeEnd,
      jobDescription: jobDescription || "",
      portfolioLink: portfolioLink || "",
      files: []
    });
  } catch (err) {
    console.error("addWork error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateWork = async (req, res) => {
  try {
    const { jobTitle, startDate, endDate, jobDescription, portfolioLink } = req.body;
    const safeStart = startDate?.trim() ? startDate : null;
    const safeEnd   = endDate?.trim() ? endDate : null;

    await pool.query(
      `UPDATE work_experiences 
       SET job_title=?, start_date=?, end_date=?, job_description=?, portfolio_link=? 
       WHERE id=?`,
      [jobTitle || null, safeStart, safeEnd, jobDescription || null, portfolioLink || null, req.params.id]
    );
    res.json({ message: "อัปเดตประสบการณ์สำเร็จ" });
  } catch (err) {
    console.error("updateWork error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    // ถ้าใส่ FK ON DELETE CASCADE แล้ว ไม่ต้องลบไฟล์เอง
    await pool.query("DELETE FROM work_experiences WHERE id=?", [id]);
    res.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    console.error("deleteWork error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- FILES (file_upload: id, wk_id, user_id, file_path, created_at) ----------
const uploadFiles = async (req, res) => {
  try {
    const { userId, workId } = req.params;
    if (!req.files?.length) return res.status(400).json({ message: "No files" });

    const created = [];
    for (const f of req.files) {
      const relPath = `/uploads/portfolio_image/${f.filename}`;
      const [result] = await pool.query(
        "INSERT INTO file_upload (wk_id, user_id, file_path) VALUES (?, ?, ?)",
        [workId, userId, relPath]
      );

      // ใช้ชื่อไฟล์ UTF-8 ที่ได้จาก multer (fallback ไปที่ originalname / basename)
      const displayName = f.originalnameUtf8 || f.originalname || path.basename(relPath);

      created.push({
        id: result.insertId,
        wkId: Number(workId),
        userId: Number(userId),
        filePath: relPath,
        name: displayName,      // 👈 FE ใช้แสดงชื่อไฟล์
        size: f.size || 0,      // 👈 FE ใช้ formatFileSize
        mimetype: f.mimetype,
        url: relPath,           // ถ้าเสิร์ฟ static ที่ /uploads แล้ว ใช้ได้เลย
      });
    }
    res.json({ files: created });
  } catch (e) {
    console.error("upload files error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ดึงไฟล์ตาม workId (map ให้มี name/size/url สำหรับ FE)
const listFilesByWork = async (req, res) => {
  try {
    const { userId, workId } = req.params;
    const [rows] = await pool.query(
      `SELECT id, wk_id AS wkId, user_id AS userId, file_path AS filePath
       FROM file_upload
       WHERE user_id=? AND wk_id=?
       ORDER BY id DESC`,
      [userId, workId]
    );

    const data = (rows || []).map((r) => ({
      ...r,
      name: path.basename(r.filePath), // ถ้าในตารางยังไม่มี original_name ให้ใช้ basename ไปก่อน
      size: 0,                         // ยังไม่ได้เก็บ size ใน DB
      url: r.filePath,
    }));

    res.json(data);
  } catch (e) {
    console.error("list files error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const [rows] = await pool.query("SELECT file_path FROM file_upload WHERE id=?", [fileId]);
    if (!rows.length) return res.status(404).json({ message: "file not found" });

    const rel = rows[0].file_path; // /uploads/portfolio_image/xxx.ext
    const abs = path.join(uploadDir, path.basename(rel));

    try {
      await fs.promises.unlink(abs);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }

    await pool.query("DELETE FROM file_upload WHERE id=?", [fileId]);
    res.json({ message: "deleted" });
  } catch (e) {
    console.error("delete file error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // work
  getWorkByUser,
  addWork,
  updateWork,
  deleteWork,
  // files
  uploadFiles,
  listFilesByWork,
  deleteFile,
};
