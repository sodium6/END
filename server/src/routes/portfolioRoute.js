

const userController = require("../controllers/user/portfolio/userController");
const workController = require("../controllers/user/portfolio/workController");
const activityController = require("../controllers/user/portfolio/activityController");
const sportController = require("../controllers/user/portfolio/sportController");
const { upload } = require("../middlewares/uploadPortfolioFiles");
const router = require('express').Router();
const puppeteer = require("puppeteer");
// ช่วยประกอบ base URL ให้ถูก (รองรับ reverse proxy)
function getBaseUrl(req) {
  const proto = req.get("x-forwarded-proto") || req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");
  return `${proto}://${host}`;
}



/* ---------------- USERS ---------------- */
router.get("/users/:id", userController.getUserProfile);
router.put("/users/:id", userController.updateUserProfile);

// /* ---------------- WORK EXPERIENCES ---------------- */
router.get("/work/:userId", workController.getWorkByUser);
router.post("/work/:userId", workController.addWork);
router.put("/work/:id", workController.updateWork);
router.delete("/work/:id", workController.deleteWork);

// files of a work
router.post("/work/:userId/:workId/files", upload.array("files", 10), workController.uploadFiles);
router.get("/work/:userId/:workId/files", workController.listFilesByWork);
router.delete("/work/files/:fileId", workController.deleteFile);




/* ---------------- ACTIVITIES ---------------- */
router.get("/activities/:userId", activityController.getActivities);
router.post("/activities/:userId", activityController.addActivity);
router.put("/activities/:id", activityController.updateActivity);
router.delete("/activities/:id", activityController.deleteActivity);

// อัปโหลดรูปกิจกรรม
router.post("/:userId/activities/:activityId/photos", upload.array("files", 10), activityController.uploadActivityImages);

// รายการรูปของกิจกรรม
router.get("/:userId/activities/:activityId/photos", activityController.listActivityImages);

// ลบรูปกิจกรรม
router.delete("/:userId/activities/files/:imageId", activityController.deleteActivityImage);



/* ---------------- SPORTS ---------------- */
router.get("/sports/:userId", sportController.getSports);
router.post("/sports/:userId", sportController.addSport);
router.put("/sports/:id", sportController.updateSport);
router.delete("/sports/:id", sportController.deleteSport);







module.exports = {
  path: "portfolio",
  route: router,
};
