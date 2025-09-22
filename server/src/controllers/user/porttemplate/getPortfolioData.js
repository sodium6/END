const path = require("path");
const pool = require("../../../db/database");

/**
 * ดึงข้อมูลพอร์ตทั้งหมด (ประวัติ, งาน, กิจกรรม และกีฬา) ตาม userId
 * ต้องมี middleware ที่ตรวจสอบ token แล้วตั้งค่า req.user.id เอาไว้
 */
const getPortfolioData = async (req, res) => {
  try {
    // ใช้ userId จาก token (middleware) หรือจากพารามิเตอร์
    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId ไม่ถูกต้อง" });
    }

    // ---------- 1) ดึงข้อมูลผู้ใช้ ----------
    const [userRows] = await pool.query(
      `SELECT id, first_name_th, last_name_th, first_name_en, last_name_en,
              education, phone, email, st_id, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );
    if (!userRows.length) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
    const user = userRows[0];

    // ---------- 2) ดึงประสบการณ์ทำงานและไฟล์แนบ ----------
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

    let workExperiences = [];
    if (works.length) {
      // ดึงไฟล์งานทั้งหมดครั้งเดียว
      const workIds = works.map((w) => w.id);
      const placeholders = workIds.map(() => "?").join(",");
      const [files] = await pool.query(
        `SELECT id, wk_id AS wkId, user_id AS userId, file_path AS filePath
         FROM file_upload
         WHERE user_id = ? AND wk_id IN (${placeholders})
         ORDER BY id DESC`,
        [userId, ...workIds]
      );
      // จัดกลุ่มไฟล์ตาม workId
      const filesByWork = {};
      for (const f of files) {
        if (!filesByWork[f.wkId]) filesByWork[f.wkId] = [];
        filesByWork[f.wkId].push({
          id: f.id,
          wkId: f.wkId,
          userId: f.userId,
          filePath: f.filePath,
          name: path.basename(f.filePath), // ชื่อไฟล์ (ยังไม่ได้เก็บไว้ใน DB)
          size: 0, // ไม่ได้เก็บขนาดไว้
        });
      }
      // ประกอบข้อมูลงานพร้อมไฟล์
      workExperiences = works.map((w) => ({
        ...w,
        files: filesByWork[w.id] || [],
      }));
    }

    // ---------- 3) ดึงกิจกรรมและรูปภาพ ----------
    const [acts] = await pool.query(
      `SELECT 
         id,
         name,
         type,
         CASE WHEN start_date IS NULL THEN NULL
              ELSE DATE_FORMAT(start_date, '%Y-%m-%d') END AS startDate,
         CASE WHEN end_date IS NULL THEN NULL
              ELSE DATE_FORMAT(end_date, '%Y-%m-%d') END AS endDate,
         description
       FROM activities
       WHERE user_id = ?`,
      [userId]
    );

    let activities = [];
    if (acts.length) {
      // ดึงรูปทั้งหมดของกิจกรรมในครั้งเดียว
      const actIds = acts.map((a) => a.id);
      const placeholdersAct = actIds.map(() => "?").join(",");
      const [photos] = await pool.query(
        `SELECT id, activity_id AS actId, user_id, image_path AS filePath
         FROM activity_upload
         WHERE user_id = ? AND activity_id IN (${placeholdersAct})`,
        [userId, ...actIds]
      );
      // จัดกลุ่มรูปภาพตาม activity_id
      const photosByActivity = {};
      for (const p of photos) {
        if (!photosByActivity[p.actId]) photosByActivity[p.actId] = [];
        photosByActivity[p.actId].push({
          id: p.id,
          actId: p.actId,
          filePath: p.filePath,
          originalName: decodeURIComponent((p.filePath || "").split("/").pop() || "image"),
          sizeBytes: null, // ไม่ได้เก็บขนาด
        });
      }
      activities = acts.map((a) => ({
        ...a,
        photos: photosByActivity[a.id] || [],
      }));
    }

    // ---------- 4) ดึงกีฬา ----------
    const [sportsRows] = await pool.query(
      `SELECT
         id,
         user_id,
         name,
         type,
         CASE WHEN \`date\` IS NULL THEN NULL
              ELSE DATE_FORMAT(\`date\`, '%Y-%m-%d') END AS date,
         result,
         description,
         created_at
       FROM sports
       WHERE user_id = ?
       ORDER BY \`date\` DESC, id DESC`,
      [userId]
    );

    // รวมข้อมูลทั้งหมดส่งกลับ
    res.json({
      personalInfo: user,
      workExperiences,
      activities,
      sports: sportsRows || [],
    });
  } catch (err) {
    console.error("getPortfolioData error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPortfolioData,
  // ...export ฟังก์ชันอื่น ๆ ของคุณ
};
