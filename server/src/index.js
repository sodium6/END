const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/error-handler.js');
const { NotFoundError } = require('./utils/error.js');
const routes = require('./routes/index.js');
const Admin = require('./models/Admin.js');
const News = require('./models/News.js');
const User = require('./models/User.js');
const EmailBroadcast = require('./models/EmailBroadcast');
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
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

const initializeDatabase = async () => {
  try {
    console.log('[DB] Initializing database tables...');
    const shouldResetNews = (`${process.env.RESET_NEWS_TABLE || ''}`.toLowerCase() === 'true');

    if (shouldResetNews) {
      try {
        await News.dropIfExists?.();
        console.log('[News] Existing table dropped because RESET_NEWS_TABLE=true');
      } catch (err) {
        console.warn('[News] Failed to drop table before recreate:', err.message);
      }
    } else {
      console.log('[News] Preserving existing news table (set RESET_NEWS_TABLE=true to force drop)');
    }

    await User.createTable();
    await Admin.createTable();

    const defaultSuperAdmin = await Admin.ensureDefaultSuperAdmin();
    if (defaultSuperAdmin?.created) {
      console.log('[Admin] Default superadmin created with username:', process.env.DEFAULT_ADMIN_USERNAME || 'superadmin');
    }

    const defaultStaffAdmin = await Admin.ensureDefaultAdmin();
    if (defaultStaffAdmin?.created) {
      console.log('[Admin] Default admin created with username:', process.env.DEFAULT_STAFF_ADMIN_USERNAME || 'admin');
    }

    await News.createTable();
    await EmailBroadcast.createTable();
    console.log('[DB] Database tables initialized successfully');
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.info(`[Server] Running on port ${PORT}`);
  await initializeDatabase();
});


