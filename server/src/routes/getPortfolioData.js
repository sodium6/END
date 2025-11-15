const GetPortfolioController = require('../controllers/user/porttemplate/getPortfolioData.js');
const router = require('express').Router();
const puppeteer = require("puppeteer");
const FRONTEND_BASE =
  process.env.FRONTEND_BASE_URL || "http://localhost:5173";


function getBaseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host  = req.get('x-forwarded-host')  || req.get('host');
  return `${proto}://${host}`;
}

// ---------- 1) ดึงข้อมูล JSON ----------
router.get("/data/:userId", GetPortfolioController.getPortfolioData);

// ---------- 2) สร้าง / ดาวน์โหลด PDF ----------
router.get("/:userId/pdf", async (req, res) => {   // 👈 เปลี่ยนมาใช้ /data/:userId/pdf
 const { userId } = req.params;
  const {
    tpl = "template1",
    personal = "1",
    works = "1",
    activities = "1",
    sports = "1",
  } = req.query;

  try {
    // 👇 ตรงนี้สำคัญ: ใช้ path เดียวกับที่คุณเปิดใน browser
    // ถ้าหน้าคุณคือ localhost:5173/template/view ให้ใช้ /template/view
    // ถ้าเป็น localhost:5173/my-portfolio/view ก็เปลี่ยนตามนั้น
    const viewUrl =
      `${FRONTEND_BASE}/template/view` +
      `?tpl=${encodeURIComponent(tpl)}` +
      `&userId=${encodeURIComponent(userId)}` +
      `&personal=${personal}&works=${works}&activities=${activities}&sports=${sports}`;

    console.log("PDF viewUrl =", viewUrl); // ช่วย debug

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(viewUrl, { waitUntil: "networkidle0", timeout: 120000 });

    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="portfolio-${userId}.pdf"`
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    res.status(500).json({ message: "pdf_export_failed" });
  }
});

module.exports = {
  path: 'data',
  route: router,
};
