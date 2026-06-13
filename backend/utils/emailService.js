const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter for Brevo SMTP
const getTransporter = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  // In production, we must use Brevo SMTP Relay
  if (isProduction) {
    const user = process.env.BREVO_USER || process.env.EMAIL_USER;
    const pass = process.env.BREVO_SMTP_KEY || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error('Brevo SMTP credentials are not set.');
    }

    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 10000, // 10 seconds timeout
    });
  }

  // In local development, use Gmail SMTP as a working fallback
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 10000, // 10 seconds timeout
    });
  }

  // Fallback to Brevo local key if Gmail is not configured
  const brevoUser = process.env.BREVO_USER;
  const brevoPass = process.env.BREVO_SMTP_KEY;

  if (brevoUser && brevoPass) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: brevoUser,
        pass: brevoPass,
      },
      connectionTimeout: 10000,
    });
  }

  throw new Error('No valid SMTP credentials found for local development.');
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup OTP email template
const getSignupEmailHTML = (userName, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A0E1A;
             font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;
              background-color:#111827;border-radius:12px;
              overflow:hidden;border:1px solid #1E2D40;">

    <div style="background:linear-gradient(135deg,#1C2333,#0A0E1A);
                padding:32px;text-align:center;
                border-bottom:1px solid #1E2D40;">
      <h1 style="margin:0;color:#F59E0B;font-size:28px;
                  font-weight:700;letter-spacing:-0.5px;">
        🔨 LinkForge
      </h1>
      <p style="margin:8px 0 0;color:#94A3B8;font-size:14px;">
        Craft Short Links. Track Every Click.
      </p>
    </div>

    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#F1F5F9;
                  font-size:20px;font-weight:600;">
        Verify Your Email Address
      </h2>
      <p style="margin:0 0 24px;color:#94A3B8;
                font-size:14px;line-height:1.6;">
        Hi ${userName}, use the OTP below to verify your
        email address and complete your LinkForge account setup.
      </p>

      <div style="background:#1C2333;border:2px solid #F59E0B;
                  border-radius:12px;padding:32px;
                  text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#94A3B8;font-size:12px;
                    text-transform:uppercase;letter-spacing:2px;">
          Your Verification Code
        </p>
        <div style="font-size:48px;font-weight:700;
                    color:#F59E0B;letter-spacing:20px;
                    font-family:'Courier New',monospace;">
          ${otp}
        </div>
      </div>

      <div style="background:#1C2333;border-radius:8px;
                  padding:16px;margin-bottom:24px;
                  border-left:4px solid #F59E0B;">
        <p style="margin:0;color:#94A3B8;
                  font-size:13px;line-height:2;">
          ⏱️ Expires in
          <strong style="color:#F1F5F9;">10 minutes</strong><br>
          🔒 Never share this code with anyone<br>
          ❌ Ignore this email if you did not sign up
        </p>
      </div>

      <p style="margin:0;color:#475569;font-size:12px;
                text-align:center;">
        Sent by LinkForge. Do not reply to this email.
      </p>
    </div>

    <div style="padding:16px 32px;background:#0A0E1A;
                border-top:1px solid #1E2D40;text-align:center;">
      <p style="margin:0;color:#475569;font-size:11px;">
        This project is a part of a hackathon run by
        <a href="https://katomaran.com"
           style="color:#F59E0B;text-decoration:none;">
          katomaran.com
        </a>
      </p>
    </div>

  </div>
</body>
</html>
`;

// Login OTP email template
const getLoginEmailHTML = (userName, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A0E1A;
             font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;
              background-color:#111827;border-radius:12px;
              overflow:hidden;border:1px solid #1E2D40;">

    <div style="background:linear-gradient(135deg,#1C2333,#0A0E1A);
                padding:32px;text-align:center;
                border-bottom:1px solid #1E2D40;">
      <h1 style="margin:0;color:#F59E0B;font-size:28px;
                  font-weight:700;letter-spacing:-0.5px;">
        🔨 LinkForge
      </h1>
      <p style="margin:8px 0 0;color:#94A3B8;font-size:14px;">
        Craft Short Links. Track Every Click.
      </p>
    </div>

    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#F1F5F9;
                  font-size:20px;font-weight:600;">
        Login Verification Code
      </h2>
      <p style="margin:0 0 24px;color:#94A3B8;
                font-size:14px;line-height:1.6;">
        Hi ${userName}, someone is trying to login to your
        LinkForge account. Use the code below to confirm
        it is you.
      </p>

      <div style="background:#1C2333;border:2px solid #F59E0B;
                  border-radius:12px;padding:32px;
                  text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 12px;color:#94A3B8;font-size:12px;
                    text-transform:uppercase;letter-spacing:2px;">
          Your Login Code
        </p>
        <div style="font-size:48px;font-weight:700;
                    color:#F59E0B;letter-spacing:20px;
                    font-family:'Courier New',monospace;">
          ${otp}
        </div>
      </div>

      <div style="background:#1C2333;border-radius:8px;
                  padding:16px;margin-bottom:24px;
                  border-left:4px solid #F59E0B;">
        <p style="margin:0;color:#94A3B8;
                  font-size:13px;line-height:2;">
          ⏱️ Expires in
          <strong style="color:#F1F5F9;">10 minutes</strong><br>
          🔒 Never share this code with anyone<br>
          ❌ Change your password if you did not request this
        </p>
      </div>

      <p style="margin:0;color:#475569;font-size:12px;
                text-align:center;">
        Sent by LinkForge. Do not reply to this email.
      </p>
    </div>

    <div style="padding:16px 32px;background:#0A0E1A;
                border-top:1px solid #1E2D40;text-align:center;">
      <p style="margin:0;color:#475569;font-size:11px;">
        This project is a part of a hackathon run by
        <a href="https://katomaran.com"
           style="color:#F59E0B;text-decoration:none;">
          katomaran.com
        </a>
      </p>
    </div>

  </div>
</body>
</html>
`;

// Send OTP email for signup verification
const sendSignupOTPEmail = async (toEmail, userName, otp) => {
  try {
    console.log('Attempting to send signup OTP email via Brevo SMTP to:', toEmail);

    const transporter = getTransporter();
    const fromEmail = process.env.BREVO_USER || process.env.EMAIL_USER || 'hariprasathdlhdlh@gmail.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'LinkForge';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: 'LinkForge — Verify Your Email Address',
      html: getSignupEmailHTML(userName, otp),
    });

    console.log('Signup OTP email sent successfully. Message ID:', info.messageId);
    return { id: info.messageId };
  } catch (error) {
    console.error('sendSignupOTPEmail failed:', error.message);
    throw new Error(
      'Failed to send verification email: ' + error.message
    );
  }
};

// Send OTP email for login verification
const sendLoginOTPEmail = async (toEmail, userName, otp) => {
  try {
    console.log('Attempting to send login OTP email via Brevo SMTP to:', toEmail);

    const transporter = getTransporter();
    const fromEmail = process.env.BREVO_USER || process.env.EMAIL_USER || 'hariprasathdlhdlh@gmail.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'LinkForge';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: 'LinkForge — Login Verification Code',
      html: getLoginEmailHTML(userName, otp),
    });

    console.log('Login OTP email sent successfully. Message ID:', info.messageId);
    return { id: info.messageId };
  } catch (error) {
    console.error('sendLoginOTPEmail failed:', error.message);
    throw new Error(
      'Failed to send login OTP email: ' + error.message
    );
  }
};

module.exports = {
  generateOTP,
  sendSignupOTPEmail,
  sendLoginOTPEmail,
};
