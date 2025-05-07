const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// Route to award points to a user
router.post(
  "/:userId/award-points",
  authMiddleware.authenticateToken,
  userController.awardPoints
);

// Route to get user points
router.get(
  "/:userId/points",
  authMiddleware.authenticateToken,
  userController.getUserPoints
);

module.exports = router;
