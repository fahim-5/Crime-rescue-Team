const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

// Ensure admin access for all routes in this file
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.isAdmin);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router; 