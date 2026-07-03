const nodemailer = require('nodemailer');

let transporter;
let initializing = null; // promise while transporter is being initialized

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

  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const isGmail = host.includes('gmail.com');
  const defaultPool = isGmail ? false : true;

  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    pool: process.env.SMTP_POOL === 'true' ? true : (process.env.SMTP_POOL === 'false' ? false : defaultPool),
    maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 100),
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 5000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 4000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
    logger: false,
  };
};

const getTransporter = async () => {
  if (transporter) return transporter;
  if (initializing) return initializing;

  initializing = (async () => {
    const config = smtpConfig();
    console.log('SMTP transporter configured', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      pool: config.pool,
      authUser: config.auth.user,
      from:
        process.env.EMAIL_FROM ||
        process.env.BREVO_FROM_EMAIL ||
        process.env.BREVO_USER ||
        process.env.EMAIL_USER,
      connectionTimeout: config.connectionTimeout,
      greetingTimeout: config.greetingTimeout,
      socketTimeout: config.socketTimeout,
    });

    transporter = nodemailer.createTransport(config);

    // Verify transporter but do not block for long — use configured verify timeout
    const verifyTimeout = Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 3000);
    try {
      console.log('SMTP verify: start', { verifyTimeout });
      const start = Date.now();
      await Promise.race([
        transporter.verify(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP verify timeout')), verifyTimeout)),
      ]);
      console.log('SMTP verify: success', { durationMs: Date.now() - start });
    } catch (err) {
      console.error('SMTP verify: failed', err && err.message ? err.message : err);
      // If Brevo rejects with Unauthorized IP, attempt common alternative port (2525) as a quick fallback
      const msg = (err && err.message) || '';
      if (/Unauthorized IP address|Unauthorized IP/i.test(msg) || err?.responseCode === 525) {
        const altPort = 2525;
        if (config.port !== altPort) {
          try {
            console.log(`SMTP verify: attempting fallback to port ${altPort}`);
            const altConfig = { ...config, port: altPort };
            const altTransporter = nodemailer.createTransport(altConfig);
            const startAlt = Date.now();
            await Promise.race([
              altTransporter.verify(),
              new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP verify timeout (alt)')), verifyTimeout)),
            ]);
            console.log('SMTP verify: fallback success', { port: altPort, durationMs: Date.now() - startAlt });
            transporter = altTransporter;
            return transporter;
          } catch (altErr) {
            console.error('SMTP verify: fallback failed', altErr && altErr.message ? altErr.message : altErr);
          }
        }
      }
      // If verify fails, clear transporter so it will reinit on next attempt
      transporter = null;
      throw err;
    } finally {
      initializing = null;
    }

    return transporter;
  })();

  return initializing;
};

// Expose a small health helper used by /api/health/smtp
const _healthCheck = async () => {
  const tStart = Date.now();
  const instance = await getTransporter();
  const verifyTimeout = Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 3000);
  await Promise.race([
    instance.verify(),
    new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP verify timeout')), verifyTimeout)),
  ]);
  return Date.now() - tStart;
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
      const tStart = Date.now();
      const transporterInstance = await getTransporter();

      console.log(`${context} SMTP send start`, { attempt, to: mailOptions.to });

      const perAttemptTimeout = Number(process.env.SMTP_SEND_TIMEOUT_MS || 15000);
      const sendPromise = transporterInstance.sendMail(mailOptions);

      let info;
      try {
        info = await Promise.race([
          sendPromise,
          new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP send timeout')), perAttemptTimeout)),
        ]);
      } catch (err) {
        // If send timed out, try to close transporter connection so future sends recreate it
        console.error(`${context} email attempt ${attempt} timed out after ${perAttemptTimeout}ms`);
        try {
          transporterInstance.close && transporterInstance.close();
        } catch (closeErr) {
          console.error('Error closing transporter after timeout', closeErr && closeErr.message);
        }
        transporter = null;
        throw err;
      }

      const duration = Date.now() - tStart;
      console.log(`${context} email accepted by SMTP`, {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        attempt,
        durationMs: duration,
      });
      return { id: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`${context} email attempt ${attempt} failed:`, {
        message: error && error.message,
        code: error && error.code,
        responseCode: error && error.responseCode,
        syscall: error && error.syscall,
      });

      if (isAuthenticationError(error)) {
        console.error(`${context} email authentication failure detected`);
        try {
          transporter && transporter.close && transporter.close();
        } catch (e) {}
        transporter = null;
        // Try Brevo HTTP API fallback immediately if we have an API key
        const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
        if (apiKey) {
          try {
            console.log(`${context} attempting Brevo API fallback due to auth error`);
            const apiResult = await sendViaBrevoApi(mailOptions, apiKey, context);
            console.log(`${context} Brevo API accepted email after SMTP auth failure`, apiResult);
            return { id: apiResult.id || apiResult.messageId };
          } catch (apiErr) {
            console.error(`${context} Brevo API fallback failed`, apiErr && apiErr.message);
          }
        }
        throw new Error(
          `${context} email authentication failed. Check BREVO_SMTP_LOGIN/BREVO_USER and BREVO_SMTP_KEY in environment variables.`
        );
      }

      if (attempt < maxAttempts) {
        const backoff = Number(process.env.SMTP_RETRY_BACKOFF_MS || 750) * attempt;
        console.log(`${context} will retry after ${backoff}ms`, { attempt });
        await delay(backoff);
      }
    }
  }
  // After SMTP retries exhausted, attempt Brevo HTTP API fallback if available
  const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
  if (apiKey) {
    try {
      console.log(`${context} attempting Brevo API fallback`);
      const apiResult = await sendViaBrevoApi(mailOptions, apiKey, context);
      console.log(`${context} Brevo API accepted email`, apiResult);
      return { id: apiResult.id || apiResult.messageId };
    } catch (apiErr) {
      console.error(`${context} Brevo API fallback failed`, apiErr && apiErr.message);
    }
  }

  throw new Error(`${context} email failed after ${maxAttempts} attempt(s): ${lastError && lastError.message}`);
};

// Send email via Brevo Transactional Email HTTP API as fallback
const sendViaBrevoApi = (mailOptions, apiKey, context) => {
  return new Promise((resolve, reject) => {
    try {
      const https = require('https');
      const payload = {
        sender: {},
        to: [],
        subject: mailOptions.subject || '',
        htmlContent: mailOptions.html || mailOptions.text || '',
        textContent: mailOptions.text || '',
      };

      // Parse 'from' header if present
      const from = mailOptions.from || mailSender();
      const m = /^(?:"?([^"<]+)"?\s*)?<([^>]+)>$/.exec(from);
      if (m) {
        payload.sender = { name: (m[1] || '').trim() || 'LinkForge', email: m[2].trim() };
      } else {
        payload.sender = { name: 'LinkForge', email: String(from) };
      }

      // to can be comma-separated
      const toAddrs = Array.isArray(mailOptions.to)
        ? mailOptions.to
        : String(mailOptions.to || '').split(',').map((s) => s.trim()).filter(Boolean);
      payload.to = toAddrs.map((email) => ({ email }));

      const body = JSON.stringify(payload);

      const req = https.request(
        {
          hostname: 'api.brevo.com',
          port: 443,
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'api-key': apiKey,
          },
          timeout: Number(process.env.BREVO_API_TIMEOUT_MS || 5000),
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data || '{}');
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                // Brevo returns messageId in `messageId` or `messageId` in data
                resolve({ id: parsed.messageId || parsed['messageId'] || parsed['message-id'] || null, raw: parsed });
              } else {
                const errMsg = parsed && parsed.message ? parsed.message : `Brevo API error ${res.statusCode}`;
                reject(new Error(errMsg));
              }
            } catch (parseErr) {
              reject(new Error('Failed to parse Brevo API response'));
            }
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy(new Error('Brevo API request timeout'));
      });
      req.write(body);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Generate a 6-digit OTP
// NOTE: Hardcoded to '123456' for development/demo since SMTP is not configured.
// Revert to random generation when SMTP credentials are working:
//   return Math.floor(100000 + Math.random() * 900000).toString();
const generateOTP = () => {
  return '123456';
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
