const pool = require('../db/database');

const VALID_STATUSES = ['pending', 'active', 'suspended', 'rejected'];

class User {
  static get VALID_STATUSES() {
    return VALID_STATUSES;
  }

  static async createTable() {
    const [tables] = await pool.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      const createSql = `
        CREATE TABLE users (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(50),
          first_name_th VARCHAR(100) NOT NULL,
          last_name_th VARCHAR(100) NOT NULL,
          first_name_en VARCHAR(100) NOT NULL,
          last_name_en VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          education VARCHAR(255) NOT NULL,
          st_id VARCHAR(50),
          st_id_canonical VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          status ENUM('pending','active','suspended','rejected') DEFAULT 'pending',
          approved_at TIMESTAMP NULL,
          last_login TIMESTAMP NULL,
          password_changed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      await pool.execute(createSql);
      return;
    }

    const [cols] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
    );
    const have = new Set(cols.map((c) => c.COLUMN_NAME.toLowerCase()));
    const alters = [];

    if (!have.has('status')) {
      alters.push("ADD COLUMN status ENUM('pending','active','suspended','rejected') DEFAULT 'pending'");
    }
    if (!have.has('approved_at')) {
      alters.push('ADD COLUMN approved_at TIMESTAMP NULL');
    }
    if (!have.has('last_login')) {
      alters.push('ADD COLUMN last_login TIMESTAMP NULL');
    }
    if (!have.has('password_changed_at')) {
      alters.push('ADD COLUMN password_changed_at TIMESTAMP NULL');
    }
    if (!have.has('created_at')) {
      alters.push('ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }
    if (!have.has('updated_at')) {
      alters.push('ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }
    // New Profile Columns
    if (!have.has('nickname')) alters.push("ADD COLUMN nickname VARCHAR(100) NULL");
    if (!have.has('dob')) alters.push("ADD COLUMN dob DATE NULL");
    if (!have.has('gender')) alters.push("ADD COLUMN gender VARCHAR(20) NULL");
    if (!have.has('nationality')) alters.push("ADD COLUMN nationality VARCHAR(50) NULL");
    if (!have.has('line_id')) alters.push("ADD COLUMN line_id VARCHAR(100) NULL");
    if (!have.has('address')) alters.push("ADD COLUMN address TEXT NULL");
    if (!have.has('province')) alters.push("ADD COLUMN province VARCHAR(100) NULL");
    if (!have.has('user_desc')) alters.push("ADD COLUMN user_desc TEXT NULL");
    if (!have.has('profile_visibility')) alters.push("ADD COLUMN profile_visibility JSON NULL");
    if (!have.has('profile_pic')) alters.push("ADD COLUMN profile_pic VARCHAR(255) NULL");

    if (alters.length > 0) {
      await pool.execute(`ALTER TABLE users ${alters.join(', ')}`);
    }

    // Normalise existing status values
    await pool.execute("UPDATE users SET status = 'pending' WHERE status IS NULL OR status = ''");
  }

  static async list({ page = 1, pageSize = 10, q = '', status = '' }) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset = (safePage - 1) * safeSize;

    const filters = [];
    const params = [];

    const search = (q || '').trim();
    if (search) {
      filters.push(`(first_name_th LIKE ? OR last_name_th LIKE ? OR first_name_en LIKE ? OR last_name_en LIKE ? OR email LIKE ? OR st_id LIKE ? OR st_id_canonical LIKE ?)`);
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword);
    }

    const normalizedStatus = (status || '').trim().toLowerCase();
    if (normalizedStatus && VALID_STATUSES.includes(normalizedStatus)) {
      filters.push('status = ?');
      params.push(normalizedStatus);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const dataSql = `
      SELECT id, title, first_name_th, last_name_th, first_name_en, last_name_en,
             email, phone, education, st_id, st_id_canonical, status,
             approved_at, last_login, password_changed_at, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${offset}, ${safeSize}
    `;

    const countSql = `SELECT COUNT(*) AS cnt FROM users ${whereClause}`;

    const [rows] = await pool.execute(dataSql, params);
    const [countRows] = await pool.execute(countSql, params);

    return {
      data: rows,
      total: countRows[0]?.cnt || 0,
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, title, first_name_th, last_name_th, first_name_en, last_name_en,
              email, phone, education, st_id, st_id_canonical, status,
              approved_at, last_login, password_changed_at, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const normalized = (status || '').trim().toLowerCase();
    if (!VALID_STATUSES.includes(normalized)) {
      return false;
    }

    const updates = ['status = ?'];
    const params = [normalized];

    if (normalized === 'active') {
      updates.push('approved_at = COALESCE(approved_at, CURRENT_TIMESTAMP)');
    } else if (normalized === 'pending' || normalized === 'rejected') {
      updates.push('approved_at = NULL');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, passwordHash) {
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async recordLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
}

module.exports = User;
