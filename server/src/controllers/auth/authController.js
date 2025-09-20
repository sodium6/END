const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/database");
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
    const [existEmail] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existEmail.length > 0) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
    }

    // ตรวจสอบ st_id_canonical ซ้ำ
    const [existStid] = await pool.query("SELECT id FROM users WHERE st_id_canonical = ?", [
      st_id_canonical,
    ]);
    if (existStid.length > 0) {
      return res.status(400).json({ message: "รหัสนักศึกษานี้ถูกใช้แล้ว" });
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


// ================= Logout =================
const logout = async (req, res) => {
  try {
    // 🔹 ถ้าใช้ cookie session → เคลียร์ cookie
    res.clearCookie("token");

    // 🔹 ถ้า client เก็บ token ไว้เอง → client ต้องลบเอง
    res.json({ message: "ออกจากระบบสำเร็จ" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Profile =================
const profile = async (req, res) => {
  try {
    // decode token จาก Authorization Header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const [rows] = await pool.query(
      "SELECT id, title, first_name_th, last_name_th, st_id, st_id_canonical, email FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    const user = rows[0];
    const fullName = `${user.title} ${user.first_name_th} ${user.last_name_th}`;
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: fullName,
        st_id: user.st_id,
        st_id_canonical: user.st_id_canonical,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { register, login , logout, profile };
