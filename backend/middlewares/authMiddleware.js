const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const config = require("../config/config");

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // Allow the request to continue without authentication
      // Just don't set req.user, leaving it undefined
      console.log(
        "No authentication token provided - continuing as anonymous user"
      );
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Auth Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginMiddleware = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if the user has a stored password
    if (!user.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT Token with a secure expiration time
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: "2h" }
    );

    // Store user data in request for further use
    req.token = token;
    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

const logoutMiddleware = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "An error occurred during logout." });
  }
};

const isAdmin = (req, res, next) => {
  // Ensure user exists and has been authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Check if user has admin role
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }

  next();
};

const isPolice = (req, res, next) => {
  // Ensure user exists and has been authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Check if user has police role
  if (req.user.role !== "police") {
    return res
      .status(403)
      .json({ message: "Access denied. Police role required." });
  }

  next();
};

module.exports = {
  authenticateToken,
  loginMiddleware,
  logoutMiddleware,
  isAdmin,
  isPolice,
};
