require("dotenv").config();
const emailService = require("../services/emailService");

// Use a Map to store verification codes with email as key
const verificationCodes = new Map();

const generateVerificationCode = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  // Generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with expiration (15 minutes)
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  try {
    // Send email using the unified email service
    await emailService.sendVerificationEmail(email, code);
    console.log(`Admin verification code sent to ${email}: ${code}`);
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("Failed to send verification email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send verification email." });
  }
};

const verifyCode = (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email and verification code are required.",
    });
  }

  const stored = verificationCodes.get(email);

  if (!stored) {
    return res.status(400).json({
      success: false,
      message: "No verification code found for this email.",
    });
  }

  if (stored.code !== code) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification code.",
    });
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({
      success: false,
      message: "Verification code has expired.",
    });
  }

  // Clean up and proceed
  verificationCodes.delete(email);
  next();
};

module.exports = { generateVerificationCode, verifyCode };
