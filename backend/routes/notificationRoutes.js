const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

// All notification routes require authentication
router.use(authMiddleware.authenticateToken);

/**
 * @route GET /api/notifications
 * @description Get user's notifications
 * @access Private
 */
router.get("/", notificationController.getUserNotifications);

/**
 * @route GET /api/notifications/unread
 * @description Get count of unread notifications
 * @access Private
 */
router.get("/unread", notificationController.getUnreadCount);

/**
 * @route PUT /api/notifications/:id/read
 * @description Mark a specific notification as read
 * @access Private
 */
router.put("/:id/read", notificationController.markAsRead);

/**
 * @route PUT /api/notifications/all/read
 * @description Mark all user's notifications as read
 * @access Private
 */
router.put("/all/read", notificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @description Delete a specific notification
 * @access Private
 */
router.delete("/:id", notificationController.deleteNotification);

/**
 * @route POST /api/notifications
 * @description Create a test notification (for development/testing only)
 * @access Private
 */
router.post("/", notificationController.createTestNotification);

module.exports = router;
