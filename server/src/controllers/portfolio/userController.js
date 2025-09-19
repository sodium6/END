const pool = require("../../db/database");
const bcrypt = require("bcryptjs");

// ✅ GET profile
const getUserProfile = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      first_name_th,
      last_name_th,
      first_name_en,
      last_name_en,
      education,
      phone,
      email,
      password_new,
    } = req.body;

    let query = `
      UPDATE users 
      SET first_name_th=?, last_name_th=?, first_name_en=?, last_name_en=?, 
          education=?, phone=?, email=?`;

    const params = [
      first_name_th,
      last_name_th,
      first_name_en,
      last_name_en,
      education,
      phone,
      email,
    ];

    if (password_new) {
      const hashed = await bcrypt.hash(password_new, 10);
      query += `, password=?`;
      params.push(hashed);
    }

    query += " WHERE id=?";
    params.push(req.params.id);

    await pool.query(query, params);

    res.json({ message: "อัปเดตโปรไฟล์สำเร็จ" });
  } catch (err) {
    console.error("updateUserProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProfile, updateUserProfile };
