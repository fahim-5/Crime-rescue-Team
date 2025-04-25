const NotificationModel = require("../models/notificationModel");
const NotificationService = require("../services/notificationService");
const { validationResult } = require("express-validator");

/**
 * Notification Controller
 * Handles notification-related operations
 */
const NotificationController = {
  /**
   * Get all notifications for the authenticated user
   */
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get pagination parameters
      const limit = parseInt(req.query.limit) || 30; // Default 30 items per page
      const offset = parseInt(req.query.offset) || 0;
      const includeRead = req.query.includeRead === "true"; // Default to only unread

      // Fetch notifications from the database
      const notifications = await NotificationModel.getUserNotifications(
        userId,
        {
          limit,
          offset,
          includeRead,
        }
      );

      // Return success response
      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: {
          notifications,
          count: notifications.length,
          pagination: {
            limit,
            offset,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
        error: error.message,
      });
    }
  },

  /**
   * Get count of unread notifications for the authenticated user
   */
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;

      // Fetch unread count
      const unreadCount = await NotificationModel.countUnreadNotifications(
        userId
      );

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error("Error counting unread notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to count unread notifications",
        error: error.message,
      });
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (req, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      // Mark notification as read - always pass userId
      const success = await NotificationModel.markAsRead(
        notificationId,
        userId
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Notification not found or already read",
        });
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      // Mark all notifications as read
      const success = await NotificationModel.markAsRead("all", userId);

      // Return success response
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
        error: error.message,
      });
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (req, res) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      // Delete the notification - add userId for proper authorization
      const success = await NotificationModel.deleteNotification(
        notificationId,
        userId
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  },

  /**
   * Create a test notification (for development/testing only)
   */
  createTestNotification: async (req, res) => {
    try {
      const { user_id, type, title, message } = req.body;

      if (!user_id || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: user_id, type, title, message",
        });
      }

      // Create notification
      const notification = await NotificationModel.createNotification({
        user_id,
        type,
        title,
        message,
        related_id: req.body.related_id || null,
      });

      // Return success response
      res.status(201).json({
        success: true,
        message: "Test notification created successfully",
        data: notification,
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test notification",
        error: error.message,
      });
    }
  },

  /**
   * Create a new notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created notification
   */
  createNotification: async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Extract notification data from request body
      const { user_id, type, title, message, related_id } = req.body;

      // Create notification in the database
      const notification = await NotificationModel.createNotification({
        user_id,
        type,
        title,
        message,
        related_id,
      });

      return res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create notification",
      });
    }
  },
};

module.exports = NotificationController;
