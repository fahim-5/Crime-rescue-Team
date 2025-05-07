const CrimeAlertModel = require("../models/crimeAlertModel");
const NotificationModel = require("../models/notificationModel");
const UserModel = require("../models/userModel");
const ReportModel = require("../models/reportModel");
const { pool } = require("../config/db");

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
      const connection = await pool.getConnection();

      try {
        // Get the reporter's address from the crime report
        const [reportResults] = await connection.query(
          `SELECT reporter_address FROM crime_reports WHERE id = ?`,
          [alert.report_id]
        );

        if (!reportResults.length || !reportResults[0].reporter_address) {
          console.log(
            `No reporter address found for report ID ${alert.report_id}`
          );
          return;
        }

        const reporterAddress = reportResults[0].reporter_address;

        // Find all users in that location based on reporter's address
        const usersInArea = await UserModel.getUsersByLocation(reporterAddress);

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
          `Notified ${usersInArea.length} users about crime alert based on reporter address: ${reporterAddress}`
        );
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error sending area notifications:", error);
    }
  },

  /**
   * Rebuild address-based alerts for existing alerts and users
   * This is a utility function to fix any missing address-based alerts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  rebuildAddressBasedAlerts: async (req, res) => {
    try {
      const connection = await require("../config/db").pool.getConnection();

      try {
        // First check if the address_based_alerts table exists
        const [tables] = await connection.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'address_based_alerts'
        `);

        if (tables.length === 0) {
          return res.status(404).json({
            success: false,
            message:
              "The address_based_alerts table does not exist. Please run fix-database.sql first.",
          });
        }

        // Get all active crime alerts
        const [alerts] = await connection.query(`
          SELECT ca.id, ca.location, cr.location as report_location
          FROM crime_alerts ca
          JOIN crime_reports cr ON ca.report_id = cr.id
          WHERE ca.status = 'active'
        `);

        // Get all users
        const [users] = await connection.query(`
          SELECT id, address 
          FROM users 
          WHERE status = 'approved'
        `);

        console.log(
          `Found ${alerts.length} active alerts and ${users.length} users`
        );

        // Clear existing entries to avoid duplicates
        await connection.query(`TRUNCATE TABLE address_based_alerts`);

        // Insert new entries
        let insertCount = 0;

        for (const alert of alerts) {
          const location = alert.location || alert.report_location;
          if (!location) continue;

          for (const user of users) {
            const userAddress = user.address;
            if (!userAddress) continue;

            // Check if the user's address matches the alert location
            const locationMatches =
              userAddress.includes(location) || location.includes(userAddress);

            if (locationMatches) {
              await connection.query(
                `
                INSERT INTO address_based_alerts (alert_id, user_id, created_at)
                VALUES (?, ?, NOW())
              `,
                [alert.id, user.id]
              );

              insertCount++;
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: `Successfully rebuilt address-based alerts. Created ${insertCount} alerts.`,
        });
      } finally {
        if (connection) await connection.release();
      }
    } catch (error) {
      console.error("Error rebuilding address-based alerts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to rebuild address-based alerts.",
        error: error.message,
      });
    }
  },

  /**
   * Validate a crime alert (confirm or mark as false)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  validateAlert: async (req, res) => {
    try {
      const { alertId } = req.params;
      const userId = req.user.id;
      const { isValid, comment } = req.body;

      if (isValid === undefined) {
        return res.status(400).json({
          success: false,
          message: "Validation status (isValid) is required",
        });
      }

      // First, get the alert to check if it exists and to get the report ID
      const alert = await CrimeAlertModel.getAlertById(alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Crime alert not found",
        });
      }

      // Add validation to the associated report
      const result = await ReportModel.addValidation(
        alert.report_id,
        userId,
        isValid,
        comment
      );

      // Get updated validation counts
      const validations = await ReportModel.getValidationsCount(
        alert.report_id
      );
      const ALERT_THRESHOLD = 3; // Configure as needed

      // Check if we've reached the validation threshold
      if (validations.valid >= ALERT_THRESHOLD) {
        // Alert police if not already alerted
        await ReportModel.alertPolice(alert.report_id);
      }

      return res.status(200).json({
        success: true,
        message: "Alert validation recorded successfully",
        data: {
          alertId,
          isValid,
          validations,
        },
      });
    } catch (error) {
      console.error("Error validating crime alert:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to validate crime alert",
      });
    }
  },

  /**
   * Get validation counts for a crime alert
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAlertValidations: async (req, res) => {
    try {
      const { alertId } = req.params;

      // First, get the alert to check if it exists and to get the report ID
      const alert = await CrimeAlertModel.getAlertById(alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Crime alert not found",
        });
      }

      // Get validation counts for the report
      const validations = await ReportModel.getValidationsCount(
        alert.report_id
      );

      return res.status(200).json({
        success: true,
        data: {
          alert_id: alertId,
          report_id: alert.report_id,
          valid_count: validations.valid,
          invalid_count: validations.invalid,
          total_validations: validations.total,
        },
      });
    } catch (error) {
      console.error("Error fetching crime alert validations:", error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch crime alert validations",
      });
    }
  },
};

module.exports = CrimeAlertController;
