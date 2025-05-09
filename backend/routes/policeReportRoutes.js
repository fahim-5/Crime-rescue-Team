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
 * @route GET /api/police/reports/statistics
 * @desc Get crime reports statistics (active, solved, clearance rate)
 * @access Private (Police only)
 */
router.get(
  "/statistics",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getReportsStatistics
);

/**
 * @route GET /api/police/reports/active-count
 * @desc Get active investigations count
 * @access Private (Police only)
 */
router.get(
  "/active-count",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getActiveInvestigationsCount
);

/**
 * @route GET /api/police/reports/solved-count
 * @desc Get solved cases count
 * @access Private (Police only)
 */
router.get(
  "/solved-count",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getSolvedCasesCount
);

/**
 * @route GET /api/police/reports/clearance-rate
 * @desc Get clearance rate
 * @access Private (Police only)
 */
router.get(
  "/clearance-rate",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getClearanceRate
);

/**
 * @route GET /api/police/reports/count/:status
 * @desc Get count of reports by status
 * @access Private (Police only)
 */
router.get(
  "/count/:status",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getReportsCountByStatus
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

/**
 * @route GET /api/police/reports/pending-count
 * @desc Get pending cases count
 * @access Private (Police only)
 */
router.get(
  "/pending-count",
  auth.authenticateToken,
  auth.isPolice,
  PoliceReportController.getPendingCasesCount
);

module.exports = router;
