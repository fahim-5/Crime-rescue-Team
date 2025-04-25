const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new crime report - with optional authentication to associate with user
router.post(
  "/",
  authMiddleware.authenticateToken,
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  reportController.createReport
);

// Get all reports
router.get("/", reportController.getAllReports);

// Get nearby reports based on location (must be before :id route)
router.get("/nearby", reportController.getNearbyReports);

// Get reports by authenticated user (must be before :id route)
router.get(
  "/user",
  authMiddleware.authenticateToken,
  reportController.getUserReports
);

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

// Get a specific report by ID (must be after /nearby and /alerts routes)
router.get("/:id", reportController.getReportById);

// Update a report (requires authentication)
router.put(
  "/:id",
  authMiddleware.authenticateToken,
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  reportController.updateReport
);

// Delete a report (requires authentication)
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  reportController.deleteReport
);

// Validate a crime report (requires authentication)
router.post(
  "/:reportId/validate",
  authMiddleware.authenticateToken,
  reportController.validateCrimeReport
);

module.exports = router;
