const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../../db/database.js");

// ================= Register =================
const register = async (req, res) => {
  try {
    const {
      title,
      first_name_th,
      last_name_th,
      first_name_en,
      last_name_en,
      phone,
      email,
      education,
      st_id,
      st_id_canonical,
      password,
    } = req.body;

    // ตรวจสอบ email ซ้ำ
    const [exist] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (exist.length > 0) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
       (title, first_name_th, last_name_th, first_name_en, last_name_en, phone, email, education, st_id, st_id_canonical, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        first_name_th,
        last_name_th,
        first_name_en,
        last_name_en,
        phone,
        email,
        education,
        st_id,
        st_id_canonical,
        hashedPassword,
      ]
    );

    res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Login =================
const login = async (req, res) => {
  try {
    const { st_id_canonical, password } = req.body;

    // ค้นหาจาก st_id_canonical
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE st_id_canonical = ?",
      [st_id_canonical]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "ไม่พบบัญชีนี้" });
    }

    const user = rows[0];

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, st_id_canonical: user.st_id_canonical },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ตอบกลับ
    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        st_id_canonical: user.st_id_canonical,
        name: `${user.first_name_th} ${user.last_name_th}`,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { register, login };
