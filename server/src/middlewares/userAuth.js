// middlewares/userAuth.js
const jwt = require('jsonwebtoken');

module.exports = function userAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // สมมติ payload มี { id, email, ... } (หรือ user_id)
    req.user = {
      id: payload.id ?? payload.user_id,   // ให้มี id เสมอ
      email: payload.email,
    };
    if (!req.user.id) return res.status(401).json({ message: 'unauthorized' });
    next();
  } catch {
    return res.status(401).json({ message: 'invalid_token' });
  }
};
