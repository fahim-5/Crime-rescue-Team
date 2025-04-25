const express = require("express");
const router = express.Router();
const crimeAlertController = require("../controllers/crimeAlertController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @route POST /api/crime-alerts
 * @description Create a new crime alert
 * @access Private
 */
router.post(
  "/",
  authMiddleware.authenticateToken,
  crimeAlertController.createAlert
);

/**
 * @route GET /api/crime-alerts
 * @description Get all crime alerts
 * @access Public
 */
router.get("/", crimeAlertController.getAllAlerts);

/**
 * @route GET /api/crime-alerts/location
 * @description Get crime alerts by location
 * @access Public
 */
router.get("/location", crimeAlertController.getAlertsByLocation);

/**
 * @route GET /api/crime-alerts/:id
 * @description Get crime alert by ID
 * @access Public
 */
router.get("/:id", crimeAlertController.getAlertById);

/**
 * @route PUT /api/crime-alerts/:id/status
 * @description Update crime alert status
 * @access Private
 */
router.put(
  "/:id/status",
  authMiddleware.authenticateToken,
  crimeAlertController.updateAlertStatus
);

module.exports = router;
