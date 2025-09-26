const express = require('express');
const router = express.Router();

const { login } = require('../controllers/admin/adminAuthController');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/admin/adminUserController');
const { listBroadcasts, sendBroadcast } = require('../controllers/admin/adminEmailController');
const { getAllNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/admin/adminContentController');
const { listMembers, getMemberById: getMember, updateMemberStatus, resetMemberPassword, deleteMember } = require('../controllers/admin/memberController');
const { getSummary: getAnalyticsSummary } = require('../controllers/admin/adminAnalyticsController');
const adminAuth = require('../middlewares/adminAuth-handler');
const requireRole = require('../middlewares/adminRole-handler');

// Auth
router.post('/auth/login', login);

// Protected examples
router.get('/me', adminAuth, (req, res) => res.json({ admin: req.admin }));
router.get('/only-superadmin', adminAuth, requireRole(['superadmin']), (req, res) => res.json({ ok: true }));

// Admin accounts management
router.get('/users', adminAuth, requireRole(['superadmin', 'admin']), listUsers);
router.get('/users/:id', adminAuth, requireRole(['superadmin', 'admin']), getUserById);
router.post('/users', adminAuth, requireRole(['superadmin']), createUser);
router.put('/users/:id', adminAuth, requireRole(['superadmin']), updateUser);
router.delete('/users/:id', adminAuth, requireRole(['superadmin']), deleteUser);

// General members management
router.get('/members', adminAuth, requireRole(['superadmin', 'admin']), listMembers);
router.get('/members/:id', adminAuth, requireRole(['superadmin', 'admin']), getMember);
router.patch('/members/:id/status', adminAuth, requireRole(['superadmin', 'admin']), updateMemberStatus);
router.post('/members/:id/reset-password', adminAuth, requireRole(['superadmin', 'admin']), resetMemberPassword);
router.delete('/members/:id', adminAuth, requireRole(['superadmin', 'admin']), deleteMember);

// Analytics
router.get('/analytics/summary', adminAuth, requireRole(['superadmin', 'admin']), getAnalyticsSummary);

// Email broadcast
router.get('/email/broadcasts', adminAuth, requireRole(['superadmin']), listBroadcasts);
router.post('/email/broadcasts', adminAuth, requireRole(['superadmin']), sendBroadcast);

// Content management (News)
router.get('/news', adminAuth, requireRole(['superadmin', 'admin']), getAllNews);
router.get('/news/:id', adminAuth, requireRole(['superadmin', 'admin']), getNewsById);
router.post('/news', adminAuth, requireRole(['superadmin', 'admin']), createNews);
router.put('/news/:id', adminAuth, requireRole(['superadmin', 'admin']), updateNews);
router.delete('/news/:id', adminAuth, requireRole(['superadmin', 'admin']), deleteNews);

module.exports = {
  path: 'admin',
  route: router,
};
