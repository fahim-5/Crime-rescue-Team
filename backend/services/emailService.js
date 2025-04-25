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
        subject: "🔐 Password Reset Request - Crime Rescue BD",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Follow the instructions to reset your password</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${name},</p>
              
              <p style="color: #555; line-height: 1.6;">We received a request to reset your Crime Rescue BD account password. Click the button below to proceed:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #9e192d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(158, 25, 45, 0.3);">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #777; font-size: 14px; text-align: center; margin-bottom: 25px;">
                This link expires in 60 minutes
              </p>
              
              <div style="background-color: #f8f8f8; border-left: 4px solid #9e192d; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="color: #333; margin: 0 0 5px; font-weight: 600; font-size: 14px;">Can't click the button?</p>
                <p style="color: #555; margin: 0; font-size: 13px; word-break: break-all;">
                  Copy and paste this URL into your browser:<br>
                  <span style="color: #9e192d;">${resetLink}</span>
                </p>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin-top: 25px;">
                If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
              <p style="margin: 5px 0;">For security reasons, this email was sent to you because someone requested a password reset.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Password Reset Request - Crime Rescue BD\n\nHello ${name},\n\nWe received a request to reset your Crime Rescue BD account password. Please use the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 60 minutes.\n\nIf you didn't request this password reset, please ignore this email or contact our support team if you have concerns.\n\n© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.`
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
        subject: "🔢 Your Password Reset Code - Crime Rescue BD",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Verification Code</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Use this code to reset your password</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${name},</p>
              
              <p style="color: #555; line-height: 1.6;">Please use the following verification code to reset your Crime Rescue BD account password:</p>
              
              <div style="background: #f8f8f8; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; border: 1px solid #eee;">
                <div style="display: inline-block; background: #9e192d; color: white; padding: 15px 30px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
                  ${code}
                </div>
                <p style="color: #888; font-size: 13px; margin: 15px 0 0;">
                  Valid for 15 minutes • Do not share with anyone
                </p>
              </div>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #9e192d; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="color: #333; margin: 0 0 5px; font-weight: 600; font-size: 14px;">Security Notice:</p>
                <p style="color: #555; margin: 0; font-size: 13px;">
                  If you didn't request this password reset, please ignore this email or contact our support team immediately.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
              <p style="margin: 5px 0;">This verification code was sent to you as part of a password reset request.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Password Reset Code - Crime Rescue BD\n\nHello ${name},\n\nPlease use the following verification code to reset your password:\n\n${code}\n\nThis code is valid for 15 minutes. Do not share it with anyone.\n\nIf you didn't request this password reset, please ignore this email or contact our support team immediately.\n\n© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.`
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
        subject: "✅ Password Changed Successfully - Crime Rescue BD",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Updated</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Your account security has been updated</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${name},</p>
              
              <p style="color: #555; line-height: 1.6;">Your Crime Rescue BD account password was successfully changed on ${new Date().toLocaleString()}.</p>
              
              <div style="background-color: #f8f8f8; border-left: 4px solid #4CAF50; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                <p style="color: #333; margin: 0 0 5px; font-weight: 600; font-size: 14px;">Security Tip:</p>
                <p style="color: #555; margin: 0; font-size: 13px;">
                  If you didn't make this change, please contact our support team immediately.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
              <p style="margin: 5px 0;">This email confirms recent changes to your Crime Rescue BD account.</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `Password Changed Successfully - Crime Rescue BD\n\nHello ${name},\n\nYour Crime Rescue BD account password was successfully changed on ${new Date().toLocaleString()}.\n\nIf you didn't make this change, please contact our support team immediately.\n\n© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.`
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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
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
                <a href="${config.frontendUrl}" style="display: inline-block; background: #9e192d; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: 500; font-size: 15px;">
                  Access Admin Dashboard
                </a>
              </div>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
              <p style="margin: 5px 0;">
                This email was sent to you as part of your Crime Rescue BD admin account verification.
              </p>
              <p style="margin: 5px 0;">
                © ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `Crime Rescue BD - Admin Verification\n\n🔐 Your Security Code 🔐\n\nHello Admin,\n\nTo access the Crime Rescue BD admin dashboard, please use the following verification code:\n\n${code}\n\nThis code is valid for 15 minutes. Do not share it with anyone.\n\nFor security reasons, Crime Rescue BD will never ask you for this code via phone or email.\n\n© ${new Date().getFullYear()} Crime Rescue BD - All rights reserved.`
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