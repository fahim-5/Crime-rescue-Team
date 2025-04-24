const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/signup",
  [
    body("full_name").trim().notEmpty().withMessage("Full name is required"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("national_id")
      .trim()
      .notEmpty()
      .withMessage("National ID is required"),
    body("mobile_no")
      .trim()
      .notEmpty()
      .withMessage("Mobile number is required")
      .isMobilePhone()
      .withMessage("Invalid mobile number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm Password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required")
      .matches(/^[a-zA-Z\s]+-[a-zA-Z\s]+$/)
      .withMessage("Address format: District-Thana"),
  ],
  validateRequest,
  authController.registerUser
);

router.post(
  "/admin/signup",
  [
    body("full_name").trim().notEmpty().withMessage("Full name is required"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("national_id")
      .trim()
      .notEmpty()
      .withMessage("National ID is required"),
    body("mobile_no")
      .trim()
      .notEmpty()
      .withMessage("Mobile number is required")
      .isMobilePhone()
      .withMessage("Invalid mobile number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm Password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required")
      .matches(/^[a-zA-Z\s]+-[a-zA-Z\s]+$/)
      .withMessage("Address format: District-Thana"),
  ],
  validateRequest,
  authController.registerAdmin
);

// Add to your existing authRoutes.js file
router.post(
  "/police/signup",
  [
    body("full_name").trim().notEmpty().withMessage("Full name is required"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("national_id")
      .trim()
      .notEmpty()
      .withMessage("National ID is required"),
    body("mobile_no")
      .trim()
      .notEmpty()
      .withMessage("Mobile number is required")
      .isMobilePhone()
      .withMessage("Invalid mobile number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm Password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required")
      .matches(/^[a-zA-Z\s]+-[a-zA-Z\s]+$/)
      .withMessage("Address format: District-Thana"),
    body("police_id").trim().notEmpty().withMessage("Police ID is required"),
    body("station").trim().notEmpty().withMessage("Police station is required"),
    body("rank").trim().notEmpty().withMessage("Rank is required"),
    body("badge_number")
      .trim()
      .notEmpty()
      .withMessage("Badge number is required"),
    body("joining_date")
      .notEmpty()
      .withMessage("Joining date is required")
      .isISO8601()
      .withMessage("Invalid date format (YYYY-MM-DD)"),
  ],
  validateRequest,
  authController.registerPolice
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    body("role").isIn(["public", "police", "admin"]),
  ],
  validateRequest,
  authController.loginUser
);

// Password change route (requires authentication)
router.post(
  "/change-password",
  authMiddleware.authenticateToken,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  validateRequest,
  authController.changePassword
);

// Add the profile update and get user profile routes
router.put(
  "/profile",
  authMiddleware.authenticateToken,
  authController.updateProfile
);
router.get(
  "/profile",
  authMiddleware.authenticateToken,
  authController.getUserProfile
);

// Delete account route (requires authentication)
router.delete(
  "/account",
  authMiddleware.authenticateToken,
  authController.deleteAccount
);

module.exports = router;
