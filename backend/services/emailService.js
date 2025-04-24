const nodemailer = require("nodemailer");
const config = require("../config/config");

/**
 * Email service to handle sending emails
 */
const emailService = {
  /**
   * Create nodemailer transporter
   */
  createTransporter: () => {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  },

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @param {string} name - User's name
   * @param {string} token - Reset token
   * @param {string} resetLink - Complete reset link
   */
  sendPasswordResetEmail: async (email, name, token, resetLink) => {
    try {
      console.log("=== Password Reset Email ===");
      console.log("To:", email);
      console.log("Name:", name);
      console.log("Token:", token);
      console.log("Reset Link:", resetLink);
      console.log("===========================");

      const transporter = emailService.createTransporter();

      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
            <h1>Password Reset</h1>
            <p>Hello ${name},</p>
            <p>You have requested to reset your password. Please click the link below to reset your password:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetLink}" style="background-color: #b4263b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px; font-size: 14px;">${resetLink}</p>
            <p>This link will expire in 60 minutes for security reasons.</p>
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            <p>Thank you,</p>
            <p>Crime Rescue Team</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  },

  /**
   * Send verification code for password reset
   * @param {string} email - User's email
   * @param {string} name - User's name
   * @param {string} code - Verification code
   */
  sendPasswordResetCode: async (email, name, code) => {
    try {
      console.log("=== Password Reset Code Email ===");
      console.log("To:", email);
      console.log("Name:", name);
      console.log("Code:", code);
      console.log("================================");

      const transporter = emailService.createTransporter();

      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: "Your Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
            <h1>Password Reset Code</h1>
            <p>Hello ${name},</p>
            <p>You have requested to reset your password. Please use the verification code below:</p>
            <div style="text-align: center; margin: 25px 0;">
              <div style="background-color: #f1f1f1; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</div>
            </div>
            <p>This code will expire in 15 minutes for security reasons.</p>
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            <p>Thank you,</p>
            <p>Crime Rescue Team</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset code email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending password reset code email:", error);
      throw error;
    }
  },

  /**
   * Send password change confirmation email
   * @param {string} email - User's email
   * @param {string} name - User's name
   */
  sendPasswordChangeConfirmationEmail: async (email, name) => {
    try {
      const transporter = emailService.createTransporter();

      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: "Password Changed Successfully",
        html: `
          <h1>Password Change Confirmation</h1>
          <p>Hello ${name},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Thank you,</p>
          <p>Crime Rescue Team</p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Password change confirmation email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending password change confirmation email:", error);
      throw error;
    }
  },
};

module.exports = emailService;
