const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true" ? true : false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "youremail@gmail.com", // your email account
    pass: process.env.EMAIL_PASS || "yourpassword", // your email password or app password
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
    from: `"Crime Rescue BD" <${
      process.env.EMAIL_USER || "youremail@gmail.com"
    }>`,
    to,
    subject: "Reset Your Password - Crime Rescue BD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #9e192d; margin-bottom: 5px;">Crime Rescue BD</h2>
          <p style="color: #666; font-size: 14px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <p>Hello ${username || "User"},</p>
          
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #9e192d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <p>This link will expire in 60 minutes for security reasons.</p>
          
          <p>If you're having trouble, please contact our support team.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    `,
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
  const mailOptions = {
    from: `"Crime Rescue BD" <${
      process.env.EMAIL_USER || "youremail@gmail.com"
    }>`,
    to,
    subject: "Your Password Has Been Changed - Crime Rescue BD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #9e192d; margin-bottom: 5px;">Crime Rescue BD</h2>
          <p style="color: #666; font-size: 14px;">Password Changed Successfully</p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
          <p>Hello ${username || "User"},</p>
          
          <p>Your password has been successfully changed.</p>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/login" style="background-color: #9e192d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Login to Your Account</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Crime Rescue BD. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    `,
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
