require("dotenv").config();
const sendVerificationEmail = require("./middlewares/emailService");

// Test the email service with fallback system
async function testEmailService() {
  console.log("Testing email service with fallback system...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS
      ? "Password provided (length: " + process.env.EMAIL_PASS.length + ")"
      : "[MISSING]"
  );

  // Create a test verification code
  const testCode = Math.floor(100000 + Math.random() * 900000);

  try {
    // Try to send email to your account
    console.log(
      `Attempting to send verification email with code ${testCode}...`
    );
    const result = await sendVerificationEmail(
      process.env.EMAIL_USER,
      testCode
    );

    console.log("Email send result:", result ? "SUCCESS" : "FAILED");
    console.log(
      "\nIf using test email service (Ethereal), check the console output above for the preview URL."
    );
    console.log("If using Gmail, check your inbox for the verification email.");
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

// Run the test
testEmailService();
