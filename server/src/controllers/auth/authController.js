const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/database");
const User = require('../../models/User');

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
    const [existEmail] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existEmail.length > 0) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // ตรวจสอบ st_id_canonical ซ้ำ
    const [existStid] = await pool.query("SELECT id FROM users WHERE st_id_canonical = ?", [st_id_canonical]);
    if (existStid.length > 0) {
      return res.status(400).json({ message: "รหัสนักศึกษานี้ถูกใช้งานแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
       (title, first_name_th, last_name_th, first_name_en, last_name_en, phone, email, education, st_id, st_id_canonical, password, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
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

    res.json({ message: "สมัครสมาชิกสำเร็จ กรุณารอการตรวจสอบจากผู้ดูแลระบบ" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Login =================
const login = async (req, res) => {
  try {
    const { st_id_canonical: identifier, password } = req.body || {};

    const rawIdentifier = (identifier || '').trim();
    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const normalizedId = rawIdentifier.toLowerCase();
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(st_id_canonical) = ? OR LOWER(st_id) = ? OR LOWER(email) = ?",
      [normalizedId, normalizedId, normalizedId]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    const user = rows[0];

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'บัญชีของคุณยังรอการอนุมัติจากผู้ดูแลระบบ' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งานชั่วคราว' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'คำขอสมัครของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, st_id_canonical: user.st_id_canonical },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    await User.recordLogin(user.id);

    const displayName = user.first_name_th || user.last_name_th
      ? `${user.first_name_th || ''} ${user.last_name_th || ''}`.trim()
      : user.email;

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        st_id_canonical: user.st_id_canonical,
        name: displayName,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= Logout =================
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "ออกจากระบบเรียบร้อย" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Profile =================
const profile = async (req, res) => {
  try {
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
      "SELECT id, title, first_name_th, last_name_th, st_id, st_id_canonical, email, status FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    const user = rows[0];
    const fullName = `${user.title || ''} ${user.first_name_th} ${user.last_name_th}`.trim();
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: fullName,
        st_id: user.st_id,
        st_id_canonical: user.st_id_canonical,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, logout, profile };
