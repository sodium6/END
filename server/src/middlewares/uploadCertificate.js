const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dest = path.join(__dirname, "..", "uploads", "certificates");
// const dest = path.join(process.cwd(), 'uploads/certificates');
fs.mkdirSync(dest, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dest),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^(image\/(png|jpe?g|gif|webp|bmp|svg)|application\/pdf)$/.test(file.mimetype);
  cb(ok ? null : new Error('unsupported_file_type'), ok);
};

module.exports = multer({ storage, fileFilter }).single('file');
