require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fetch = global.fetch || require('node-fetch');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linkforge';
const BASE = 'http://localhost:5000/api';

const email = process.env.TEST_RECIPIENT || 'projectemaildlh+flowtest@gmail.com';
const password = 'Hariprasath.0';
const name = 'Flow Test User';

(async () => {
  try {
    console.log('Starting end-to-end flow test');
    // 1) Register
    const regRes = await fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    const regJson = await regRes.json().catch(() => ({}));
    console.log('Register response:', regJson && regJson.message);

    // Wait briefly for email send and DB write
    await new Promise(r => setTimeout(r, 2000));

    // 2) Connect to DB and read OTP for the user
    try {
      await mongoose.connect(MONGODB_URI, { connectTimeoutMS: 10000 });
    } catch (e) {
      console.log('Primary MongoDB failed, falling back to local');
      await mongoose.connect('mongodb://127.0.0.1:27017/linkforge', { connectTimeoutMS: 10000 });
    }
    const User = require('../models/User.model');
    const user = await User.findOne({ email }).lean();
    if (!user) throw new Error('User not found in DB after register');
    console.log('Found user in DB, id:', user._id);
    const otp = user.otp;
    if (!otp) {
      console.log('No OTP found on user record. Exiting.');
      process.exit(2);
    }
    console.log('Retrieved OTP from DB (will not print)');

    // 3) Verify signup OTP using API
    const verifyRes = await fetch(`${BASE}/auth/verify-signup-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
    const verifyJson = await verifyRes.json().catch(() => ({}));
    console.log('Verify response:', verifyJson && verifyJson.message);

    // 4) Attempt login flow: login -> read OTP -> verify-login
    const loginRes = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const loginJson = await loginRes.json().catch(() => ({}));
    console.log('Login response:', loginJson && loginJson.message);
    await new Promise(r => setTimeout(r, 1500));
    const user2 = await User.findOne({ email }).lean();
    const otp2 = user2.otp;
    console.log('Retrieved login OTP from DB (will not print)');
    const verifyLoginRes = await fetch(`${BASE}/auth/verify-login-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: otp2 }) });
    const verifyLoginJson = await verifyLoginRes.json().catch(() => ({}));
    console.log('Verify login response:', verifyLoginJson && verifyLoginJson.message);

    console.log('End-to-end flow test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Flow test failed:', err.message || err);
    process.exit(1);
  }
})();
