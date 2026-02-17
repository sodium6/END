const pool = require('../db/database');

class UserSocial {
    static async createTable() {
        const createSql = `
      CREATE TABLE IF NOT EXISTS user_socials (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        platform VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
        await pool.execute(createSql);
    }
}

module.exports = UserSocial;
