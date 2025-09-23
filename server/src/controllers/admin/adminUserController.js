const pool = require('../../db/database');
const bcrypt = require('bcryptjs');

// GET /api/admin/users
// Query: page, pageSize, q
exports.listUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '10', 10)));
  const q = (req.query.q || '').trim();

  const offset = (page - 1) * pageSize;

  const whereSql = q
    ? `WHERE full_name LIKE ? OR email LIKE ?`
    : '';
  const whereParams = q ? [`%${q}%`, `%${q}%`] : [];

  try {
    const [rows] = await pool.execute(
      `SELECT admin_id AS id, username, email, full_name, role, COALESCE(status, STATUS) AS status, created_at
       FROM admins
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM admins ${whereSql}`,
      whereParams
    );

    res.json({ data: rows, total: countRows[0]?.cnt || 0 });
  } catch (e) {
    console.error('listUsers error:', e);
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
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    console.error('getUserById error:', e);
    res.status(500).json({ message: 'Failed to load user' });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  const { username, email, full_name, password, role = 'viewer', status = 'active' } = req.body || {};
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ message: 'username, email, full_name, password are required' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO admins (username, email, password_hash, full_name, role, STATUS)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, role, status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    console.error('createUser error:', e);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  const { username, email, full_name, password, role, status } = req.body || {};
  try {
    const fields = [];
    const params = [];
    if (username != null) { fields.push('username = ?'); params.push(username); }
    if (email != null) { fields.push('email = ?'); params.push(email); }
    if (full_name != null) { fields.push('full_name = ?'); params.push(full_name); }
    if (role != null) { fields.push('role = ?'); params.push(role); }
    if (status != null) { fields.push('STATUS = ?'); params.push(status); }
    if (password != null && password !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      params.push(password_hash);
    }
    if (fields.length === 0) return res.json({ updated: false });

    params.push(req.params.id);
    const [result] = await pool.execute(
      `UPDATE admins SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?`,
      params
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ updated: true });
  } catch (e) {
    console.error('updateUser error:', e);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.execute(`DELETE FROM admins WHERE admin_id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (e) {
    console.error('deleteUser error:', e);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Admin User Management Controller
