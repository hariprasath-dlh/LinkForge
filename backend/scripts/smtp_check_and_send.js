const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dns = require('dns');
const net = require('net');
const nodemailer = require('nodemailer');

const HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.BREVO_SMTP_LOGIN || process.env.BREVO_USER || process.env.EMAIL_USER;
const PASS = process.env.BREVO_SMTP_KEY || process.env.BREVO_SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD;
const FROM = process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL || process.env.BREVO_USER || process.env.EMAIL_USER;
const TO = process.env.TEST_RECIPIENT || 'projectemaildlh@gmail.com';

const log = (...args) => console.log(new Date().toISOString(), ...args);

const dnsLookup = (host, timeout = 3000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('DNS lookup timeout')), timeout);
    dns.lookup(host, { family: 0 }, (err, address, family) => {
      clearTimeout(timer);
      if (err) return reject(err);
      resolve({ address, family });
    });
  });

const tcpConnect = (host, port, timeout = 4000) =>
  new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    const onError = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };
    socket.setTimeout(timeout, () => onError(new Error('TCP connect timeout')));
    socket.once('error', onError);
    socket.connect(port, host, () => {
      if (settled) return;
      settled = true;
      const local = socket.address();
      socket.end();
      resolve({ local });
    });
  });

const verifyTransporter = async (transporter, timeout = 3000) => {
  const start = Date.now();
  await Promise.race([
    transporter.verify(),
    new Promise((_, rej) => setTimeout(() => rej(new Error('transporter.verify timeout')), timeout)),
  ]);
  return Date.now() - start;
};

const sendTestMail = async (transporter, mailOptions, timeout = 5000) => {
  const start = Date.now();
  const sendPromise = transporter.sendMail(mailOptions);
  const info = await Promise.race([
    sendPromise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('sendMail timeout')), timeout)),
  ]);
  return { info, durationMs: Date.now() - start };
};

(async () => {
  try {
    log('SMTP Test starting');
    log('Config', { HOST, PORT, USER: USER ? USER.replace(/(.{2}).+(@|$)/, '$1***$2') : null, FROM, TO });

    // DNS lookup
    try {
      const dnsRes = await dnsLookup(HOST, 3000);
      log('DNS lookup success', dnsRes);
    } catch (err) {
      log('DNS lookup failed', err.message);
    }

    // TCP connect
    try {
      const connRes = await tcpConnect(HOST, PORT, 4000);
      log('TCP connect success', connRes);
    } catch (err) {
      log('TCP connect failed', err.message);
    }

    if (!USER || !PASS || !FROM) {
      log('Missing SMTP credentials or FROM address. Aborting send test.');
      process.exit(2);
    }

    const config = {
      host: HOST,
      port: PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: USER, pass: PASS },
      pool: process.env.SMTP_POOL === 'false' ? false : true,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 5000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 4000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
    };

    log('Creating transporter', { config: { host: config.host, port: config.port, secure: config.secure, pool: config.pool } });
    const transporter = nodemailer.createTransport(config);

    try {
      const verifyMs = await verifyTransporter(transporter, Number(process.env.SMTP_VERIFY_TIMEOUT_MS || 3000));
      log('transporter.verify succeeded', { verifyMs });
    } catch (err) {
      log('transporter.verify failed', err.message);
    }

    const mailOptions = {
      from: FROM,
      to: TO,
      subject: 'LinkForge SMTP test',
      text: 'This is a test email from LinkForge SMTP check script.',
    };

    try {
      const { info, durationMs } = await sendTestMail(transporter, mailOptions, Number(process.env.SMTP_SEND_TIMEOUT_MS || 5000));
      log('sendMail succeeded', { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, durationMs });
      process.exit(0);
    } catch (err) {
      log('sendMail failed', err.message);
      try { transporter.close && transporter.close(); } catch (e) {}
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error in SMTP test', err);
    process.exit(3);
  }
})();
