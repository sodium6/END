// server/src/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/error-handler.js');
const { NotFoundError } = require('./utils/error.js');
const routes = require('./routes/index.js');
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5174','http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token'],
  charset: 'utf8mb4',
}));
// ✅ เสิร์ฟ /uploads จาก server/public/uploads (ไม่ใช่ src/public/uploads)
// ✅ ชี้ไปที่ server/public/uploads (สังเกต .. ขึ้นมาจาก src)
// const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads');
// console.log('[STATIC] /uploads ->', UPLOADS_DIR);

// ต้องวางก่อน NotFound/ERROR handlers
// app.use('/uploads', express.static(UPLOADS_DIR, {
//   maxAge: '7d',
//   etag: true,
//   fallthrough: false, // ถ้าไฟล์ไม่มี ให้ตอบ 404 ที่นี่เลย
// }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// --- API ---
routes.forEach(({ path, route }) => {
  console.log('[MOUNT]', `/api/${path}`);
  app.use(`/api/${path}`, route);
});
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
// 404 ที่เหลือ
app.use((req, res, next) => {
  next(new NotFoundError(`The requested URL ${req.originalUrl} was not found.`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.info(`Server is running on port: ${PORT}`));
