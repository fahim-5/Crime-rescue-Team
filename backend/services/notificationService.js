const NotificationModel = require("../models/notificationModel");
const { pool } = require("../config/db");

/**
 * Notification Service
 * Provides notification functionality for use across the application
 */
const NotificationService = {
  /**
   * Send a notification to a user
   * @param {Object} data - Notification data
   * @param {number|string} data.userId - The ID of the user to notify
   * @param {string} data.type - Type of notification (alert, warning, info, success)
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {number|string} [data.relatedId] - Optional ID of related entity
   * @returns {Promise<Object>} The created notification
   */
  sendNotification: async (data) => {
    try {
      // Validate required fields
      if (!data.userId || !data.type || !data.title || !data.message) {
        throw new Error("Missing required notification data");
      }

      // Validate type
      const validTypes = ["alert", "warning", "info", "success"];
      if (!validTypes.includes(data.type)) {
        throw new Error(
          `Invalid notification type. Must be one of: ${validTypes.join(", ")}`
        );
      }

      // Create the notification
      return await NotificationModel.createNotification({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.relatedId || null,
      });
    } catch (error) {
      console.error("Notification service error:", error);
      throw error;
    }
  },

  /**
   * Send a notification to multiple users
   * @param {Array<number|string>} userIds - Array of user IDs to notify
   * @param {Object} notificationData - Notification data (type, title, message, relatedId)
   * @returns {Promise<Array>} Array of created notifications
   */
  sendBulkNotifications: async (userIds, notificationData) => {
    try {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("Must provide at least one user ID");
      }

      // Create notifications for each user
      const notifications = [];
      for (const userId of userIds) {
        const notification = await NotificationService.sendNotification({
          userId,
          ...notificationData,
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Bulk notification service error:", error);
      throw error;
    }
  },

  /**
   * Get all public user IDs from the database
   * @param {string} [excludeUserId] - User ID to exclude from the results
   * @returns {Promise<Array<number|string>>} Array of user IDs
   */
  getAllUserIds: async (excludeUserId = null) => {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT id FROM users
        WHERE role = 'public'
      `;

      const params = [];
      if (excludeUserId) {
        query += ` AND id != ?`;
        params.push(excludeUserId);
      }

      const [users] = await connection.execute(query, params);
      return users.map((user) => user.id);
    } catch (error) {
      console.error("Error fetching user IDs:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Get all admin user IDs from the database
   * @returns {Promise<Array<number|string>>} Array of admin user IDs
   */
  getAllAdminIds: async () => {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT id FROM users
        WHERE role = 'admin'
      `;

      const [admins] = await connection.execute(query, []);
      return admins.map((admin) => admin.id);
    } catch (error) {
      console.error("Error fetching admin IDs:", error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },

  /**
   * Send a notification to all admin users
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {string} [data.type] - Type of notification (alert, warning, info, success) - defaults to "alert"
   * @param {string} [data.relatedId] - Optional ID of related entity (report ID, case ID, etc.)
   * @returns {Promise<Array>} Array of created notifications
   */
  notifyAllAdmins: async (data) => {
    try {
      if (!data.title || !data.message) {
        throw new Error("Missing required notification data");
      }

      // Get all admin user IDs
      const adminIds = await NotificationService.getAllAdminIds();
      
      if (adminIds.length === 0) {
        return [];
      }
      
      // Prepare notification data for admins
      const notificationData = {
        type: data.type || "alert",
        title: data.title,
        message: data.message,
        relatedId: data.relatedId || null
      };
      
      // Send notifications to all admin users
      return await NotificationService.sendBulkNotifications(
        adminIds,
        notificationData
      );
    } catch (error) {
      console.error("Error sending admin notifications:", error);
      throw error;
    }
  },

  /**
   * Send a notification about a new report to all users
   * @param {Object} data - Report notification data
   * @param {string} data.reportId - ID of the report
   * @param {string} data.location - Location of the incident
   * @param {string} data.crimeType - Type of crime
   * @param {string} [data.reporterId] - ID of the user who created the report (will be excluded from notification)
   * @param {string} [data.message] - Custom message to override the default one
   * @returns {Promise<Array>} Array of created notifications
   */
  notifyAllUsersAboutNewReport: async (data) => {
    try {
      if (!data.reportId || !data.location || !data.crimeType) {
        throw new Error("Missing required report data");
      }

      // Get all public user IDs, excluding the reporter
      const userIds = await NotificationService.getAllUserIds(data.reporterId);

      // Don't get admin IDs here, to avoid duplicate notifications
      // Admin notifications are now sent separately in reportController
      
      if (userIds.length === 0) {
        return [];
      }

      // Prepare notification data for public users
      const publicNotificationData = {
        type: "info",
        title: "New Crime Report",
        message:
          data.message ||
          `A new report about ${data.crimeType} in ${data.location} has been submitted. Stay safe!`,
        relatedId: data.reportId,
      };

      // Send notifications to all public users only
      return await NotificationService.sendBulkNotifications(
        userIds,
        publicNotificationData
      );
    } catch (error) {
      console.error("Error sending community notifications:", error);
      throw error;
    }
  },

  /**
   * Send a report-related notification
   * @param {Object} data - Report notification data
   * @param {number|string} data.userId - User ID to notify
   * @param {string} data.reportId - ID of the report
   * @param {string} data.action - Action performed (created, updated, validated, etc.)
   * @param {string} [data.details] - Additional details
   * @returns {Promise<Object>} Created notification
   */
  sendReportNotification: async (data) => {
    let title, message, type;

    switch (data.action) {
      case "created":
        title = "Report Submitted";
        message = `Your crime report #${
          data.reportId
        } has been submitted successfully${
          data.details ? ": " + data.details : "."
        }`;
        type = "success";
        break;
      case "updated":
        title = "Report Updated";
        message = `Your crime report #${data.reportId} has been updated${
          data.details ? ": " + data.details : "."
        }`;
        type = "info";
        break;
      case "validated":
        title = "Report Validated";
        message = `Your crime report #${
          data.reportId
        } has been validated by community members${
          data.details ? ": " + data.details : "."
        }`;
        type = "success";
        break;
      case "investigating":
        title = "Investigation Started";
        message = `Police have started investigating your report #${
          data.reportId
        }${data.details ? ": " + data.details : "."}`;
        type = "info";
        break;
      case "resolved":
        title = "Case Resolved";
        message = `Your report #${data.reportId} has been marked as resolved${
          data.details ? ": " + data.details : "."
        }`;
        type = "success";
        break;
      case "requires_info":
        title = "Additional Information Needed";
        message = `Police need more information for your report #${
          data.reportId
        }${data.details ? ": " + data.details : "."}`;
        type = "warning";
        break;
      default:
        title = "Report Update";
        message = `Your report #${data.reportId} has been updated${
          data.details ? ": " + data.details : "."
        }`;
        type = "info";
    }

    return await NotificationService.sendNotification({
      userId: data.userId,
      type,
      title,
      message,
      relatedId: data.reportId,
    });
  },

  /**
   * Send an account-related notification
   * @param {Object} data - Account notification data
   * @param {number|string} data.userId - User ID to notify
   * @param {string} data.action - Action performed (created, password_changed, etc.)
   * @param {string} [data.details] - Additional details
   * @returns {Promise<Object>} Created notification
   */
  sendAccountNotification: async (data) => {
    let title, message, type;

    switch (data.action) {
      case "created":
        title = "Account Created";
        message = `Your account has been created successfully${
          data.details ? ": " + data.details : "."
        }`;
        type = "success";
        break;
      case "password_changed":
        title = "Password Changed";
        message =
          "Your account password has been changed. If you did not make this change, please contact support immediately.";
        type = "warning";
        break;
      case "profile_updated":
        title = "Profile Updated";
        message = `Your profile information has been updated${
          data.details ? ": " + data.details : "."
        }`;
        type = "info";
        break;
      case "login_attempt":
        title = "New Login";
        message = `A new login was detected on your account${
          data.details ? " from " + data.details : "."
        }`;
        type = "info";
        break;
      default:
        title = "Account Update";
        message = `Your account has been updated${
          data.details ? ": " + data.details : "."
        }`;
        type = "info";
    }

    return await NotificationService.sendNotification({
      userId: data.userId,
      type,
      title,
      message,
    });
  },
};

module.exports = NotificationService;
