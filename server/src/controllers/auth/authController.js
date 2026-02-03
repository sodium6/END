const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db/database");
const User = require('../../models/User');
const { sendMail } = require("../../utils/mailer");

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
      user_type // 'student' or 'alumni'
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
    const finalUserType = user_type === 'alumni' ? 'alumni' : 'student';

    // Insert user with status 'pending'
    const [result] = await pool.query(
      `INSERT INTO users 
       (title, first_name_th, last_name_th, first_name_en, last_name_en, phone, email, education, st_id, st_id_canonical, password, status, user_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
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
        finalUserType
      ]
    );

    // Generate & Save OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      "INSERT INTO email_verifications (email, otp_hash, expires_at) VALUES (?, ?, ?)",
      [email, otpHash, expiresAt]
    );

    // Send Email
    try {
      await sendMail({
        to: email,
        subject: "รหัสยืนยันการสมัครสมาชิก (OTP Verification)",
        html: `
          <h3>รหัสยืนยันตัวตนของคุณคือ:</h3>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>รหัสนี้จะหมดอายุใน 15 นาที</p>
          <p>หากคุณไม่ได้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลนี้</p>
        `
      });
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      // If email fails, we should probably rollback the user creation or warn the user.
      // For now, let's return an error so the frontend knows.
      return res.status(500).json({
        message: "สมัครสมาชิกสำเร็จ แต่ไม่สามารถส่งอีเมล OTP ได้ กรุณาลองกด 'Resend OTP' ภายหลัง"
      });
    }

    res.json({
      message: "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อกรอกรหัส OTP",
      email: email
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= Verify Email =================
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "กรุณาระบุอีเมลและรหัส OTP" });
    }

    // Find OTP record
    const [otpRows] = await pool.query(
      "SELECT * FROM email_verifications WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" });
    }

    const verification = otpRows[0];
    const isMatch = await bcrypt.compare(otp, verification.otp_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง" });
    }

    // Activate User
    await pool.query("UPDATE users SET status = 'active', approved_at = NOW() WHERE email = ?", [email]);

    // Cleanup OTPs
    await pool.query("DELETE FROM email_verifications WHERE email = ?", [email]);

    // Login user automatically
    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    const user = userRows[0];
    const token = jwt.sign(
      { id: user.id, st_id_canonical: user.st_id_canonical },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Record login
    await User.recordLogin(user.id);

    res.json({
      message: "ยืนยันอีเมลสำเร็จ",
      token,
      user: {
        id: user.id,
        st_id_canonical: user.st_id_canonical,
        name: `${user.first_name_th} ${user.last_name_th}`,
        email: user.email,
        status: user.status,
        user_type: user.user_type
      }
    });

  } catch (err) {
    console.error("Verify Email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= Resend OTP =================
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "กรุณาระบุอีเมล" });
    }

    // Check if user exists and is pending
    const [users] = await pool.query("SELECT id, status FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // Optional: Allow resend only for pending users? 
    // For now, let's allow it generally but typically it's for pending users.
    if (users[0].status !== 'pending') {
      return res.status(400).json({ message: "บัญชีนี้ยืนยันตัวตนไปแล้ว หรือไม่สามารถยืนยันได้" });
    }

    // Generate & Save OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      "INSERT INTO email_verifications (email, otp_hash, expires_at) VALUES (?, ?, ?)",
      [email, otpHash, expiresAt]
    );

    // Send Email
    try {
      await sendMail({
        to: email,
        subject: "ขอรหัสยืนยันการสมัครสมาชิกใหม่ (Resend OTP)",
        html: `
          <h3>รหัสยืนยันตัวตนของคุณคือ:</h3>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>รหัสนี้จะหมดอายุใน 15 นาที</p>
          <p>หากคุณไม่ได้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลนี้</p>
        `
      });
    } catch (mailErr) {
      console.error("Failed to resend OTP email:", mailErr);
      return res.status(500).json({ message: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่ภายหลัง" });
    }

    res.json({ message: "ส่งรหัส OTP รอบใหม่เรียบร้อยแล้ว" });

  } catch (err) {
    console.error("Resend OTP error:", err);
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
      return res.status(403).json({ message: 'บัญชีของคุณยังไม่ได้ยืนยันตัวตน (OTP) หรือรอการอนุมัติ' });
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
        user_type: user.user_type
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
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
      "SELECT id, title, first_name_th, last_name_th, st_id, st_id_canonical, email, status, user_type FROM users WHERE id = ?",
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
        user_type: user.user_type
      },
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, verifyEmail, resendOtp, login, logout, profile };
