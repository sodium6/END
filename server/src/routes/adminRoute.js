const express = require('express');
const router = express.Router();

const { login, deleteAdmin } = require('../controllers/admin/adminAuthController');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/admin/adminUserController');
const { listBroadcasts, sendBroadcast } = require('../controllers/admin/adminEmailController');
const { getAllNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/admin/adminContentController');
const { listMembers, getMemberById: getMember, updateMemberStatus, resetMemberPassword, deleteMember } = require('../controllers/admin/memberController');
const { getSummary: getAnalyticsSummary } = require('../controllers/admin/adminAnalyticsController');

const { subscribersSummary, broadcastNews, broadcastBulk, } = require('../controllers/admin/Email/emailController');

const adminAuth = require('../middlewares/adminAuth-handler');
const requireRole = require('../middlewares/adminRole-handler');

// Auth
router.post('/auth/login', login);
router.delete('/auth/me', adminAuth, deleteAdmin);

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


// สรุป subscribers
router.get(
  '/email/subscribers/summary',
  adminAuth,
  requireRole(['superadmin', 'admin']),
  subscribersSummary
);

// ส่งข่าวเดี่ยว
router.post(
  '/news/:id/broadcast',
  adminAuth,
  requireRole(['superadmin', 'admin']),
  broadcastNews
);

// ส่งหลายข่าว
router.post(
  '/email/broadcast',
  adminAuth,
  requireRole(['superadmin', 'admin']),
  broadcastBulk
);


router.get("/api/portfolio/:id/pdf", async (req, res) => {
  const { id } = req.params;
  const { tpl, personal, works, activities, sports, userId } = req.query;

  try {
    const base = getBaseUrl(req);

    // สร้าง URL ของหน้า view จริง (ที่ใช้ Template + PRINT_CSS เดิม)
    // ปรับ path ให้ตรงกับ route ในแอปคุณ
    const viewUrl = `${base}/my-portfolio/view?tpl=${encodeURIComponent(
      tpl || "template1"
    )}&userId=${encodeURIComponent(userId || id)}
      &personal=${personal || "1"}&works=${works || "1"}&activities=${activities || "1"}&sports=${sports || "1"}`;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new",
    });

    const page = await browser.newPage();

    // ถ้ามี auth/token ต้องใส่ header หรือคุกกี้ตรงนี้ (ถ้าจำเป็น)
    // await page.setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });

    await page.goto(viewUrl, { waitUntil: "networkidle0", timeout: 120000 });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="portfolio-${id}.pdf"`
    );
    return res.end(pdf);
  } catch (e) {
    console.error("PDF export failed:", e);
    return res.status(500).json({ message: "pdf_export_failed" });
  }
});

module.exports = {
  path: 'admin',
  route: router,
};
