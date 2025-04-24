/**
 * Email Setup Helper
 * This script helps set up email credentials for the password reset feature
 * To use: node setup-email.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

// Path to .env file
const envPath = path.join(__dirname, ".env");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Load existing .env file if it exists
let envConfig = {};
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envConfig = dotenv.parse(envContent);
    console.log("Loaded existing .env configuration");
  }
} catch (error) {
  console.error("Error loading .env file:", error.message);
}

// Instructions for Gmail App Passwords
const instructions = `
=== GMAIL APP PASSWORD SETUP INSTRUCTIONS ===

For Gmail accounts, you need to set up an App Password:

1. Go to your Google account settings: https://myaccount.google.com/
2. Select "Security" in the left sidebar
3. Under "How you sign in to Google", select "2-Step Verification" and make sure it's enabled
4. Go back to the Security page and select "App passwords" (you may need to sign in again)
5. Select "Mail" as the app and "Other" as the device, name it "Crime Rescue App"
6. Google will generate a 16-character app password, copy this password
7. Use this app password below instead of your regular Gmail password
`;

console.log(instructions);

// Ask for email information
function getEmailInfo() {
  rl.question("\nEnter your Gmail address: ", (email) => {
    envConfig.EMAIL_USER = email;

    rl.question("Enter your Gmail app password: ", (password) => {
      envConfig.EMAIL_PASSWORD = password;

      // Additional email settings
      envConfig.EMAIL_HOST = "smtp.gmail.com";
      envConfig.EMAIL_PORT = "587";
      envConfig.EMAIL_SECURE = "false";
      envConfig.EMAIL_FROM = `Crime Rescue <${email}>`;

      // Save to .env file
      saveEnvFile();
    });
  });
}

// Save configuration to .env file
function saveEnvFile() {
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ Email configuration saved to .env file");

  // Provide next steps
  console.log("\nNext steps:");
  console.log("1. Restart your server: npm run dev");
  console.log("2. Try the password reset feature again");
  console.log(
    "3. If you still encounter issues, make sure the app password is correct\n"
  );

  rl.close();
}

// Start the setup process
getEmailInfo();
