const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const {
  generateOTP,
  sendSignupOTPEmail,
  sendLoginOTPEmail,
} = require('../utils/emailService');

const generateToken = (userId) => {
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

    const { name, email, password } = req.body;

    // Check if email already exists and is verified
    const existingUser = await User.findOne({ email });
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
    }

    // Send OTP email
    try {
      await sendSignupOTPEmail(email, name, otp);
    } catch (emailError) {
      console.error('=== SIGNUP EMAIL FAILED ===');
      console.error('Error:', emailError.message);
      console.error('To:', email);
      console.error('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
      console.error('===========================');
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message:
          'Failed to send verification email. ' +
          'Error: ' + emailError.message,
      });
    }

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

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
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

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send login OTP email
    try {
      await sendLoginOTPEmail(email, user.name, otp);
    } catch (emailError) {
      console.error('=== LOGIN EMAIL FAILED ===');
      console.error('Error:', emailError.message);
      console.error('To:', email);
      console.error('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
      console.error('==========================');
      return res.status(500).json({
        success: false,
        message:
          'Failed to send login OTP. ' +
          'Error: ' + emailError.message,
      });
    }

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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otpCheck = user.isOTPValid(otp);
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otpCheck = user.isOTPValid(otp);
    if (!otpCheck.valid) {
      return res.status(400).json({
        success: false,
        message: otpCheck.reason,
      });
    }

    // Clear OTP after successful verification
    await user.clearOTP();

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
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP based on type (signup or login)
    try {
      if (type === 'signup') {
        await sendSignupOTPEmail(email, user.name, otp);
      } else {
        await sendLoginOTPEmail(email, user.name, otp);
      }
    } catch (emailError) {
      console.error('Resend email failed:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      });
    }

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
