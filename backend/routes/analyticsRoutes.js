const express = require("express");
const router = express.Router();
const AnalyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Global stats route - Admin only
router.get("/global", authMiddleware.authenticateToken, authMiddleware.isAdmin, AnalyticsController.getGlobalStats);

// Police analytics - Police only
router.get("/police", authMiddleware.authenticateToken, authMiddleware.isPolice, AnalyticsController.getPoliceAnalytics);

// Area-based crime statistics - Accessible to all authenticated users
router.get("/area", authMiddleware.authenticateToken, AnalyticsController.getCrimeStatsByArea);

// User-specific analytics - Accessible to the authenticated user
router.get("/user", authMiddleware.authenticateToken, AnalyticsController.getUserAnalytics);

// Admin dashboard summary - Admin only
router.get("/dashboard", authMiddleware.authenticateToken, authMiddleware.isAdmin, AnalyticsController.getDashboardSummary);

module.exports = router;
