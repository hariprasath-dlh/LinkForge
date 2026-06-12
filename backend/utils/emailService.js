const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for signup verification
const sendSignupOTPEmail = async (toEmail, userName, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'LinkForge'}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'LinkForge — Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0A0E1A;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:40px auto;background-color:#111827;border-radius:12px;overflow:hidden;border:1px solid #1E2D40;">
          
          <div style="background:linear-gradient(135deg,#1C2333,#0A0E1A);padding:32px;text-align:center;border-bottom:1px solid #1E2D40;">
            <h1 style="margin:0;color:#F59E0B;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
              🔨 LinkForge
            </h1>
            <p style="margin:8px 0 0;color:#94A3B8;font-size:14px;">
              Craft Short Links. Track Every Click.
            </p>
          </div>

          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:20px;font-weight:600;">
              Verify Your Email Address
            </h2>
            <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;line-height:1.6;">
              Hi ${userName}, use the OTP below to verify your email 
              address and complete your LinkForge account setup.
            </p>

            <div style="background:#1C2333;border:1px solid #F59E0B;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
                Your Verification Code
              </p>
              <div style="font-size:40px;font-weight:700;color:#F59E0B;letter-spacing:12px;font-family:'Courier New',monospace;">
                ${otp}
              </div>
            </div>

            <div style="background:#1C2333;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
                ⏱️ This OTP expires in <strong style="color:#F1F5F9;">10 minutes</strong><br>
                🔒 Never share this OTP with anyone<br>
                ❌ If you did not request this, ignore this email
              </p>
            </div>

            <p style="margin:0;color:#475569;font-size:12px;text-align:center;">
              This email was sent by LinkForge. Do not reply to this email.
            </p>
          </div>

          <div style="padding:16px 32px;background:#0A0E1A;border-top:1px solid #1E2D40;text-align:center;">
            <p style="margin:0;color:#475569;font-size:11px;">
              This project is a part of a hackathon run by 
              <a href="https://katomaran.com" style="color:#F59E0B;text-decoration:none;">
                katomaran.com
              </a>
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP email for login verification
const sendLoginOTPEmail = async (toEmail, userName, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'LinkForge'}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'LinkForge — Login Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0A0E1A;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:40px auto;background-color:#111827;border-radius:12px;overflow:hidden;border:1px solid #1E2D40;">
          
          <div style="background:linear-gradient(135deg,#1C2333,#0A0E1A);padding:32px;text-align:center;border-bottom:1px solid #1E2D40;">
            <h1 style="margin:0;color:#F59E0B;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
              🔨 LinkForge
            </h1>
            <p style="margin:8px 0 0;color:#94A3B8;font-size:14px;">
              Craft Short Links. Track Every Click.
            </p>
          </div>

          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:20px;font-weight:600;">
              Login Verification Code
            </h2>
            <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;line-height:1.6;">
              Hi ${userName}, someone is trying to login to your 
              LinkForge account. Use the OTP below to confirm it is you.
            </p>

            <div style="background:#1C2333;border:1px solid #F59E0B;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#94A3B8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
                Your Login Code
              </p>
              <div style="font-size:40px;font-weight:700;color:#F59E0B;letter-spacing:12px;font-family:'Courier New',monospace;">
                ${otp}
              </div>
            </div>

            <div style="background:#1C2333;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
                ⏱️ This OTP expires in <strong style="color:#F1F5F9;">10 minutes</strong><br>
                🔒 Never share this OTP with anyone<br>
                ❌ If you did not request this, change your password immediately
              </p>
            </div>

            <p style="margin:0;color:#475569;font-size:12px;text-align:center;">
              This email was sent by LinkForge. Do not reply to this email.
            </p>
          </div>

          <div style="padding:16px 32px;background:#0A0E1A;border-top:1px solid #1E2D40;text-align:center;">
            <p style="margin:0;color:#475569;font-size:11px;">
              This project is a part of a hackathon run by 
              <a href="https://katomaran.com" style="color:#F59E0B;text-decoration:none;">
                katomaran.com
              </a>
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendSignupOTPEmail,
  sendLoginOTPEmail,
};
