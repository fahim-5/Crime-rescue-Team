const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new crime report
router.post(
  "/",
  authMiddleware.authenticateToken, // Optional: User can be authenticated or anonymous
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  reportController.createReport
);

// Get all reports
router.get("/", reportController.getAllReports);

// Get a specific report by ID
router.get("/:id", reportController.getReportById);

// Validate a crime report (requires authentication)
router.post(
  "/:reportId/validate",
  authMiddleware.authenticateToken,
  reportController.validateCrimeReport
);

// Get nearby reports based on location
router.get("/nearby", reportController.getNearbyReports);

// Get pending police alerts (police only)
router.get(
  "/alerts",
  authMiddleware.authenticateToken,
  reportController.getPendingPoliceAlerts
);

// Respond to an alert (police only)
router.put(
  "/alerts/:alertId",
  authMiddleware.authenticateToken,
  reportController.respondToAlert
);

module.exports = router;
