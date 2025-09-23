const jwt = require('jsonwebtoken');

module.exports = function adminAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
