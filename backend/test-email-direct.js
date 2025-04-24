require("dotenv").config();
const nodemailer = require("nodemailer");

// Log environment variables (redacted for security)
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "Password length: " + process.env.EMAIL_PASS.length
    : "[MISSING]"
);

// Create a more direct SMTP configuration instead of using service: 'gmail'
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Server connection failed:");
    console.log(error);
  } else {
    console.log("✅ Server connection verified and ready to send emails!");
    sendTestEmail();
  }
});

async function sendTestEmail() {
  try {
    console.log("Attempting to send test email...");

    const info = await transporter.sendMail({
      from: `"Crime-rescue-BD Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: "📧 Email Service Test - Direct SMTP",
      text: "This is a test email to verify the email service configuration using direct SMTP.",
      html: "<b>This is a test email to verify the email service configuration using direct SMTP.</b>",
    });

    console.log("✅ Message sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ ERROR SENDING EMAIL:");
    console.error(error);

    console.log("\n🔍 COMPLETE GMAIL APP PASSWORD SETUP GUIDE:");
    console.log("1. Go to your Google Account: https://myaccount.google.com/");
    console.log("2. Click Security");
    console.log(
      '3. Under "Signing in to Google," select 2-Step Verification - You may need to sign in'
    );
    console.log("4. At the bottom of the page, select App passwords");
    console.log(
      '5. Enter a name that helps you remember where you\'ll use the app password (e.g., "Crime-rescue-BD")'
    );
    console.log("6. Select Generate");
    console.log(
      "7. Copy the 16-character code WITHOUT SPACES and update your .env file"
    );
    console.log("8. Click Done");
  }
}
