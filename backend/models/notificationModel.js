const { pool } = require("../config/db");

/**
 * Simple logging utility
 */
const log = {
  info: (message) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
  error: (message) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
};

/**
 * Notification Data Model
 * Handles all database operations related to user notifications
 */
const NotificationModel = {
  /**
   * Create a new notification
   * @param {Object} data - Notification data object
   * @param {string} data.user_id - ID of the user receiving the notification
   * @param {string} data.type - Type of notification (alert, warning, info, success)
   * @param {string} data.title - Title of the notification
   * @param {string} data.message - Detailed message for the notification
   * @param {string} data.related_id - Optional ID of related entity (report ID, case ID, etc.)
   * @returns {Promise<Object>} Created notification object
   * @throws {Error} If database operation fails
   */
  createNotification: async (data) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO notifications 
          (user_id, type, title, message, related_id) 
        VALUES 
          (?, ?, ?, ?, ?)
      `;

      const values = [
        data.user_id,
        data.type,
        data.title,
        data.message,
        data.related_id || null,
      ];

      const [result] = await connection.execute(query, values);

      if (!result.insertId) {
        throw new Error("Failed to create notification");
      }

      return {
        id: result.insertId,
        ...data,
        read: false,
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      log.error(`Database error in createNotification: ${err.message}`);
      throw new Error("Failed to create notification. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get notifications for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of notifications to return
   * @param {number} options.offset - Number of notifications to skip
   * @param {boolean} options.includeRead - Whether to include read notifications
   * @returns {Promise<Array>} Array of notification objects
   * @throws {Error} If database operation fails
   */
  getUserNotifications: async (userId, options = {}) => {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          id, 
          user_id,
          type,
          title,
          message,
          related_id,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
      `;

      const values = [userId];

      // Filter by read status if specified
      if (options.includeRead === false) {
        query += " AND is_read = 0";
      }

      // Order by creation date, newest first
      query += " ORDER BY created_at DESC";

      // Apply limit and offset if specified
      if (options.limit) {
        query += " LIMIT ?";
        values.push(parseInt(options.limit, 10));

        if (options.offset) {
          query += " OFFSET ?";
          values.push(parseInt(options.offset, 10));
        }
      }

      const [notifications] = await connection.execute(query, values);

      // Format dates and boolean values
      return notifications.map((notification) => ({
        ...notification,
        is_read: Boolean(notification.is_read),
        created_at: notification.created_at.toISOString(),
      }));
    } catch (err) {
      log.error(`Database error in getUserNotifications: ${err.message}`);
      throw new Error("Failed to fetch notifications. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Mark notification(s) as read
   * @param {string} notificationId - Notification ID or 'all' to mark all for a user
   * @param {string} userId - User ID (required when marking all as read)
   * @returns {Promise<Boolean>} Success status
   * @throws {Error} If database operation fails
   */
  markAsRead: async (notificationId, userId) => {
    const connection = await pool.getConnection();
    try {
      let query;
      let values;

      if (notificationId === "all") {
        // Mark all notifications as read for a specific user
        query = `
          UPDATE notifications
          SET is_read = 1
          WHERE user_id = ? AND is_read = 0
        `;
        values = [userId];
      } else {
        // Mark a specific notification as read
        // Also check user_id to ensure proper authorization
        query = `
          UPDATE notifications
          SET is_read = 1
          WHERE id = ? AND user_id = ?
        `;
        values = [notificationId, userId];
      }

      const [result] = await connection.execute(query, values);

      return result.affectedRows > 0;
    } catch (err) {
      log.error(`Database error in markAsRead: ${err.message}`);
      throw new Error(
        "Failed to mark notification as read. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Delete notification(s)
   * @param {string} notificationId - Notification ID or 'all' to delete all for a user
   * @param {string} userId - User ID (required when deleting all)
   * @returns {Promise<Boolean>} Success status
   * @throws {Error} If database operation fails
   */
  deleteNotification: async (notificationId, userId) => {
    const connection = await pool.getConnection();
    try {
      let query;
      let values;

      if (notificationId === "all") {
        // Delete all notifications for a specific user
        query = `
          DELETE FROM notifications
          WHERE user_id = ?
        `;
        values = [userId];
      } else {
        // Delete a specific notification
        // Also check user_id to ensure proper authorization
        query = `
          DELETE FROM notifications
          WHERE id = ? AND user_id = ?
        `;
        values = [notificationId, userId];
      }

      const [result] = await connection.execute(query, values);

      return result.affectedRows > 0;
    } catch (err) {
      log.error(`Database error in deleteNotification: ${err.message}`);
      throw new Error("Failed to delete notification. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Count unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Number>} Count of unread notifications
   * @throws {Error} If database operation fails
   */
  countUnreadNotifications: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? AND is_read = 0
      `;

      const [result] = await connection.execute(query, [userId]);

      return result[0].count;
    } catch (err) {
      log.error(`Database error in countUnreadNotifications: ${err.message}`);
      throw new Error("Failed to count notifications. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },
};

module.exports = NotificationModel;
