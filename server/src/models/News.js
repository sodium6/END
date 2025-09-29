const pool = require('../db/database');

class News {
  static async dropIfExists() {
    await pool.execute('DROP TABLE IF EXISTS news');
    console.log('[News] Dropped table if existed: news');
  }

  static async createTable() {
    try {
      const shouldReset = (`${process.env.RESET_NEWS_TABLE || ''}`.toLowerCase() === 'true');
      const [adminTables] = await pool.execute("SHOW TABLES LIKE 'admins'");
      if (adminTables.length === 0) {
        throw new Error('Admin table must be created before News table');
      }

      const [newsTables] = await pool.execute("SHOW TABLES LIKE 'news'");
      if (newsTables.length > 0) {
        if (!shouldReset) {
          console.log('[News] Table already exists; skipping recreation');
          return;
        }
        console.log('[News] Dropping existing news table because RESET_NEWS_TABLE=true');
        await pool.execute('DROP TABLE news');
        console.log('[News] Existing news table dropped');
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
      console.log('[News] News table created successfully');
    } catch (error) {
      console.error('[News] News table creation failed:', error.message);
      throw error;
    }
  }

  static async getAll({ page = 1, pageSize = 10, q = '', category = '', excludeCategory = '' }) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safePageSize = Math.max(1, parseInt(pageSize, 10) || 10);
    const offset = (safePage - 1) * safePageSize;

    const filters = [];
    const params = [];

    const normalizedSearch = (q || '').trim();
    const normalizedCategory = (category || '').trim().toLowerCase();
    const normalizedExclude = (excludeCategory || '').trim().toLowerCase();

    if (normalizedSearch) {
      filters.push('title LIKE ?');
      params.push(`%${normalizedSearch}%`);
    }

    if (normalizedCategory) {
      filters.push('LOWER(category) = ?');
      params.push(normalizedCategory);
    }

    if (normalizedExclude) {
      filters.push('(category IS NULL OR LOWER(category) <> ?)');
      params.push(normalizedExclude);
    }

    const whereClause = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
    const dataQuery = `SELECT * FROM news${whereClause} ORDER BY created_at DESC LIMIT ${offset}, ${safePageSize}`;
    const countQuery = `SELECT COUNT(*) as total FROM news${whereClause}`;

    const dataParams = params.length ? [...params] : [];
    const countParams = params.length ? [...params] : [];

    const [rows] = await pool.execute(dataQuery, dataParams);
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    return { data: rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM news WHERE news_id = ?', [id]);
    return rows[0];
  }

  static async create(newsData) {
    const {
      title,
      content,
      admin_id,
      status = 'draft',
      category = null,
      featured_image_url = null,
    } = newsData;

    const normalizedStatus = (status || 'draft').trim().toLowerCase() === 'published' ? 'published' : 'draft';
    const normalizedCategory = category ? category.trim().toLowerCase() : null;
    const normalizedImage = featured_image_url ? featured_image_url.trim() : null;

    const [result] = await pool.execute(
      'INSERT INTO news (title, content, admin_id, status, category, featured_image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, admin_id, normalizedStatus, normalizedCategory, normalizedImage]
    );
    return result.insertId;
  }

  static async update(id, newsData) {
    const {
      title,
      content,
      status = 'draft',
      category = null,
      featured_image_url = null,
    } = newsData;

    const normalizedStatus = (status || 'draft').trim().toLowerCase() === 'published' ? 'published' : 'draft';
    const normalizedCategory = category ? category.trim().toLowerCase() : null;
    const normalizedImage = featured_image_url ? featured_image_url.trim() : null;

    const [result] = await pool.execute(
      'UPDATE news SET title = ?, content = ?, status = ?, category = ?, featured_image_url = ? WHERE news_id = ?',
      [title, content, normalizedStatus, normalizedCategory, normalizedImage, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM news WHERE news_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = News;
