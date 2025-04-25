const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const emailService = require("../services/emailService");
const crypto = require("crypto");
const config = require("../config/config");

const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      confirmPassword,
      address,
      passport,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !username ||
      !email ||
      !national_id ||
      !mobile_no ||
      !password ||
      !confirmPassword ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: {
          full_name: !full_name,
          username: !username,
          email: !email,
          national_id: !national_id,
          mobile_no: !mobile_no,
          password: !password,
          confirmPassword: !confirmPassword,
          address: !address,
        },
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate address format
    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(address)) {
      return res.status(400).json({
        success: false,
        message:
          "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)",
      });
    }

    // Create user
    const userData = {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      address,
      passport,
      role: "public",
      status: "approved",
    };

    const newUser = await UserModel.create(userData);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);

    // Check if error has specific status and message
    if (error.status && error.message) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        fields: error.fields || [],
      });
    }

    // Check if error includes validation errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      confirmPassword,
      address,
      passport,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !username ||
      !email ||
      !national_id ||
      !mobile_no ||
      !password ||
      !confirmPassword ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: {
          full_name: !full_name,
          username: !username,
          email: !email,
          national_id: !national_id,
          mobile_no: !mobile_no,
          password: !password,
          confirmPassword: !confirmPassword,
          address: !address,
        },
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate address format
    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(address)) {
      return res.status(400).json({
        success: false,
        message:
          "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)",
      });
    }

    // Create user
    const userData = {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      address,
      passport,
      role: "admin",
      status: "approved",
    };

    const newUser = await UserModel.createAdmin(userData);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      success: true,
      message: "Admin registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);

    // Check if error has specific status and message
    if (error.status && error.message) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        fields: error.fields || [],
      });
    }

    // Check if error includes validation errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      message: "Admin registration failed. Please try again.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Log login attempt for debugging
    console.log(`Login attempt: email=${email}, role=${role}`);

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
        errorDetails: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          role: !role ? "Role selection is required" : null,
        },
      });
    }

    // Find user with case-insensitive email search
    const user = await UserModel.findByEmail(email.toLowerCase().trim());

    // User not found
    if (!user) {
      console.log(`Login failed: User with email ${email} not found`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errorCode: "user_not_found",
      });
    }

    console.log(
      `User found: id=${user.id}, role=${user.role}, status=${user.status}`
    );

    // Check account status - must be approved
    if (user.status !== "approved") {
      const statusMessages = {
        pending:
          "Your account is pending approval. Please wait for an administrator to approve your account.",
        rejected:
          "Your account has been rejected. Please contact support for more information.",
        suspended: "Your account has been suspended. Please contact support.",
      };

      console.log(`Login failed: Account status is ${user.status}`);
      return res.status(403).json({
        success: false,
        message: statusMessages[user.status] || "Account not approved",
        status: user.status,
        errorCode: "account_not_approved",
      });
    }

    // Verify role matches exactly
    if (user.role !== role.toLowerCase()) {
      console.log(
        `Login failed: Role mismatch - user has role ${user.role}, but attempted to login with role ${role}`
      );
      return res.status(403).json({
        success: false,
        message: `Access denied for ${role} role. You registered as a ${user.role}.`,
        errorCode: "role_mismatch",
        correctRole: user.role,
      });
    }

    // Verify password
    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      console.log("Login failed: Password does not match");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errorCode: "invalid_password",
      });
    }

    // Generate token with role and status
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      config.jwt.secret,
      { expiresIn: "8h" }
    );

    // Prepare user data to return (excluding sensitive info)
    const userData = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      ...(user.role === "police" && {
        police_id: user.police_id,
        badge_number: user.badge_number,
      }),
    };

    console.log(`Login successful for user ${user.id} with role ${user.role}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      errorCode: "server_error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

const registerPolice = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      confirmPassword,
      address,
      passport,
      police_id,
      station,
      rank,
      badge_number,
      joining_date,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      confirmPassword,
      address,
      police_id,
      station,
      rank,
      badge_number,
      joining_date,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for police registration",
        missingFields: missingFields.reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {}),
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate address format
    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(address)) {
      return res.status(400).json({
        success: false,
        message:
          "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)",
      });
    }

    // Validate joining date format
    if (isNaN(new Date(joining_date).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid joining date format",
      });
    }

    // Create police data object
    const policeData = {
      full_name,
      username,
      email,
      national_id,
      mobile_no,
      password,
      address,
      passport,
      police_id,
      station,
      rank,
      badge_number,
      joining_date,
    };

    // Create police officer
    const newOfficer = await UserModel.createPolice(policeData);

    // Generate token (optional - might want to skip for pending accounts)
    const token = jwt.sign(
      {
        userId: newOfficer.id,
        email: newOfficer.email,
        role: newOfficer.role,
      },
      config.jwt.secret,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      success: true,
      message: "Police registration submitted for approval",
      officer: {
        id: newOfficer.id,
        username: newOfficer.username,
        email: newOfficer.email,
        role: newOfficer.role,
        status: newOfficer.status,
        police_id: newOfficer.police_id,
        badge_number: newOfficer.badge_number,
      },
      // Include token only if you want immediate access
      // token: newOfficer.status === 'approved' ? token : undefined
    });
  } catch (error) {
    console.error("Police Registration Error:", error);

    if (error.status === 400 && error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: error.errors,
      });
    }

    if (error.status === 409) {
      return res.status(409).json({
        success: false,
        message: error.message || "Duplicate police credentials",
        details: error.details,
      });
    }

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Police registration failed",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Change password
    const result = await UserModel.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Password Change Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const { full_name, email, mobile_no, address } = req.body;

    // Validate input
    if (!full_name || !email || !mobile_no || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: {
          full_name: !full_name,
          email: !email,
          mobile_no: !mobile_no,
          address: !address,
        },
      });
    }

    // Validate address format
    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(address)) {
      return res.status(400).json({
        success: false,
        message:
          "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)",
      });
    }

    // Update user profile
    const result = await UserModel.updateProfile(userId, {
      full_name,
      email,
      mobile_no,
      address,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update profile",
      errors: error.errors,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    // Get user profile
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove sensitive information
    const { password, ...userProfile } = user;

    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    // Delete user account
    await UserModel.deleteAccount(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete account",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log(`Generating reset code for email: ${email}`);
    const result = await UserModel.generateResetCode(email);

    if (result.success) {
      // Send reset code via email
      try {
        await emailService.sendPasswordResetCode(
          result.email,
          result.fullName || result.username,
          result.resetCode
        );

        console.log("Reset code email sent successfully");
        return res.status(200).json({
          success: true,
          message: "Password reset code has been sent to your email",
          email: result.email,
        });
      } catch (emailError) {
        console.error("Error sending reset code email:", emailError);

        // If email sending fails but we're in development, return the reset code
        // This allows testing even when email service is not configured
        if (process.env.NODE_ENV === "development") {
          return res.status(200).json({
            success: true,
            message:
              "DEV MODE: Email sending failed, but reset code was generated",
            email: result.email,
            dev_reset_code: result.resetCode,
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to send reset code. Please try again later.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || "No account found with that email address",
      });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const result = await UserModel.verifyResetCode(email, code);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Verify Reset Code Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying reset code",
      error: error.message,
    });
  }
};

const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Reset the password
    const result = await UserModel.resetPasswordWithCode(
      email,
      code,
      newPassword
    );

    if (result.success) {
      // Optionally send a confirmation email
      try {
        await emailService.sendPasswordChangeConfirmationEmail(
          email,
          result.username
        );
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue anyway since password was reset successfully
      }
    }

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Reset Password With Code Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      // For security reasons, still return success even if user not found
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Hash token for storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Update user with reset token
    await user.update({
      resetToken: hashedToken,
      resetTokenExpiry,
    });

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.username || user.full_name,
      resetToken,
      resetLink
    );

    return res.status(200).json({
      success: true,
      message: "Password reset email has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
    });
  }
};

const generateTestResetToken = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log(`Generating test reset token for email: ${email}`);
    const result = await UserModel.generateResetToken(email);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Test reset token generated successfully",
        token: result.token,
        username: result.username,
        email: result.email,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to generate test reset token",
      });
    }
  } catch (error) {
    console.error("Generate Test Reset Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating test reset token",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  registerPolice,
  changePassword,
  updateProfile,
  getUserProfile,
  deleteAccount,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode,
  requestPasswordReset,
  generateTestResetToken,
};
