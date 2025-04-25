const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true" ? true : false,
  auth: {
    user: process.env.EMAIL_USER || "youremail@gmail.com",
    pass: process.env.EMAIL_PASS || "yourpassword",
  },
});

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} username - User's username
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendPasswordResetEmail = async (to, resetToken, username) => {
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Crime Rescue BD" <${process.env.EMAIL_USER || "youremail@gmail.com"}>`,
    to,
    subject: "🔐 Password Reset Request - Crime Rescue BD",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Assistance</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Reset your Crime Rescue BD account password</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${username || "User"},</p>
          
          <p style="color: #555; line-height: 1.6;">We received a request to reset your Crime Rescue BD account password. Click the button below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #9e192d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(158, 25, 45, 0.3);">
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
              <span style="color: #9e192d;">${resetUrl}</span>
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
    text: `Password Reset Request - Crime Rescue BD\n\nHello ${username || "User"},\n\nWe received a request to reset your Crime Rescue BD account password. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 60 minutes.\n\nIf you didn't request this password reset, please ignore this email or contact our support team if you have concerns.\n\n© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Send a password change confirmation email
 * @param {string} to - Recipient email address
 * @param {string} username - User's username
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendPasswordChangeConfirmationEmail = async (to, username) => {
  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;

  const mailOptions = {
    from: `"Crime Rescue BD" <${process.env.EMAIL_USER || "youremail@gmail.com"}>`,
    to,
    subject: "✅ Password Changed Successfully - Crime Rescue BD",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #9e192d 0%, #6e0f1d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Updated</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Your Crime Rescue BD account security has been updated</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">Hello ${username || "User"},</p>
          
          <p style="color: #555; line-height: 1.6;">Your Crime Rescue BD account password was successfully changed on ${new Date().toLocaleString()}.</p>
          
          <div style="background-color: #f8f8f8; border-left: 4px solid #4CAF50; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <p style="color: #333; margin: 0 0 5px; font-weight: 600; font-size: 14px;">Security Tip:</p>
            <p style="color: #555; margin: 0; font-size: 13px;">
              If you didn't make this change, please contact our support team immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #9e192d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block; box-shadow: 0 2px 8px rgba(158, 25, 45, 0.3);">
              Sign In to Your Account
            </a>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
          <p style="margin: 5px 0;">This email confirms recent changes to your Crime Rescue BD account.</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Password Changed Successfully - Crime Rescue BD\n\nHello ${username || "User"},\n\nYour Crime Rescue BD account password was successfully changed on ${new Date().toLocaleString()}.\n\nIf you didn't make this change, please contact our support team immediately.\n\nYou can now sign in to your account using your new password.\n\n© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password change confirmation email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password change confirmation email:", error);
    throw error;
  }
};

// Verify the transporter connection on startup
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email service is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email service verification failed:", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
  verifyConnection,
};