require("dotenv").config();
const sendVerificationEmail = require("./middlewares/alternativeEmailService");

// Test the alternative email service
async function testAlternativeEmail() {
  console.log("Testing alternative email service with fallback...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "[PROVIDED]" : "[MISSING]"
  );

  // Create a test verification code
  const testCode = Math.floor(100000 + Math.random() * 900000);

  try {
    // Try to send email to your account
    const result = await sendVerificationEmail(
      process.env.EMAIL_USER,
      testCode
    );
    console.log("Email send result:", result);
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

// Run the test
testAlternativeEmail();
