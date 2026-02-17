// middlewares/uploadImage.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UP_BASE = path.join(__dirname, '..', 'uploads', 'news');

// ให้แน่ใจว่าโฟลเดอร์มีอยู่
fs.mkdirSync(UP_BASE, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UP_BASE),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^\w\-ก-๙]+/g, '-')      // slugify เบาๆ
      .replace(/-+/g, '-')
      .slice(0, 60);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`);
  },
});

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  cb(new Error('Invalid image type'));
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('featured_image'); // ชื่อฟิลด์ต้องตรงกับ FormData

module.exports = uploadImage;
