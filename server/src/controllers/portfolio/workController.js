const pool = require("../../db/database");

// ✅ GET work
const getWorkByUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM work_experiences WHERE user_id = ?",
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("getWorkByUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADD work
const addWork = async (req, res) => {
  try {
    const { jobTitle, startDate, endDate, jobDescription, portfolioLink } = req.body;

    const [result] = await pool.query(
      `INSERT INTO work_experiences 
       (user_id, jobTitle, startDate, endDate, jobDescription, portfolioLink) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.userId, jobTitle, startDate, endDate, jobDescription, portfolioLink]
    );

    // ✅ คืนข้อมูลที่สร้างใหม่ให้ FE ใช้ map()
    res.json({
      id: result.insertId,
      userId: req.params.userId,
      jobTitle,
      startDate,
      endDate,
      jobDescription,
      portfolioLink,
      files: []
    });
  } catch (err) {
    console.error("addWorkExperience error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE work
const updateWork = async (req, res) => {
  try {
    const { jobTitle, startDate, endDate, jobDescription, portfolioLink } = req.body;
    await pool.query(
      `UPDATE work_experiences 
       SET jobTitle=?, startDate=?, endDate=?, jobDescription=?, portfolioLink=? 
       WHERE id=?`,
      [jobTitle, startDate, endDate, jobDescription, portfolioLink, req.params.id]
    );

    res.json({ message: "อัปเดตประสบการณ์สำเร็จ" });
  } catch (err) {
    console.error("updateWorkExperience error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM work_experiences WHERE id=?",
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
module.exports = { getWorkByUser, addWork, updateWork  , deleteWork};
