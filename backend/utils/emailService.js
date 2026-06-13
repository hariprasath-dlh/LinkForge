const { Resend } = require('resend');

// Initialize Resend client
// Resend uses HTTPS — never blocked by Render free plan
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'RESEND_API_KEY environment variable is not set. ' +
      'Please add it to your .env file and Render environment.'
    );
  }
  return new Resend(process.env.RESEND_API_KEY);
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
    console.log('Attempting to send signup OTP email to:', toEmail);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: 'LinkForge <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'LinkForge — Verify Your Email Address',
      html: getSignupEmailHTML(userName, otp),
    });

    if (error) {
      console.error('Resend API error on signup:', JSON.stringify(error));
      throw new Error('Resend error: ' + JSON.stringify(error));
    }

    console.log('Signup OTP email sent successfully. ID:', data?.id);
    return data;
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
    console.log('Attempting to send login OTP email to:', toEmail);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: 'LinkForge <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'LinkForge — Login Verification Code',
      html: getLoginEmailHTML(userName, otp),
    });

    if (error) {
      console.error('Resend API error on login:', JSON.stringify(error));
      throw new Error('Resend error: ' + JSON.stringify(error));
    }

    console.log('Login OTP email sent successfully. ID:', data?.id);
    return data;
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
