require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a reusable transporter with direct SMTP settings for Gmail
const createTransporter = async () => {
  // First attempt - direct SMTP configuration
  try {
    // Direct method with explicit configuration
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify the connection
    await transport.verify();
    console.log("✅ Email service connected successfully using direct SMTP!");
    return transport;
  } catch (error) {
    console.log("⚠️ Gmail SMTP error:", error.message);

    // Fallback - use a fake testing account
    console.log(
      "⚠️ Using fake testing email account - emails won't be delivered to real recipients"
    );
    const testAccount = await nodemailer.createTestAccount();
    const testTransport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return testTransport;
  }
};

// Transporter will be initialized when the first email is sent
let transporter = null;

const sendVerificationEmail = async (toEmail, code) => {
  // Initialize transporter if it doesn't exist
  if (!transporter) {
    transporter = await createTransporter();
  }

  const mailOptions = {
    from: `"Crime Rescue BD Security" <${
      process.env.EMAIL_USER || "noreply@crime-rescue-bd.com"
    }>`,
    to: toEmail,
    subject: "🚨 Your Admin Access Code for Crime Rescue BD!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background-color: #9e192d; padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome Back, Admin!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Your secure access to Crime Rescue BD is just one step away</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 20px;">🔑 Your Exclusive Verification Code</h2>
          <p style="color: #555; line-height: 1.6; font-size: 15px;">
            We're excited to have you back in the Crime Rescue BD command center! To ensure maximum security for our community, please use this special access code:
          </p>
          
          <div style="background-color: #f9f9f9; border: 2px dashed #9e192d; padding: 20px; margin: 25px 0; text-align: center; border-radius: 6px;">
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #9e192d; font-family: 'Courier New', monospace;">${code}</p>
            <p style="margin: 10px 0 0; font-size: 13px; color: #777;">⏳ Expires in 15 minutes</p>
          </div>
          
          <div style="background-color: #fff8f8; border-left: 4px solid #9e192d; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <p style="color: #d32f2f; margin: 0; font-size: 14px; font-weight: 600; display: flex; align-items: center;">
              <span style="margin-right: 8px;">🔒</span> Security Alert
            </p>
            <p style="color: #555; line-height: 1.5; font-size: 14px; margin: 8px 0 0;">
              For your protection, never share this code. Our team will <strong>never</strong> ask for it via phone, SMS, or other channels. 
              This code is your personal key to keeping our community safe!
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="#" style="background-color: #9e192d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block; margin-bottom: 20px;">
              Return to Crime Rescue BD
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
            <p style="margin: 5px 0;">Thank you for helping us maintain a secure platform for crime prevention.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Crime Rescue BD. Protecting our community together.</p>
          </div>
        </div>
      </div>
    `,
    text: `Crime Rescue BD - Admin Verification\n\n🔐 Your Secure Access Code 🔐\n\nHello Admin!\n\nWe're excited to have you back in the Crime Rescue BD command center! Here's your exclusive verification code:\n\n${code}\n\n⚠️ IMPORTANT:\n- Code expires in 15 minutes\n- Never share this code with anyone\n- Our team will NEVER ask for this code\n\nReturn to Crime Rescue BD to continue your important work!\n\n© ${new Date().getFullYear()} Crime Rescue BD - Protecting our community together.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`🔥 Verification email sent to ${toEmail}`);

    // If using ethereal/test email, provide preview URL
    if (info.messageId && info.messageId.includes("ethereal")) {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Error sending admin verification email:", error);
    return false;
  }
};

module.exports = sendVerificationEmail;
