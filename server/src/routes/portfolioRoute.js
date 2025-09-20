

const userController = require("../controllers/portfolio/userController");
const workController = require("../controllers/portfolio/workController");
const activityController = require("../controllers/portfolio/activityController");
const sportController = require("../controllers/portfolio/sportController");
const { upload } = require("../middlewares/uploadPortfolioFiles");
const router = require('express').Router();
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

/* ---------------- SPORTS ---------------- */
router.get("/sports/:userId", sportController.getSports);
router.post("/sports/:userId", sportController.addSport);
router.put("/sports/:id", sportController.updateSport);
router.delete("/sports/:id", sportController.deleteSport);




module.exports = {
  path: "portfolio",
  route: router,
};
