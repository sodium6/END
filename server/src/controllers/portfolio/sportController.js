const pool = require("../../db/database");

const getSports = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM sports WHERE user_id=?",
    [req.params.userId]
  );
  res.json(rows);
};

const addSport = async (req, res) => {
  const { name, type, date, result, description } = req.body;
  await pool.query(
    "INSERT INTO sports (user_id, name, type, date, result, description) VALUES (?,?,?,?,?,?)",
    [req.params.userId, name, type, date, result, description]
  );
  res.json({ message: "เพิ่มกีฬาสำเร็จ" });
};

const updateSport = async (req, res) => {
  const { name, type, date, result, description } = req.body;
  await pool.query(
    "UPDATE sports SET name=?, type=?, date=?, result=?, description=? WHERE id=? AND user_id=?",
    [name, type, date, result, description, req.params.id, req.params.userId]
  );
  res.json({ message: "แก้ไขกีฬาสำเร็จ" });
};

const deleteSport = async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "DELETE FROM sports WHERE id=?",
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

module.exports = { getSports, addSport, updateSport, deleteSport };
