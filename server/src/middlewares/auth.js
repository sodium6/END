// middlewares/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.admin_id) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { admin_id: payload.admin_id };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = auth;
