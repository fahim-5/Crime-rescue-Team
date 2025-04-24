/**
 * Application configuration settings
 */
const emailConfig = require("./email-config");

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "crime_rescue",
    port: process.env.DB_PORT || 3306,
  },

  // JWT authentication configuration
  jwt: {
    secret: process.env.JWT_SECRET || "crime-rescue-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  // Email configuration - load from email-config.js
  email: {
    host: process.env.EMAIL_HOST || emailConfig.host,
    port: process.env.EMAIL_PORT || emailConfig.port,
    secure: process.env.EMAIL_SECURE === "true" || emailConfig.secure,
    user: process.env.EMAIL_USER || emailConfig.user,
    password: process.env.EMAIL_PASSWORD || emailConfig.password,
    from: process.env.EMAIL_FROM || emailConfig.from,
  },

  // Frontend URL for creating links
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

module.exports = config;
