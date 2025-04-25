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
            <a href="#" style="display: inline-block; background: #9e192d; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: 500; font-size: 15px; transition: all 0.3s;">
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