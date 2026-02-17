const pool = require('../db/database');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const ALLOWED_ROLES = ['superadmin', 'admin'];

async function ensureExistingAccount({ username, passwordHash, role, email, fullName }) {
  const existing = await Admin.findByUsername(username);
  if (!existing) {
    return null;
  }

  const updates = [];
  const params = [];

  const currentStatus = ((existing.status || existing.STATUS || '') + '').toLowerCase();
  if (currentStatus !== 'active') {
    updates.push('status = ?', 'STATUS = ?');
    params.push('active', 'active');
  }

  if ((existing.role || existing.ROLE || '').toLowerCase() !== role) {
    updates.push('role = ?');
    params.push(role);
  }

  // always refresh email/full_name in case env changed
  if (email && email !== existing.email) {
    updates.push('email = ?');
    params.push(email);
  }
  if (fullName && fullName !== existing.full_name) {
    updates.push('full_name = ?');
    params.push(fullName);
  }

  updates.push('password_hash = ?');
  params.push(passwordHash);

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const sql = `UPDATE admins SET ${updates.join(', ')} WHERE admin_id = ?`;
  params.push(existing.admin_id);
  await pool.execute(sql, params);

  return existing.admin_id;
}

class Admin {
  static async ensureDefaultSuperAdmin() {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'superadmin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'SuperAdmin#123';
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'superadmin@example.com';
    const fullName = process.env.DEFAULT_ADMIN_NAME || 'System Super Admin';
    const role = 'superadmin';

    if (!username || !password) {
      return { created: false, skipped: true };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const updatedId = await ensureExistingAccount({ username, passwordHash, role, email, fullName });
    if (updatedId) {
      return { created: false, adminId: updatedId };
    }

    const adminId = await this.create({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      status: 'active',
    });

    console.info('[Admin] Default superadmin ensured:', username);
    return { created: true, adminId };
  }

  static async ensureDefaultAdmin() {
    const username = process.env.DEFAULT_STAFF_ADMIN_USERNAME || 'admin';
    const password = process.env.DEFAULT_STAFF_ADMIN_PASSWORD || '1234567';
    const email = process.env.DEFAULT_STAFF_ADMIN_EMAIL || 'admin@example.com';
    const fullName = process.env.DEFAULT_STAFF_ADMIN_NAME || 'Content Administrator';
    const role = 'admin';

    if (!username || !password) {
      return { created: false, skipped: true };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const updatedId = await ensureExistingAccount({ username, passwordHash, role, email, fullName });
    if (updatedId) {
      return { created: false, adminId: updatedId };
    }

    const adminId = await this.create({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      status: 'active',
    });

    console.info('[Admin] Default admin ensured:', username);
    return { created: true, adminId };
  }

  static async create(adminData) {
    const {
      username,
      email,
      password_hash,
      full_name,
      role = 'admin',
      status = 'active',
    } = adminData;

    const normalizedRole = ALLOWED_ROLES.includes((role || '').toLowerCase())
      ? role.toLowerCase()
      : 'admin';

    const [result] = await pool.execute(
      'INSERT INTO admins (username, email, password_hash, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, normalizedRole, status]
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
      await pool.execute('SELECT 1');
      console.log('[Admin] Database connection successful');

      const [tables] = await pool.execute("SHOW TABLES LIKE 'admins'");
      if (tables.length > 0) {
        console.log('[Admin] Admins table exists, ensuring schema is up to date...');

        await pool.execute('ALTER TABLE admins MODIFY COLUMN admin_id INT UNSIGNED AUTO_INCREMENT');
        console.log('[Admin] Ensured admins.admin_id is INT UNSIGNED');

        const [cols] = await pool.execute(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'"
        );
        const have = new Set(cols.map((c) => c.COLUMN_NAME.toLowerCase()));

        if (have.has('role')) {
          await pool.execute(
            "UPDATE admins SET role = 'admin' WHERE role IS NULL OR LOWER(role) NOT IN ('superadmin','admin')"
          );
          await pool.execute(
            "ALTER TABLE admins MODIFY COLUMN role ENUM('superadmin','admin') DEFAULT 'admin'"
          );
        }

        const alterStatements = [];
        if (!have.has('username')) alterStatements.push("ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL");
        if (!have.has('email')) alterStatements.push("ADD COLUMN email VARCHAR(100) UNIQUE NOT NULL");
        if (!have.has('password_hash')) alterStatements.push("ADD COLUMN password_hash VARCHAR(255) NOT NULL");
        if (!have.has('full_name')) alterStatements.push("ADD COLUMN full_name VARCHAR(100) NOT NULL");
        if (!have.has('role')) alterStatements.push("ADD COLUMN role ENUM('superadmin','admin') DEFAULT 'admin'");
        if (!have.has('status') && !have.has('status'.toLowerCase())) {
          alterStatements.push("ADD COLUMN status ENUM('active','suspended') DEFAULT 'active'");
        }
        if (!have.has('last_login')) alterStatements.push('ADD COLUMN last_login TIMESTAMP NULL');
        if (!have.has('created_at')) alterStatements.push('ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        if (!have.has('updated_at')) {
          alterStatements.push('ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        }

        if (alterStatements.length > 0) {
          const sql = `ALTER TABLE admins ${alterStatements.join(', ')}`;
          await pool.execute(sql);
          console.log('[Admin] Added missing columns on admins table');
        }

        return;
      }

      const createTableSQL = `
        CREATE TABLE admins (
          admin_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          role ENUM('superadmin', 'admin') DEFAULT 'admin',
          status ENUM('active', 'suspended') DEFAULT 'active',
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      await pool.execute(createTableSQL);
      console.log('[Admin] Admin table created successfully');
    } catch (error) {
      console.error('[Admin] Database table creation failed:', error.message);
      throw error;
    }
  }
}

module.exports = Admin;
