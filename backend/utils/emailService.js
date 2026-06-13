const nodemailer = require('nodemailer');

let transporter;

const smtpConfig = () => {
  const user = (
    process.env.BREVO_SMTP_LOGIN ||
    process.env.BREVO_USER ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ''
  ).trim();
  const pass = (
    process.env.BREVO_SMTP_KEY ||
    process.env.BREVO_SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_APP_PASSWORD ||
    ''
  ).trim();

  if (!user || !pass) {
    throw new Error('SMTP credentials are not configured.');
  }

  return {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 30000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 45000),
  };
};

const getTransporter = () => {
  if (!transporter) {
    const config = smtpConfig();
    console.log('SMTP transporter configured', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      authUser: config.auth.user,
      from:
        process.env.EMAIL_FROM ||
        process.env.BREVO_FROM_EMAIL ||
        process.env.BREVO_USER ||
        process.env.EMAIL_USER,
    });
    transporter = nodemailer.createTransport(config);
  }
  return transporter;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isAuthenticationError = (error) =>
  error?.responseCode === 535 ||
  /Invalid login|Authentication failed|Username and Password not accepted/i.test(
    error?.message || ''
  );

const sendWithRetry = async (mailOptions, context) => {
  const maxAttempts = Number(process.env.SMTP_RETRY_ATTEMPTS || 3);
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const info = await getTransporter().sendMail(mailOptions);
      console.log(`${context} email accepted by SMTP`, {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        attempt,
      });
      return { id: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`${context} email attempt ${attempt} failed:`, error.message);

      if (isAuthenticationError(error)) {
        transporter = null;
        throw new Error(
          `${context} email authentication failed. Check BREVO_SMTP_LOGIN/BREVO_USER and BREVO_SMTP_KEY in environment variables.`
        );
      }

      if (attempt < maxAttempts) {
        await delay(750 * attempt);
      }
    }
  }

  throw new Error(`${context} email failed after ${maxAttempts} attempt(s): ${lastError.message}`);
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
                  font-weight:700;letter-spacing:0;">
        LinkForge
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
          Expires in
          <strong style="color:#F1F5F9;">10 minutes</strong><br>
          Never share this code with anyone<br>
          Ignore this email if you did not sign up
        </p>
      </div>

      <p style="margin:0;color:#475569;font-size:12px;
                text-align:center;">
        Sent by LinkForge. Do not reply to this email.
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
                  font-weight:700;letter-spacing:0;">
        LinkForge
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
        Hi ${userName}, use the code below to complete your LinkForge login.
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
          Expires in
          <strong style="color:#F1F5F9;">10 minutes</strong><br>
          Never share this code with anyone<br>
          Change your password if you did not request this
        </p>
      </div>

      <p style="margin:0;color:#475569;font-size:12px;
                text-align:center;">
        Sent by LinkForge. Do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

const mailSender = () => {
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.BREVO_FROM_EMAIL ||
    process.env.BREVO_USER ||
    process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'LinkForge';

  if (!fromEmail) {
    throw new Error('EMAIL_FROM or BREVO_USER must be configured.');
  }

  return `"${fromName}" <${fromEmail}>`;
};

const sendSignupOTPEmail = async (toEmail, userName, otp) => {
  console.log('Sending signup OTP email via SMTP', { to: toEmail });
  return sendWithRetry(
    {
      from: mailSender(),
      to: toEmail,
      subject: 'LinkForge - Verify Your Email Address',
      html: getSignupEmailHTML(userName, otp),
    },
    'Signup OTP'
  );
};

const sendLoginOTPEmail = async (toEmail, userName, otp) => {
  console.log('Sending login OTP email via SMTP', { to: toEmail });
  return sendWithRetry(
    {
      from: mailSender(),
      to: toEmail,
      subject: 'LinkForge - Login Verification Code',
      html: getLoginEmailHTML(userName, otp),
    },
    'Login OTP'
  );
};

module.exports = {
  generateOTP,
  sendSignupOTPEmail,
  sendLoginOTPEmail,
};
