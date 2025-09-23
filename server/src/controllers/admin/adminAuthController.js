const pool = require('../../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const login = async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Check for admin user by username
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
    }

    // Check password
    // This assumes you have a 'password_hash' column in your 'admins' table
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
    }

    // Check if admin account is active
    if (admin.STATUS !== 'active') {
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