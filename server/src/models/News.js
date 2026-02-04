const pool = require('../db/database');

class News {
  static async dropIfExists() {
    await pool.execute('DROP TABLE IF EXISTS news');
    // console.log('[News] Dropped table if existed: news');
  }

  static async createTable() {
    try {
      const shouldReset = (`${process.env.RESET_NEWS_TABLE || ''}`.toLowerCase() === 'true');
      const [adminTables] = await pool.execute("SHOW TABLES LIKE 'admins'");
      if (adminTables.length === 0) {
        throw new Error('Admin table must be created before News table');
      }

      // Ensure news_categories exists
      const [catTables] = await pool.execute("SHOW TABLES LIKE 'news_categories'");
      if (catTables.length === 0) {
        // It might be created by another call, but ideally we ensure it exists
        console.warn('[News] news_categories table should exist before News table');
      }

      const [newsTables] = await pool.execute("SHOW TABLES LIKE 'news'");
      if (newsTables.length > 0) {
        if (shouldReset) {
          await pool.execute('DROP TABLE news');
        } else {
          // Check for category_id column and add if missing
          const [cols] = await pool.execute(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'news'"
          );
          const have = new Set(cols.map((c) => c.COLUMN_NAME.toLowerCase()));
          if (!have.has('category_id')) {
            // console.log('[News] Adding category_id column');
            await pool.execute('ALTER TABLE news ADD COLUMN category_id INT UNSIGNED NULL, ADD CONSTRAINT fk_news_category FOREIGN KEY (category_id) REFERENCES news_categories(category_id) ON DELETE SET NULL');
          }
          return;
        }
      }

      const createTableSQL = `
        CREATE TABLE news (
          news_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          admin_id INT UNSIGNED NOT NULL,
          status ENUM('draft', 'published') DEFAULT 'draft',
          category VARCHAR(100),
          category_id INT UNSIGNED,
          featured_image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (category_id) REFERENCES news_categories(category_id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      await pool.execute(createTableSQL);
      // console.log('[News] News table created successfully');
    } catch (error) {
      console.error('[News] News table creation failed:', error.message);
      throw error;
    }
  }

  static async getAll({ page = 1, pageSize = 10, q = '', category = '', categoryId = null, excludeCategory = '', status = '' }) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safePageSize = Math.max(1, parseInt(pageSize, 10) || 10);
    const offset = (safePage - 1) * safePageSize;

    const filters = [];
    const params = [];

    const normalizedSearch = (q || '').trim();
    const normalizedCategory = (category || '').trim().toLowerCase();
    const normalizedExclude = (excludeCategory || '').trim().toLowerCase();
    const normalizedStatus = (status || '').trim().toLowerCase();

    if (normalizedSearch) {
      filters.push('n.title LIKE ?');
      params.push(`%${normalizedSearch}%`);
    }

    if (categoryId) {
      filters.push('n.category_id = ?');
      params.push(categoryId);
    } else if (normalizedCategory) {
      // Fallback for legacy string category or joining name
      filters.push('(LOWER(nc.name) = ? OR LOWER(n.category) = ?)');
      params.push(normalizedCategory, normalizedCategory);
    }

    if (normalizedExclude) {
      filters.push('(nc.name IS NULL OR LOWER(nc.name) <> ?)');
      params.push(normalizedExclude);
    }

    if (normalizedStatus) {
      filters.push('n.status = ?');
      params.push(normalizedStatus);
    }

    const whereClause = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';

    // Join with news_categories
    const dataQuery = `
        SELECT n.*, nc.name as category_name 
        FROM news n 
        LEFT JOIN news_categories nc ON n.category_id = nc.category_id
        ${whereClause} 
        ORDER BY n.created_at DESC 
        LIMIT ${offset}, ${safePageSize}
    `;
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM news n 
        LEFT JOIN news_categories nc ON n.category_id = nc.category_id
        ${whereClause}
    `;

    const dataParams = params.length ? [...params] : [];
    const countParams = params.length ? [...params] : [];

    const [rows] = await pool.execute(dataQuery, dataParams);
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    return { data: rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
        SELECT n.*, nc.name as category_name 
        FROM news n 
        LEFT JOIN news_categories nc ON n.category_id = nc.category_id
        WHERE n.news_id = ?
    `, [id]);
    return rows[0];
  }

  static async create(newsData) {
    const {
      title,
      content,
      admin_id,
      status = 'draft',
      category = null,
      category_id = null,
      featured_image_url = null,
    } = newsData;

    const normalizedStatus = (status || 'draft').trim().toLowerCase() === 'published' ? 'published' : 'draft';
    const normalizedCategory = category ? category.trim() : null; // Keep for legacy
    const normalizedImage = featured_image_url ? featured_image_url.trim() : null;

    const [result] = await pool.execute(
      'INSERT INTO news (title, content, admin_id, status, category, category_id, featured_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content, admin_id, normalizedStatus, normalizedCategory, category_id, normalizedImage]
    );
    return result.insertId;
  }

  static async update(id, newsData) {
    const {
      title,
      content,
      status = 'draft',
      category = null,
      category_id = null,
      featured_image_url = null,
    } = newsData;

    const normalizedStatus = (status || 'draft').trim().toLowerCase() === 'published' ? 'published' : 'draft';
    const normalizedCategory = category ? category.trim() : null;
    const normalizedImage = featured_image_url ? featured_image_url.trim() : null;

    // Build update query dynamically to handle partial updates or undefined fields if needed? 
    // But for now strict update based on signature
    const [result] = await pool.execute(
      'UPDATE news SET title = ?, content = ?, status = ?, category = ?, category_id = ?, featured_image_url = ? WHERE news_id = ?',
      [title, content, normalizedStatus, normalizedCategory, category_id, normalizedImage, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM news WHERE news_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = News;
