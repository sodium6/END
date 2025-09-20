// src/middlewares/uploadPortfolioFiles.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// โฟลเดอร์ปลายทาง เช่น <project>/src/uploads/portfolio_image
const uploadDir = path.join(__dirname, "..", "uploads", "portfolio_image");
fs.mkdirSync(uploadDir, { recursive: true });

// แปลง latin1 -> utf8 สำหรับชื่อไฟล์ที่ browser ส่งมา
const toUtf8 = (s) => Buffer.from(s || "", "latin1").toString("utf8");

// ทำความสะอาดชื่อไฟล์ แต่ยังคงอักษรไทยไว้
const sanitizeFilename = (name) =>
  (name || "")
    .normalize("NFC") // ให้สระ/วรรณยุกต์ไทยอยู่รูปแบบปกติ
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // อักขระต้องห้ามบน Windows/Unix
    .replace(/\s+/g, " ") // เว้นวรรคซ้ำ -> ช่องว่างเดียว
    .trim();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // 1) แปลง encoding ของ originalname ให้เป็น UTF-8
    const originalUtf8 = toUtf8(file.originalname);

    // 2) sanitize โดยยังคงภาษาไทยได้
    const safeOriginal = sanitizeFilename(originalUtf8);

    // 3) แยกนามสกุล/ชื่อไฟล์
    const ext = path.extname(safeOriginal).toLowerCase();
    const base = path.basename(safeOriginal, ext);

    // 4) ป้องกันชนกันด้วย timestamp (ไม่ใช้อักษรต้องห้าม)
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, ""); // 20250920...
    const finalName = `${base}_${ts}${ext}`;

    // แนบชื่อไฟล์ (ที่เป็น UTF-8) ไว้ให้ controller เอาไปเก็บใน DB ได้
    file.originalnameUtf8 = safeOriginal;

    cb(null, finalName);
  },
});

const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp", // เผื่อไว้
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const fileFilter = (_, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { upload, uploadDir };
