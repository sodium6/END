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

    // ??????? email ???
    const [existEmail] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existEmail.length > 0) {
      return res.status(400).json({ message: "?????????????????????" });
    }

    // ??????? st_id_canonical ???
    const [existStid] = await pool.query("SELECT id FROM users WHERE st_id_canonical = ?", [st_id_canonical]);
    if (existStid.length > 0) {
      return res.status(400).json({ message: "????????????????????????????" });
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

    res.json({ message: "????????????????? ??????????????????????????????" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Login =================
const login = async (req, res) => {
  try {
    const { st_id_canonical, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE st_id_canonical = ?",
      [st_id_canonical]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "?????????????" });
    }

    const user = rows[0];

    if (user.status === 'pending') {
      return res.status(403).json({ message: '???????????????????????????????????' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: '?????????????????????????' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: '????????????????????????' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "??????????????????" });
    }

    const token = jwt.sign(
      { id: user.id, st_id_canonical: user.st_id_canonical },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await User.recordLogin(user.id);

    res.json({
      message: "?????????????????",
      token,
      user: {
        id: user.id,
        st_id_canonical: user.st_id_canonical,
        name: `${user.first_name_th} ${user.last_name_th}`,
        email: user.email,
        status: user.status,
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
    res.clearCookie("token");
    res.json({ message: "????????????????" });
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
      return res.status(404).json({ message: "????????????????" });
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
