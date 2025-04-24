const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

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
      process.env.JWT_SECRET,
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
      process.env.JWT_SECRET,
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

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    // Find user with case-insensitive email search
    const user = await UserModel.findByEmail(email.toLowerCase().trim());

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check account status - must be approved
    if (user.status !== "approved") {
      const statusMessages = {
        pending: "Your account is pending approval",
        rejected: "Your account has been rejected",
      };
      return res.status(403).json({
        success: false,
        message: statusMessages[user.status] || "Account not approved",
        status: user.status,
      });
    }

    // Verify role matches exactly
    if (user.role !== role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Access denied for ${role} role`,
      });
    }

    // Verify password
    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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
      process.env.JWT_SECRET,
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
      process.env.JWT_SECRET,
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

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  registerPolice,
  changePassword,
  updateProfile,
  getUserProfile,
  deleteAccount,
};
