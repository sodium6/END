// server/src/models/Admin.js - MySQL version
const pool = require('../db/database');

class Admin {
  static async create(adminData) {
    const { username, email, password_hash, full_name, role = 'viewer', status = 'active' } = adminData;
    
    const [result] = await pool.execute(
      'INSERT INTO admins (username, email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, role, status]
    );
    
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE admin_id = ?', [id]);
    return rows[0];
  }

  static async updateLastLogin(id) {
    await pool.execute('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE admin_id = ?', [id]);
  }

  static async createTable() {
    try {
      // ตรวจสอบการเชื่อมต่อก่อน
      await pool.execute('SELECT 1');
      console.log('✅ Database connection successful');
      
      // หากมีอยู่แล้ว พยายามปรับคอลัมน์ให้ถูกต้องแทนการลบ (หลีกเลี่ยง FK ปัญหา)
      const [tables] = await pool.execute("SHOW TABLES LIKE 'admins'");
      if (tables.length > 0) {
        console.log('ℹ️ Admins table exists, ensuring column types are correct...');
        await pool.execute("ALTER TABLE admins MODIFY COLUMN admin_id INT UNSIGNED AUTO_INCREMENT");
        console.log('✅ Ensured admins.admin_id is INT UNSIGNED');
        return;
      }
      
      const createTableSQL = `
        CREATE TABLE admins (
          admin_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role ENUM('superadmin', 'editor', 'viewer') DEFAULT 'viewer',
          status ENUM('active', 'suspended') DEFAULT 'active',
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await pool.execute(createTableSQL);
      console.log('✅ Admin table created successfully');
    } catch (error) {
      console.error('❌ Database table creation failed:', error.message);
      throw error;
    }
  }
}

module.exports = Admin;
