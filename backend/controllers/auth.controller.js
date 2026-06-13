const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const {
  generateOTP,
  sendSignupOTPEmail,
  sendLoginOTPEmail,
} = require('../utils/emailService');

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const authLog = (event, details = {}) => {
  console.log(`[auth] ${event}`, details);
};

const restorePreviousOTP = async (user, previousOTP, previousOTPExpiry) => {
  user.otp = previousOTP || null;
  user.otpExpiry = previousOTPExpiry || null;
  await user.save();
};

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);
    authLog('register.request', { email });

    // Check if email already exists and is verified
    const existingUser = await User.findOne({ email });
    authLog('register.user_lookup', {
      email,
      found: Boolean(existingUser),
      verified: Boolean(existingUser?.isEmailVerified),
    });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Generate OTP and expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;

    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user with new OTP
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      user = await existingUser.save();
      authLog('register.user_updated', { userId: user._id, email });
    } else {
      // Create new user with OTP — not yet verified
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        isEmailVerified: false,
      });
      authLog('register.user_created', { userId: user._id, email });
    }

    // Send OTP email
    try {
      await sendSignupOTPEmail(email, name, otp);
    } catch (emailError) {
      console.error('=== SIGNUP EMAIL FAILED ===');
      console.error('Error:', emailError.message);
      console.error('To:', email);
      console.error('===========================');
      return res.status(202).json({
        success: true,
        message:
          'Account saved, but verification email delivery is delayed. Please use resend OTP.',
        pendingVerification: true,
        email: email,
      });
    }

    authLog('register.email_sent', { userId: user._id, email });

    return res.status(200).json({
      success: true,
      message: `Verification OTP sent to ${email}. Please check your inbox.`,
      pendingVerification: true,
      email: email,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    authLog('login.request', { email });

    const user = await User.findOne({ email }).select('+password');
    authLog('login.user_lookup', {
      email,
      found: Boolean(user),
      verified: Boolean(user?.isEmailVerified),
      locked: Boolean(user?.lockUntil && user.lockUntil > new Date()),
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Account lockout check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil - new Date()) / (1000 * 60)
      );
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutesLeft} minute(s).`,
      });
    }

    // Password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    authLog('login.password_compare', { userId: user._id, email, matched: isMatch });
    if (!isMatch) {
      await user.incrementFailedAttempts();
      const attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);
      return res.status(400).json({
        success: false,
        message:
          attemptsLeft > 0
            ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining before account lockout.`
            : 'Invalid email or password. Account has been locked for 30 minutes.',
      });
    }

    // Reset failed attempts on correct password
    await user.resetFailedAttempts();

    // Generate OTP for login verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const previousOTP = user.otp;
    const previousOTPExpiry = user.otpExpiry;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    authLog('login.otp_saved', { userId: user._id, email, expiresAt: otpExpiry });

    // Send login OTP email
    try {
      await sendLoginOTPEmail(email, user.name, otp);
    } catch (emailError) {
      console.error('=== LOGIN EMAIL FAILED ===');
      console.error('Error:', emailError.message);
      console.error('To:', email);
      console.error('==========================');
      await restorePreviousOTP(user, previousOTP, previousOTPExpiry);
      authLog('login.otp_restored_after_email_failure', { userId: user._id, email });
      return res.status(202).json({
        success: true,
        message:
          'Login OTP could not be sent. Please check email service configuration and try resend OTP.',
        pendingVerification: true,
        email: email,
      });
    }

    authLog('login.email_sent', { userId: user._id, email });

    return res.status(200).json({
      success: true,
      message: `Login verification OTP sent to ${email}. Please check your inbox.`,
      pendingVerification: true,
      email: email,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// POST /api/auth/verify-signup-otp
const verifySignupOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { otp } = req.body;
    const email = normalizeEmail(req.body.email);
    authLog('verify_signup.request', { email });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email });
    authLog('verify_signup.user_lookup', { email, found: Boolean(user) });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otpCheck = user.isOTPValid(otp);
    authLog('verify_signup.otp_check', {
      userId: user._id,
      email,
      valid: otpCheck.valid,
      reason: otpCheck.valid ? undefined : otpCheck.reason,
    });
    if (!otpCheck.valid) {
      return res.status(400).json({
        success: false,
        message: otpCheck.reason,
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    authLog('verify_signup.verified', { userId: user._id, email });

    // Generate JWT token — user is now fully registered
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to LinkForge!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification.',
    });
  }
};

// POST /api/auth/verify-login-otp
const verifyLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { otp } = req.body;
    const email = normalizeEmail(req.body.email);
    authLog('verify_login.request', { email });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email });
    authLog('verify_login.user_lookup', {
      email,
      found: Boolean(user),
      verified: Boolean(user?.isEmailVerified),
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otpCheck = user.isOTPValid(otp);
    authLog('verify_login.otp_check', {
      userId: user._id,
      email,
      valid: otpCheck.valid,
      reason: otpCheck.valid ? undefined : otpCheck.reason,
    });
    if (!otpCheck.valid) {
      return res.status(400).json({
        success: false,
        message: otpCheck.reason,
      });
    }

    // Clear OTP after successful verification
    user.isEmailVerified = true;
    await user.clearOTP();
    authLog('verify_login.verified', { userId: user._id, email });

    // Generate JWT token — user is now logged in
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify login OTP error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification.',
    });
  }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { type } = req.body;
    const email = normalizeEmail(req.body.email);
    authLog('resend.request', { email, type });

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email });
    authLog('resend.user_lookup', { email, type, found: Boolean(user) });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const previousOTP = user.otp;
    const previousOTPExpiry = user.otpExpiry;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    authLog('resend.otp_saved', { userId: user._id, email, type, expiresAt: otpExpiry });

    // Send OTP based on type (signup or login)
    try {
      if (type === 'signup') {
        await sendSignupOTPEmail(email, user.name, otp);
      } else {
        await sendLoginOTPEmail(email, user.name, otp);
      }
    } catch (emailError) {
      console.error('Resend email failed:', emailError.message);
      await restorePreviousOTP(user, previousOTP, previousOTPExpiry);
      authLog('resend.otp_restored_after_email_failure', {
        userId: user._id,
        email,
        type,
      });
      return res.status(500).json({
        success: false,
        message:
          'Failed to resend OTP because the email service rejected the request.',
      });
    }

    authLog('resend.email_sent', { userId: user._id, email, type });

    return res.status(200).json({
      success: true,
      message: `New OTP sent to ${email}. Please check your inbox.`,
    });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP resend.',
    });
  }
};

module.exports = {
  register,
  login,
  verifySignupOTP,
  verifyLoginOTP,
  resendOTP,
};
