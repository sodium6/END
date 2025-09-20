const pool = require("../../db/database");

const getActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM activities WHERE user_id=?",
      [req.params.userId]
    );
    res.json(rows || []);
  } catch (err) {
    console.error("getActivities error:", err);
    res.status(500).json({ message: "Server error" });
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
module.exports = { getActivities, addActivity, updateActivity , deleteActivity };
