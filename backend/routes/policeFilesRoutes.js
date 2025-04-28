const express = require("express");
const router = express.Router();
const policeFilesController = require("../controllers/policeFilesController");
const { authenticateToken, isAdmin, isPolice } = require("../middlewares/authMiddleware");

// Get police officer by ID - accessible by both admin and police roles
router.get(
  "/:id",
  authenticateToken,
  (req, res, next) => {
    // Allow both admin and police roles
    if (req.user.role === "admin" || req.user.role === "police") {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Access denied. Requires admin or police role",
    });
  },
  policeFilesController.getPoliceOfficerById
);

module.exports = router;