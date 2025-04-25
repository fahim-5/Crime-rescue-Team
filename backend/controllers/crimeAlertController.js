const CrimeAlertModel = require("../models/crimeAlertModel");
const NotificationModel = require("../models/notificationModel");
const UserModel = require("../models/userModel");

/**
 * Crime Alert Controller
 * Handles operations related to crime alerts
 */
const CrimeAlertController = {
  /**
   * Create a new crime alert
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createAlert: async (req, res) => {
    try {
      const alertData = req.body;

      // Validate required fields
      if (
        !alertData.report_id ||
        !alertData.type ||
        !alertData.location ||
        !alertData.description
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: report_id, type, location, description",
        });
      }

      // Create the alert
      const createdAlert = await CrimeAlertModel.createAlert(alertData);

      // Notify users in the same area
      await CrimeAlertController.notifyUsersInArea(createdAlert);

      return res.status(201).json({
        success: true,
        message: "Crime alert created successfully",
        data: createdAlert,
      });
    } catch (error) {
      console.error("Error creating crime alert:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create crime alert",
        error: error.message,
      });
    }
  },

  /**
   * Get all crime alerts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllAlerts: async (req, res) => {
    try {
      const options = {
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        status: req.query.status || "all",
      };

      const alerts = await CrimeAlertModel.getAllAlerts(options);

      return res.status(200).json({
        success: true,
        message: "Crime alerts retrieved successfully",
        data: alerts,
      });
    } catch (error) {
      console.error("Error retrieving crime alerts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve crime alerts",
        error: error.message,
      });
    }
  },

  /**
   * Get alerts by location
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAlertsByLocation: async (req, res) => {
    try {
      const location = req.query.location;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Location is required",
        });
      }

      console.log("Backend received location query:", location);

      // Get all alerts first
      const alerts = await CrimeAlertModel.getAlertsByLocation(location);

      console.log(
        `Found ${alerts.length} alerts matching location "${location}"`
      );

      // Log alerts for debugging
      if (alerts.length > 0) {
        console.log(
          "Alert locations:",
          alerts.map((a) => a.location).join(", ")
        );
      }

      return res.status(200).json({
        success: true,
        message: "Crime alerts retrieved successfully",
        data: alerts,
      });
    } catch (error) {
      console.error("Error retrieving crime alerts by location:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve crime alerts",
        error: error.message,
      });
    }
  },

  /**
   * Get alert by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAlertById: async (req, res) => {
    try {
      const alertId = req.params.id;
      const alert = await CrimeAlertModel.getAlertById(alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Crime alert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Crime alert retrieved successfully",
        data: alert,
      });
    } catch (error) {
      console.error("Error retrieving crime alert:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve crime alert",
        error: error.message,
      });
    }
  },

  /**
   * Update alert status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateAlertStatus: async (req, res) => {
    try {
      const alertId = req.params.id;
      const { status } = req.body;

      if (!status || !["active", "resolved"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status (active or resolved) is required",
        });
      }

      const success = await CrimeAlertModel.updateAlertStatus(alertId, status);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Crime alert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Crime alert status updated successfully",
      });
    } catch (error) {
      console.error("Error updating crime alert status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update crime alert status",
        error: error.message,
      });
    }
  },

  /**
   * Notify users in the affected area about a new crime alert
   * @param {Object} alert - The created alert
   */
  notifyUsersInArea: async (alert) => {
    try {
      // Get the location from the alert (format: District-Thana)
      const location = alert.location;

      // Find all users in that location
      const usersInArea = await UserModel.getUsersByLocation(location);

      // Create notification for each user
      for (const user of usersInArea) {
        await NotificationModel.createNotification({
          user_id: user.id,
          type: "crime_alert",
          title: `Crime Alert: ${alert.type} in your area`,
          message: alert.description,
          related_id: alert.id,
        });
      }

      console.log(
        `Notified ${usersInArea.length} users about crime alert in ${location}`
      );
    } catch (error) {
      console.error("Error sending area notifications:", error);
    }
  },
};

module.exports = CrimeAlertController;
