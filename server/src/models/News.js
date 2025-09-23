const pool = require('../db/database');

class News {
  static async dropIfExists() {
    await pool.execute('DROP TABLE IF EXISTS news');
    console.log('🗑️ Dropped table if existed: news');
  }

  static async createTable() {
    try {
      // ตรวจสอบว่าตาราง admins มีอยู่แล้วหรือไม่
      const [adminTables] = await pool.execute("SHOW TABLES LIKE 'admins'");
      if (adminTables.length === 0) {
        throw new Error('Admin table must be created before News table');
      }
      
      // ลบตาราง news เก่าถ้ามี (เพื่อแก้ไขปัญหา foreign key)
      const [newsTables] = await pool.execute("SHOW TABLES LIKE 'news'");
      if (newsTables.length > 0) {
        console.log('🔄 Dropping existing news table...');
        await pool.execute('DROP TABLE news');
        console.log('✅ Existing news table dropped');
      }
      
      const createTableSQL = `
        CREATE TABLE news (
          news_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          admin_id INT UNSIGNED NOT NULL,
          status ENUM('draft', 'published') DEFAULT 'draft',
          category VARCHAR(100),
          featured_image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await pool.execute(createTableSQL);
      console.log('✅ News table created successfully');
    } catch (error) {
      console.error('❌ News table creation failed:', error.message);
      throw error;
    }
  }

  static async getAll({ page = 1, pageSize = 10, q = '' }) {
    const offset = (page - 1) * pageSize;
    let query = 'SELECT * FROM news';
    let countQuery = 'SELECT COUNT(*) as total FROM news';
    const params = [];

    if (q) {
      query += ' WHERE title LIKE ?';
      countQuery += ' WHERE title LIKE ?';
      params.push(`%${q}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const [rows] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, params.length - 2));

    return { data: rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM news WHERE news_id = ?', [id]);
    return rows[0];
  }

  static async create(newsData) {
    const { title, content, admin_id, status, category, featured_image_url } = newsData;
    const [result] = await pool.execute(
      'INSERT INTO news (title, content, admin_id, status, category, featured_image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, admin_id, status, category, featured_image_url]
    );
    return result.insertId;
  }

  static async update(id, newsData) {
    const { title, content, status, category, featured_image_url } = newsData;
    const [result] = await pool.execute(
      'UPDATE news SET title = ?, content = ?, status = ?, category = ?, featured_image_url = ? WHERE news_id = ?',
      [title, content, status, category, featured_image_url, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM news WHERE news_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = News;