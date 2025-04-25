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

  /**
   * Send admin verification email
   * @param {string} toEmail - Admin's email
   * @param {string} code - Verification code
   */
  sendVerificationEmail: async (toEmail, code) => {
    try {
      console.log("=== Admin Verification Email ===");
      console.log("To:", toEmail);
      console.log("Code:", code);
      console.log("================================");

      const transporter = emailService.createTransporter();

      const mailOptions = {
        from: config.email.from,
        to: toEmail,
        subject: "🔐 Your Secure Admin Access Code - Crime Rescue BD",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 30px; text-align: center;">
              <img src="https://via.placeholder.com/80x80?text=CRBD" alt="Crime Rescue BD Logo" style="height: 80px; width: 80px; border-radius: 50%; border: 3px solid white; margin-bottom: 15px;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">Admin Portal Access</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 16px;">Secure verification required</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #333; margin: 0 0 10px; font-size: 22px;">Your Security Code</h2>
                <p style="color: #666; margin: 0; font-size: 15px; line-height: 1.5;">
                  Use this one-time code to access the Crime Rescue BD admin dashboard
                </p>
              </div>
              
              <div style="background: #f8f8f8; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; border: 1px solid #eee;">
                <div style="display: inline-block; background: #9e192d; color: white; padding: 15px 30px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #888; font-size: 13px; margin: 15px 0 0;">
                  Valid for 15 minutes • Do not share with anyone
                </p>
              </div>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #9e192d; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="color: #333; margin: 0 0 8px; font-weight: 600; font-size: 15px;">
                  <span style="color: #9e192d;">⚠️ Security Notice:</span>
                </p>
                <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.5;">
                  For your security, this code will expire shortly. Crime Rescue BD will never ask you for this code via phone or email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${
                  config.frontendUrl
                }" style="display: inline-block; background: #9e192d; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: 500; font-size: 15px; transition: all 0.3s;">
                  Access Admin Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eaeaea;">
              <p style="margin: 5px 0;">
                This email was sent to you as part of your Crime Rescue BD admin account verification.
              </p>
              <p style="margin: 5px 0;">
                © ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `Crime Rescue BD - Admin Verification\n\n🔐 Your Security Code 🔐\n\nHello Admin,\n\nTo access the Crime Rescue BD admin dashboard, please use the following verification code:\n\n${code}\n\nThis code is valid for 15 minutes. Do not share it with anyone.\n\nFor security reasons, Crime Rescue BD will never ask you for this code via phone or email.\n\n© ${new Date().getFullYear()} Crime Rescue BD - All rights reserved.`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`🔥 Verification email sent to ${toEmail}`);
      return info;
    } catch (error) {
      console.error("❌ Error sending admin verification email:", error);
      throw error;
    }
  },
};

module.exports = emailService;
