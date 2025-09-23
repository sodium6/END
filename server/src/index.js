// server/src/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/error-handler.js');
const { NotFoundError } = require('./utils/error.js');
const routes = require('./routes/index.js');
const Admin = require('./models/Admin.js');
const News = require('./models/News.js');
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5174','http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token'],
}));
// ✅ เสิร์ฟ /uploads จาก server/public/uploads (ไม่ใช่ src/public/uploads)
// ✅ ชี้ไปที่ server/public/uploads (สังเกต .. ขึ้นมาจาก src)
const UPLOADS_DIR = path.resolve(__dirname, '..', 'public', 'uploads');
console.log('[STATIC] /uploads ->', UPLOADS_DIR);

// ต้องวางก่อน NotFound/ERROR handlers
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  etag: true,
  fallthrough: false, // ถ้าไฟล์ไม่มี ให้ตอบ 404 ที่นี่เลย
}));

console.log('--- ROUTES BEING MOUNTED ---');
console.log(routes);
console.log('-----------------------------');
// --- API ---
routes.forEach(({ path, route }) => {
  console.log('[MOUNT]', `/api/${path}`);
  app.use(`/api/${path}`, route);
});

app.get('/test', (req, res) => {
  res.send('Server is running the latest code!');
});

// 404 ที่เหลือ
app.use((req, res, next) => {
  next(new NotFoundError(`The requested URL ${req.originalUrl} was not found.`));
});

app.use(errorHandler);

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');
    // Drop dependents first to avoid FK issues when adjusting parent
    try {
      await News.dropIfExists?.();
    } catch (e) {
      // ignore if method not available
    }
    await Admin.createTable();
    await News.createTable();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    process.exit(1); // หยุดการทำงานของเซิร์ฟเวอร์ถ้าฐานข้อมูลไม่สามารถเริ่มต้นได้
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.info(`🚀 Server is running on port: ${PORT}`);
  await initializeDatabase();
});
