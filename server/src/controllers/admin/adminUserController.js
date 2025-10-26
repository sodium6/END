const pool = require('../../db/database');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const ADMIN_ROLES = new Set(['admin', 'superadmin']);
const ADMIN_STATUSES = new Set(['active', 'suspended']);

const GENERAL_REQUIRED_FIELDS = [
  'title',
  'first_name_th',
  'last_name_th',
  'first_name_en',
  'last_name_en',
  'phone',
  'email',
  'education',
  'st_id_canonical',
  'password',
];

const buildAdminWhereClause = (q) => {
  if (!q) {
    return { sql: '', params: [] };
  }
  return {
    sql: 'WHERE full_name LIKE ? OR email LIKE ?',
    params: [`%${q}%`, `%${q}%`],
  };
};

// GET /api/admin/users
exports.listUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
  const q = (req.query.q || '').trim();

  const offset = (page - 1) * pageSize;
  const { sql: whereSql, params: whereParams } = buildAdminWhereClause(q);

  try {
    const query = `SELECT admin_id AS id, username, email, full_name, role, COALESCE(status, STATUS) AS status, created_at
                   FROM admins
                   ${whereSql}
                   ORDER BY admin_id DESC
                   LIMIT ${offset}, ${pageSize}`;

    const [rows] = await pool.execute(query, whereParams);
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS cnt FROM admins ${whereSql}`, whereParams);

    res.json({ data: rows, total: countRows[0]?.cnt || 0 });
  } catch (e) {
    console.error('listUsers error:', { message: e.message, code: e.code, errno: e.errno, sql: e.sql });
    res.status(500).json({ message: 'Failed to load users' });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT admin_id AS id, username, email, full_name, role, COALESCE(status, STATUS) AS status, created_at
       FROM admins WHERE admin_id = ?`,
      [req.params.id]
    );
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (e) {
    console.error('getUserById error:', e);
    res.status(500).json({ message: 'Failed to load user' });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  const body = req.body || {};
  const accountType = ((body.accountType || body.account_type || 'admin') + '').toLowerCase();

  if (accountType === 'general') {
    try {
      const payload = {};
      for (const field of GENERAL_REQUIRED_FIELDS) {
        payload[field] = (body[field] ?? '').toString().trim();
      }

      const passwordHash = await bcrypt.hash(payload.password, 10);
      const st_id = (body.st_id ?? '').toString().trim() || null;
      const requestedStatus = (body.status || '').toString().trim().toLowerCase();
      const status = User.VALID_STATUSES.includes(requestedStatus) ? requestedStatus : 'active';
      const approvedAt = status === 'active' ? new Date() : null;

      const [emailExists] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [payload.email]);
      if (emailExists.length > 0) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const [stidExists] = await pool.execute('SELECT id FROM users WHERE st_id_canonical = ? LIMIT 1', [payload.st_id_canonical]);
      if (stidExists.length > 0) {
        return res.status(409).json({ message: 'รหัสนักศึกษาซ้ำ' });
      }

      const [result] = await pool.execute(
        `INSERT INTO users
         (title, first_name_th, last_name_th, first_name_en, last_name_en, phone, email, education, st_id, st_id_canonical, password, status, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.title,
          payload.first_name_th,
          payload.last_name_th,
          payload.first_name_en,
          payload.last_name_en,
          payload.phone,
          payload.email,
          payload.education,
          st_id,
          payload.st_id_canonical,
          passwordHash,
          status,
          approvedAt,
        ]
      );

      return res.status(201).json({ id: result.insertId, accountType: 'general', status });
    } catch (e) {
      console.error('createGeneralUser error:', e);
      return res.status(500).json({ message: 'Failed to create general user' });
    }
  }

  const username = `${body.username ?? ''}`.trim();
  const email = `${body.email ?? ''}`.trim();
  const full_name = `${body.full_name ?? ''}`.trim();
  const password = `${body.password ?? ''}`.trim();
  const rawRole = `${body.role ?? 'admin'}`.trim().toLowerCase();
  const rawStatus = `${body.status ?? 'active'}`.trim().toLowerCase();

  if (!username || !email || !full_name || !password) {
    return res.status(400).json({ message: 'username, email, full_name, password are required' });
  }
  if (!ADMIN_ROLES.has(rawRole)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const status = ADMIN_STATUSES.has(rawStatus) ? rawStatus : 'active';

  try {
    const [[existing]] = await pool.execute(
      'SELECT username, email FROM admins WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );
    if (existing) {
      const field = existing.username === username ? 'username' : 'email';
      return res.status(409).json({ message: `An account with this ${field} already exists` });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO admins (username, email, password_hash, full_name, role, STATUS)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, rawRole, status]
    );

    res.status(201).json({ id: result.insertId, accountType: 'admin' });
  } catch (e) {
    console.error('createAdminUser error:', { message: e.message, code: e.code, errno: e.errno, sql: e.sql });
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  const { username, email, full_name, password, role, status } = req.body || {};
  try {
    const fields = [];
    const params = [];

    if (username != null) { fields.push('username = ?'); params.push(username.trim()); }
    if (email != null) { fields.push('email = ?'); params.push(email.trim()); }
    if (full_name != null) { fields.push('full_name = ?'); params.push(full_name.trim()); }
    if (role != null) {
      const normalizedRole = (role || '').toLowerCase();
      if (!ADMIN_ROLES.has(normalizedRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      fields.push('role = ?');
      params.push(normalizedRole);
    }
    if (status != null) {
      const normalizedStatus = (status || '').toLowerCase();
      if (!ADMIN_STATUSES.has(normalizedStatus)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      fields.push('STATUS = ?');
      params.push(normalizedStatus);
    }
    if (password != null && password !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      params.push(password_hash);
    }

    if (fields.length === 0) {
      return res.json({ updated: false });
    }

    params.push(req.params.id);
    const [result] = await pool.execute(
      `UPDATE admins SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
      params
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ updated: true });
  } catch (e) {
    console.error('updateUser error:', e);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM admins WHERE admin_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  } catch (e) {
    console.error('deleteUser error:', e);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
