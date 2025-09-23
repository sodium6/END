// db.js
const mysql = require("mysql2/promise"); 
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rmutk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // แก้ไขปัญหา mysql_native_password
  authPlugins: {
    mysql_native_password: () => () => Buffer.alloc(0)
  },
  // การตั้งค่าที่ถูกต้อง
  ssl: false,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // เพิ่มการตั้งค่าที่ถูกต้อง
  multipleStatements: false,
  dateStrings: false,
  debug: false
});

module.exports =  pool ;
