require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { sendLoginOTPEmail } = require('../utils/emailService');

(async () => {
  try {
    const to = process.env.TEST_RECIPIENT || 'projectemaildlh@gmail.com';
    const name = 'Test User';
    const otp = '123456';
    console.log('Starting service send test', { to });
    const res = await sendLoginOTPEmail(to, name, otp);
    console.log('Service send result', res);
  } catch (err) {
    console.error('Service send failed', err && err.message);
    process.exit(1);
  }
})();
