// controllers/auth/passwordReset.controller.js
const pool = require('../../db/database');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const OTP_WINDOW_MIN = Number(process.env.OTP_WINDOW_MIN || 10);
const OTP_ATTEMPTS_ALLOWED = Number(process.env.OTP_ATTEMPTS || 5);
const RESET_TOKEN_WINDOW_MIN = Number(process.env.RESET_TOKEN_MIN || 15);

const MAIL_FROM = process.env.MAIL_FROM || '"Support" <no-reply@example.com>';
const EMAIL_DEBUG = /^true$/i.test(process.env.EMAIL_DEBUG || '');

async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: /^true$/i.test(process.env.SMTP_SECURE || ''),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      logger: EMAIL_DEBUG,
      debug: EMAIL_DEBUG,
    });
  }
  const test = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: test.user, pass: test.pass },
    logger: EMAIL_DEBUG,
    debug: EMAIL_DEBUG,
  });
}

async function sendOtpEmail({ to, stId, otp }) {
  const tx = await getTransporter();
  const subject = 'รหัสยืนยันรีเซ็ตรหัสผ่าน (OTP)';
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto;line-height:1.7;color:#111">
      <h2 style="margin:0 0 8px 0">ยืนยันการรีเซ็ตรหัสผ่าน</h2>
      <p>รหัส OTP สำหรับผู้ใช้ <b>${stId}</b></p>
      <p style="font-size:18px;margin:12px 0"><b>OTP: ${otp}</b></p>
      <p>รหัสนี้จะหมดอายุภายใน ${OTP_WINDOW_MIN} นาที และใช้ได้ครั้งเดียว</p>
      <hr style="margin:16px 0;border-top:1px solid #e5e7eb"/>
      <div style="font-size:12px;color:#555">หากท่านไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</div>
    </div>`;
  const info = await tx.sendMail({ from: MAIL_FROM, to, subject, html });
  if (EMAIL_DEBUG) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('[OTP] preview URL:', url);
  }
}

const genOtp6 = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const genResetToken = () => crypto.randomBytes(32).toString('hex');

/* STEP 1: ขอ OTP */
exports.requestOtp = async (req, res) => {
  try {
    const stId = (req.body?.st_id_canonical || '').trim();
    if (!stId) return res.status(400).json({ message: 'st_id_canonical_required' });

    const [urows] = await pool.query(
      'SELECT id, email, status FROM users WHERE st_id_canonical = ? LIMIT 1',
      [stId]
    );
    const user = urows[0];
    if (!user || user.status !== 'active') {
      return res.status(404).json({ message: 'user_not_found_or_inactive' });
    }
    if (!user.email) return res.status(400).json({ message: 'user_missing_email' });

    const otp = genOtp6();
    const codeHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + OTP_WINDOW_MIN * 60 * 1000);

    // เคลียร์ OTP เดิมที่ยังไม่ใช้ของ user เดียวกัน
    await pool.query(
      `DELETE FROM password_reset_otps
       WHERE user_id = ? AND verified_at IS NULL AND used_at IS NULL`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_otps
         (user_id, code_hash, expires_at, attempts, ip)
       VALUES (?, ?, ?, 0, ?)`,
      [user.id, codeHash, expires, req.ip || null]
    );

    await sendOtpEmail({ to: user.email, stId, otp });
    return res.json({ ok: true, message: 'otp_sent' });
  } catch (e) {
    console.error('[passwordReset] requestOtp failed:', e);
    return res.status(500).json({ message: 'server_error' });
  }
};

/* STEP 2: ยืนยัน OTP => ออก reset_token */
exports.verifyOtp = async (req, res) => {
  try {
    const stId = (req.body?.st_id_canonical || '').trim();
    const code = (req.body?.otp || '').trim();
    if (!stId || !code) return res.status(400).json({ message: 'invalid_params' });

    const [urows] = await pool.query(
      'SELECT id FROM users WHERE st_id_canonical = ? LIMIT 1',
      [stId]
    );
    const user = urows[0];
    if (!user) return res.status(404).json({ message: 'user_not_found' });

    const [orows] = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE user_id = ?
         AND verified_at IS NULL
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [user.id]
    );
    const otpRow = orows[0];
    if (!otpRow) return res.status(400).json({ message: 'otp_not_found_or_expired' });

    if (otpRow.attempts >= OTP_ATTEMPTS_ALLOWED) {
      return res.status(429).json({ message: 'too_many_attempts' });
    }

    const ok = await bcrypt.compare(code, otpRow.code_hash);
    if (!ok) {
      await pool.query(
        'UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = ?',
        [otpRow.id]
      );
      return res.status(400).json({ message: 'otp_incorrect' });
    }

    const resetToken = genResetToken();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const tokenExp = new Date(Date.now() + RESET_TOKEN_WINDOW_MIN * 60 * 1000);

    await pool.query(
      `UPDATE password_reset_otps
         SET verified_at = NOW(),
             reset_token_hash = ?,
             reset_token_expires = ?
       WHERE id = ?`,
      [resetTokenHash, tokenExp, otpRow.id]
    );

    return res.json({
      ok: true,
      reset_token: resetToken,
      reset_token_expires: tokenExp.toISOString(),
    });
  } catch (e) {
    console.error('[passwordReset] verifyOtp failed:', e);
    return res.status(500).json({ message: 'server_error' });
  }
};

/* STEP 3: ตั้งรหัสผ่านใหม่ด้วย reset_token */
exports.resetPassword = async (req, res) => {
  try {
    const stId = (req.body?.st_id_canonical || '').trim();
    const resetToken = (req.body?.reset_token || '').trim();
    const newPassword = (req.body?.new_password || '').trim();

    if (!stId || !resetToken || newPassword.length < 8) {
      return res.status(400).json({ message: 'invalid_params' });
    }

    const [urows] = await pool.query(
      'SELECT id FROM users WHERE st_id_canonical = ? LIMIT 1',
      [stId]
    );
    const user = urows[0];
    if (!user) return res.status(404).json({ message: 'user_not_found' });

    const [trows] = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE user_id = ?
         AND verified_at IS NOT NULL
         AND used_at IS NULL
         AND reset_token_expires > NOW()
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [user.id]
    );
    const tok = trows[0];
    if (!tok || !tok.reset_token_hash) {
      return res.status(400).json({ message: 'reset_token_not_found_or_expired' });
    }

    const ok = await bcrypt.compare(resetToken, tok.reset_token_hash);
    if (!ok) return res.status(400).json({ message: 'reset_token_invalid' });

    const pwHash = await bcrypt.hash(newPassword, 12);

    // NOTE: ตาราง users ของคุณใช้คอลัมน์ `password` (ไม่ใช่ password_hash)
    await pool.query(
      'UPDATE users SET password = ?, password_changed_at = NOW() WHERE id = ?',
      [pwHash, user.id]
    );

    await pool.query('UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?', [tok.id]);
    await pool.query(
      'DELETE FROM password_reset_otps WHERE user_id = ? AND id <> ?',
      [user.id, tok.id]
    );

    return res.json({ ok: true, message: 'password_updated' });
  } catch (e) {
    console.error('[passwordReset] resetPassword failed:', e);
    return res.status(500).json({ message: 'server_error' });
  }
};
