const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDbState() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("--- DB STATE CHECK ---");

        // Check 1: Activities Schema for preference_level
        const [actCols] = await pool.query("SHOW COLUMNS FROM activities LIKE 'preference_level'");
        console.log("activities.preference_level exists?", actCols.length > 0);

        // Check 2: News Schema for category_id
        const [newsCols] = await pool.query("SHOW COLUMNS FROM news LIKE 'category_id'");
        console.log("news.category_id exists?", newsCols.length > 0);

        // Check 3: NewsCategories table existence
        const [ncTable] = await pool.query("SHOW TABLES LIKE 'news_categories'");
        console.log("news_categories table exists?", ncTable.length > 0);

        // Check 4: Row Counts
        const tables = ['users', 'news', 'activities', 'work_experiences', 'sports', 'certificates', 'news_categories'];
        console.log("\n--- ROW COUNTS (Live DB) ---");
        for (const t of tables) {
            try {
                const [rows] = await pool.query(`SELECT COUNT(*) as count FROM \`${t}\``);
                console.log(`${t}: ${rows[0].count}`);
            } catch (e) {
                console.log(`${t}: ERROR/MISSING`);
            }
        }

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await pool.end();
    }
}

checkDbState();
