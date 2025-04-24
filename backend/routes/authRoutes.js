const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const authMiddleware = require("../middlewares/authMiddleware");
const UserModel = require("../models/userModel");

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

// Forgot Password route
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
  ],
  validateRequest,
  authController.forgotPassword
);

// Verify reset code route
router.post(
  "/verify-reset-code",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("code")
      .notEmpty()
      .withMessage("Verification code is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits")
      .isNumeric()
      .withMessage("Verification code must contain only numbers"),
  ],
  validateRequest,
  authController.verifyResetCode
);

// Reset password with code route
router.post(
  "/reset-password-with-code",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("code")
      .notEmpty()
      .withMessage("Verification code is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits")
      .isNumeric()
      .withMessage("Verification code must contain only numbers"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  validateRequest,
  authController.resetPasswordWithCode
);

// For development only - Test reset code generation
if (process.env.NODE_ENV === "development") {
  router.get("/dev/generate-reset-code/:email", async (req, res) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const result = await UserModel.generateResetCode(email);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Test reset code generated",
          email: result.email,
          username: result.username,
          resetCode: result.resetCode,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || "Failed to generate test code",
        });
      }
    } catch (error) {
      console.error("Test code generation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error generating test code",
      });
    }
  });
}

module.exports = router;
