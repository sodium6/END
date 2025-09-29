// db.js
const mysql = require("mysql2/promise"); 
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // แก้ไขปัญหา mysql_native_password
  authPlugins: {
    mysql_native_password: () => () => Buffer.alloc(0)
  },
  // การตั้งค่าที่ถูกต้องตาม mysql2 v3
  ssl: false,
  // ใช้ connectTimeout (ms) แทน acquireTimeout/timeout
  connectTimeout: 60000,
  // ตั้งค่า pool idle timeout (ms)
  idleTimeout: 60000,
  // เปิด keep-alive เพื่อลดโอกาสตัดการเชื่อมต่อ
  enableKeepAlive: true,
  // ออปชันเพิ่มเติมที่ปลอดภัย
  multipleStatements: false,
  dateStrings: false,
  debug: false
});

module.exports =  pool ;
