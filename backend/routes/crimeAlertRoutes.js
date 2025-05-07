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

/**
 * @route POST /api/crime-alerts/:alertId/validate
 * @description Validate a crime alert (confirm or mark as false)
 * @access Private (requires authentication)
 */
router.post(
  "/:alertId/validate",
  authMiddleware.authenticateToken,
  crimeAlertController.validateAlert
);

/**
 * @route GET /api/crime-alerts/:alertId/validations
 * @description Get validation counts for a crime alert
 * @access Private (requires authentication)
 */
router.get(
  "/:alertId/validations",
  authMiddleware.authenticateToken,
  crimeAlertController.getAlertValidations
);

/**
 * @route POST /api/crime-alerts/rebuild-address-alerts
 * @description Rebuild all address-based alerts
 * @access Private (Admin only)
 */
router.post(
  "/rebuild-address-alerts",
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles(["admin"]),
  crimeAlertController.rebuildAddressBasedAlerts
);

module.exports = router;
