const express = require("express");
const router = express.Router();
const PoliceReportController = require("../controllers/policeReportController");
const auth = require("../middlewares/authMiddleware");

/**
 * @route GET /api/police/reports
 * @desc Get all crime reports
 * @access Private (Police only)
 */
router.get(
  "/",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getAllReports
);

/**
 * @route GET /api/police/reports/status/:status
 * @desc Get crime reports filtered by status
 * @access Private (Police only)
 */
router.get(
  "/status/:status",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getReportsByStatus
);

/**
 * @route GET /api/police/reports/:id
 * @desc Get a single crime report by ID
 * @access Private (Police only)
 */
router.get(
  "/:id",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getReportById
);

module.exports = router;
