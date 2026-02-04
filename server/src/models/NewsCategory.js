const pool = require('../db/database');

class NewsCategory {
    static async createTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS news_categories (
        category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
        await pool.execute(createTableSQL);

        // Seed default categories if empty
        const [rows] = await pool.execute('SELECT count(*) as count FROM news_categories');
        if (rows[0].count === 0) {
            await pool.execute("INSERT INTO news_categories (name) VALUES ('News'), ('Activity'), ('Scholarship')");
        }
    }

    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM news_categories ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM news_categories WHERE category_id = ?', [id]);
        return rows[0];
    }

    static async create(name, description = '') {
        try {
            const [result] = await pool.execute(
                'INSERT INTO news_categories (name, description) VALUES (?, ?)',
                [name.trim(), description]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('หมวดหมู่นี้มีอยู่แล้ว');
            }
            throw error;
        }
    }

    static async update(id, name, description) {
        try {
            const [result] = await pool.execute(
                'UPDATE news_categories SET name = ?, description = ? WHERE category_id = ?',
                [name.trim(), description, id]
            );
            return result.affectedRows;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('ชื่อหมวดหมู่นี้มีอยู่แล้ว');
            }
            throw error;
        }
    }

    static async delete(id) {
        // Check usage in news table before delete (optional, or rely on FK constraint helper)
        // For now, let's assume we can delete and set news category to NULL or restrict.
        // We'll let the database FK (if we add one) handle it, or we handle it here.
        // Since we are adding FK to News, we should probably handle it gracefully.

        // Check if used
        const [newsUsage] = await pool.execute('SELECT count(*) as count FROM news WHERE category_id = ?', [id]);
        if (newsUsage[0].count > 0) {
            throw new Error('ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากมีข่าวสารที่ใช้งานอยู่');
        }

        const [result] = await pool.execute('DELETE FROM news_categories WHERE category_id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = NewsCategory;
