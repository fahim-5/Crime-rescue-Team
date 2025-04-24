const express = require("express");
const router = express.Router();
const policeController = require("../controllers/policeController");
const authMiddleware = require("../middlewares/authMiddleware");

// Ensure all police routes are protected
router.use(authMiddleware.authenticateToken, authMiddleware.isPolice);

// Dashboard statistics for police
router.get("/dashboard", policeController.getDashboardStats);

// Get cases assigned to the police officer
router.get("/cases", policeController.getAssignedCases);

// Get pending cases that need police attention
router.get("/pending-cases", policeController.getPendingCases);

// Get resolved cases by the police officer
router.get("/resolved-cases", policeController.getResolvedCases);

// Update case status by police
router.put("/update-case/:alertId", policeController.updateCaseStatus);

// Add notes or updates to a case
router.post("/case-notes/:alertId", policeController.addCaseNotes);

// Get detailed information about a specific case
router.get("/case/:alertId", policeController.getCaseDetails);

// Search for cases based on criteria
router.get("/search", policeController.searchCases);

// Get case analytics for police
router.get("/analytics", policeController.getPoliceAnalytics);

// Get crime statistics by area (for police)
router.get("/crime-stats", policeController.getCrimeStatsByArea);

module.exports = router;
