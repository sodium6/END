module.exports = (roles = []) => (req, res, next) => {
    if (!roles.length) return next();
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
  