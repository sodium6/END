const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function dumpSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        const [tables] = await pool.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log("--- START SCHEMA DUMP ---");
        for (const tableName of tableNames) {
            const [createResult] = await pool.query(`SHOW CREATE TABLE \`${tableName}\``);
            console.log(createResult[0]['Create Table'] + ";\n");
        }
        console.log("--- END SCHEMA DUMP ---");

    } catch (err) {
        console.error('Schema dump failed:', err);
    } finally {
        await pool.end();
    }
}

dumpSchema();
