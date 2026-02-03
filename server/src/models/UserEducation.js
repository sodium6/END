const pool = require('../db/database');

class UserEducation {
    static async createTable() {
        const createSql = `
      CREATE TABLE IF NOT EXISTS user_education (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        level VARCHAR(50) NOT NULL,
        institution VARCHAR(150) NOT NULL,
        faculty VARCHAR(150),
        program VARCHAR(150),
        start_year INT,
        end_year INT,
        gpa DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
        await pool.execute(createSql);
    }
}

module.exports = UserEducation;
