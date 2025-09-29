const pool = require('../db/database');

const STATUSES = ['pending', 'sent', 'failed'];

class EmailBroadcast {
  static async createTable() {
    const [tables] = await pool.execute("SHOW TABLES LIKE 'email_broadcasts'");
    if (tables.length > 0) {
      const [cols] = await pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'email_broadcasts'"
      );
      const have = new Set(cols.map((c) => c.COLUMN_NAME.toLowerCase()));
      const alters = [];
      if (!have.has('audience')) alters.push("ADD COLUMN audience ENUM('all','custom') DEFAULT 'all'");
      if (!have.has('recipients_json')) alters.push("ADD COLUMN recipients_json LONGTEXT");
      if (!have.has('recipient_count')) alters.push('ADD COLUMN recipient_count INT UNSIGNED DEFAULT 0');
      if (!have.has('status')) alters.push("ADD COLUMN status ENUM('pending','sent','failed') DEFAULT 'pending'");
      if (!have.has('error_message')) alters.push('ADD COLUMN error_message TEXT NULL');
      if (!have.has('created_by')) alters.push('ADD COLUMN created_by INT UNSIGNED NULL');
      if (!have.has('sent_at')) alters.push('ADD COLUMN sent_at TIMESTAMP NULL');
      if (!have.has('created_at')) alters.push('ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      if (!have.has('updated_at')) alters.push('ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      if (alters.length > 0) {
        await pool.execute(`ALTER TABLE email_broadcasts ${alters.join(', ')}`);
      }
      return;
    }

    await pool.execute(`
      CREATE TABLE email_broadcasts (
        broadcast_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        body MEDIUMTEXT NOT NULL,
        audience ENUM('all','custom') DEFAULT 'all',
        recipients_json LONGTEXT,
        recipient_count INT UNSIGNED DEFAULT 0,
        status ENUM('pending','sent','failed') DEFAULT 'pending',
        error_message TEXT NULL,
        created_by INT UNSIGNED NULL,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  static async create({ subject, body, audience, recipients, createdBy, status = 'pending' }) {
    const safeStatus = STATUSES.includes(status) ? status : 'pending';
    const recipientsJson = JSON.stringify(recipients || []);
    const [result] = await pool.execute(
      `INSERT INTO email_broadcasts
       (subject, body, audience, recipients_json, recipient_count, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subject, body, audience, recipientsJson, recipients?.length || 0, safeStatus, createdBy || null]
    );
    return result.insertId;
  }

  static async updateStatus(broadcastId, status, errorMessage = null) {
    if (!STATUSES.includes(status)) return false;
    const [result] = await pool.execute(
      `UPDATE email_broadcasts
       SET status = ?, error_message = ?, sent_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE broadcast_id = ?` ,
      [status, errorMessage, status, broadcastId]
    );
    return result.affectedRows > 0;
  }

  static async list({ page = 1, pageSize = 10, q = '' }) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset = (safePage - 1) * safeSize;
    const keyword = (q || '').trim();
    const where = keyword ? 'WHERE subject LIKE ?' : '';
    const params = keyword ? [`%${keyword}%`] : [];

    const dataSql = `
      SELECT broadcast_id, subject, audience, recipient_count, status, error_message,
             created_by, created_at, sent_at
      FROM email_broadcasts
      ${where}
      ORDER BY broadcast_id DESC
      LIMIT ${offset}, ${safeSize}`;
    const countSql = `SELECT COUNT(*) AS cnt FROM email_broadcasts ${where}`;

    const [rows] = await pool.execute(dataSql, params);
    const [countRows] = await pool.execute(countSql, params);

    return { data: rows, total: countRows[0]?.cnt || 0 };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT broadcast_id, subject, body, audience, recipients_json, recipient_count, status, error_message,
              created_by, created_at, sent_at
       FROM email_broadcasts WHERE broadcast_id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      recipients: row.recipients_json ? JSON.parse(row.recipients_json) : [],
    };
  }
}

module.exports = EmailBroadcast;
