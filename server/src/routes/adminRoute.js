const express = require('express');
const router = express.Router();

const { login } = require('../controllers/admin/adminAuthController');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/admin/adminUserController');
const { getAllNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/admin/adminContentController');
const adminAuth = require('../middlewares/adminAuth-handler');
const requireRole = require('../middlewares/adminRole-handler');

// Auth
router.post('/auth/login', login);

// Protected examples
router.get('/me', adminAuth, (req, res) => res.json({ admin: req.admin }));
router.get('/only-superadmin', adminAuth, requireRole(['superadmin']), (req, res) => res.json({ ok: true }));

// Users management
router.get('/users', adminAuth, listUsers);
router.get('/users/:id', adminAuth, getUserById);
router.post('/users', adminAuth, requireRole(['superadmin']), createUser);
router.put('/users/:id', adminAuth, requireRole(['superadmin']), updateUser);
router.delete('/users/:id', adminAuth, requireRole(['superadmin']), deleteUser);

// Content management (News)
router.get('/news', adminAuth, getAllNews);
router.get('/news/:id', adminAuth, getNewsById);
router.post('/news', adminAuth, requireRole(['superadmin', 'editor']), createNews);
router.put('/news/:id', adminAuth, requireRole(['superadmin', 'editor']), updateNews);
router.delete('/news/:id', adminAuth, requireRole(['superadmin', 'editor']), deleteNews);

module.exports = {
  path: 'admin',
  route: router,
};

