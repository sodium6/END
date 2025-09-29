const pool = require('../../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const login = async (req, res) => {
  const { username: rawUsername = '', password: rawPassword = '' } = req.body || {};
  const username = `${rawUsername}`.trim();
  const password = `${rawPassword}`;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Check for admin user by username
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' }); // Unauthorized
    }

    // Check password
    const storedHash = admin.password_hash || '';
    let isMatch = false;

    // Check if the stored hash is a modern bcrypt hash (starts with $2a$, $2b$, etc.)
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
      isMatch = await bcrypt.compare(password, storedHash);
    } else {
      // Fallback for legacy plain text passwords
      if (storedHash && storedHash === password) {
        isMatch = true;
        // If a legacy password matches, rehash it and update it in the database for future use.
        try {
          const newHash = await bcrypt.hash(password, 10);
          await pool.execute('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?', [newHash, admin.admin_id]);
          console.log(`[Security] Upgraded password for admin: ${admin.username}`);
        } catch (rehashErr) {
          console.warn('Failed to rehash legacy admin password:', rehashErr.message);
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' }); // Unauthorized
    }

    // Check if admin account is active
    const adminStatus = ((admin.status || admin.STATUS || '') + '').toLowerCase();
    if (adminStatus && adminStatus !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Please contact support.' }); // Forbidden
    }

    // Create JWT Payload
    const payload = {
      id: admin.admin_id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      name: admin.full_name,
    };

    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Update last_login timestamp
    await pool.execute('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE admin_id = ?', [admin.admin_id]);

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token: token,
      admin: payload
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
};
