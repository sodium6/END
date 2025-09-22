const pool = require("../../../db/database");

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { uploadDir } = require("../../../middlewares/uploadPortfolioFiles");

// === ค่าคงที่โฟลเดอร์เก็บไฟล์ ===
// URL ที่ FE จะเรียก:   <API_BASE>/uploads/activity_image/xxxx.jpg
// พาธบนดิสก์:         ./uploads/activity_image/xxxx.jpg



const getActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        name,
        type,
        CASE 
          WHEN start_date IS NULL THEN NULL
          ELSE DATE_FORMAT(start_date, '%Y-%m-%d')
        END AS startDate,
        CASE 
          WHEN end_date IS NULL THEN NULL
          ELSE DATE_FORMAT(end_date, '%Y-%m-%d')
        END AS endDate,
        description
      FROM activities
      WHERE user_id = ?
      `,
      [req.params.userId]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('getActivities error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




const addActivity = async (req, res) => {
  try {
    const { name, type, startDate, endDate, description } = req.body;

    const safeStartDate = startDate && startDate.trim() !== "" ? startDate : null;
    const safeEndDate = endDate && endDate.trim() !== "" ? endDate : null;

    const [result] = await pool.query(
      `INSERT INTO activities 
        (user_id, name, type, start_date, end_date, description) 
        VALUES (?,?,?,?,?,?)`,
      [req.params.userId, name || null, type || null, safeStartDate, safeEndDate, description || null]
    );

    res.json({
      id: result.insertId, // ✅ ได้ id จริงจาก DB
      user_id: req.params.userId,
      name,
      type,
      startDate: safeStartDate,
      endDate: safeEndDate,
      description,
    });
  } catch (err) {
    console.error("addActivity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { name, type, startDate, endDate, description } = req.body;

    const safeStartDate = startDate && startDate.trim() !== "" ? startDate : null;
    const safeEndDate = endDate && endDate.trim() !== "" ? endDate : null;

    await pool.query(
      `UPDATE activities 
       SET name=?, type=?, start_date=?, end_date=?, description=? 
       WHERE id=? AND user_id=?`,
      [name || null, type || null, safeStartDate, safeEndDate, description || null, req.params.id, req.params.userId]
    );

    res.json({ message: "แก้ไขกิจกรรมสำเร็จ" });
  } catch (err) {
    console.error("updateActivity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteActivity = async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "DELETE FROM activities WHERE id=?",
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบกิจกรรม" });
      }
      res.json({ message: "ลบกิจกรรมสำเร็จ" });
    } catch (err) {
      console.error("deleteActivity error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // === 1) อัปโหลดรูปกิจกรรม ===
  const uploadActivityImages = async (req, res) => {
    try {
      const userId = req.params.userId;
      const activityId = req.params.activityId;
      const files = req.files || [];
      if (!files.length) return res.status(400).json({ message: "no files" });
  
      const saved = [];
      for (const f of files) {
        // ใช้โฟลเดอร์เดียวกับ work
        const relPath = `/uploads/portfolio_image/${f.filename}`;
  
        const [r] = await pool.query(
          `INSERT INTO activity_upload (activity_id, user_id, image_path) VALUES (?,?,?)`,
          [activityId, userId, relPath]
        );
  
        // ชื่อไฟล์เดิมแปลงเป็น UTF-8 ถ้า router ทำให้แล้ว จะอยู่ใน f.originalname อยู่แล้ว
        const originalUtf8 = f.originalname;
  
        saved.push({
          id: r.insertId,
          filePath: relPath,
          originalName: originalUtf8,
          sizeBytes: f.size,
        });
      }
      res.json({ files: saved });
    } catch (err) {
      console.error("uploadActivityImages error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // === 2) ดึงรายการรูปของกิจกรรม ===
  const listActivityImages = async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, image_path AS filePath
         FROM activity_upload
         WHERE user_id=? AND activity_id=?`,
        [req.params.userId, req.params.activityId]
      );
  
      const files = (rows || []).map((r) => ({
        id: r.id,
        filePath: r.filePath,
        originalName: decodeURIComponent((r.filePath || "").split("/").pop() || "image"),
        sizeBytes: null,
      }));
      res.json(files);
    } catch (err) {
      console.error("listActivityImages error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // === 3) ลบรูปกิจกรรม ===
  const deleteActivityImage = async (req, res) => {
    try {
      const { userId, imageId } = req.params;
  
      const [[row]] = await pool.query(
        `SELECT image_path FROM activity_upload WHERE id=? AND user_id=?`,
        [imageId, userId]
      );
      if (!row) return res.status(404).json({ message: "ไม่พบรูปภาพ" });
  
      // สร้างพาธจริงจาก image_path ใน DB (เช่น /uploads/portfolio_image/xxx.png)
      const absPath = path.join(process.cwd(), row.image_path.replace(/^\//, "")); 
      try { await fs.promises.unlink(absPath); } catch (_) { /* ถ้าไฟล์ไม่มี ก็ข้าม */ }
  
      await pool.query(`DELETE FROM activity_upload WHERE id=? AND user_id=?`, [imageId, userId]);
      res.json({ message: "ลบรูปสำเร็จ" });
    } catch (err) {
      console.error("deleteActivityImage error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };


module.exports = { getActivities, addActivity, updateActivity , deleteActivity , uploadActivityImages , listActivityImages , deleteActivityImage };
