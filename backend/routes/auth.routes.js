const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  verifySignupOTP,
  verifyLoginOTP,
  resendOTP,
} = require('../controllers/auth.controller');
const {
  loginRateLimiter,
  registerRateLimiter,
  otpRateLimiter,
} = require('../middleware/rateLimiter');

router.post(
  '/register',
  registerRateLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.'),
    body('password')
      .notEmpty()
      .withMessage('Password is required.')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character.'),
  ],
  register
);

router.post(
  '/login',
  loginRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.'),
    body('password')
      .notEmpty().withMessage('Password is required.'),
  ],
  login
);

// Verify OTP after signup
router.post(
  '/verify-signup-otp',
  otpRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.'),
    body('otp')
      .trim()
      .notEmpty().withMessage('OTP is required.')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.')
      .isNumeric()
      .withMessage('OTP must contain only numbers.'),
  ],
  verifySignupOTP
);

// Verify OTP after login
router.post(
  '/verify-login-otp',
  otpRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.'),
    body('otp')
      .trim()
      .notEmpty().withMessage('OTP is required.')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.')
      .isNumeric()
      .withMessage('OTP must contain only numbers.'),
  ],
  verifyLoginOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  otpRateLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please enter a valid email address.'),
    body('type')
      .trim()
      .notEmpty().withMessage('Type is required.')
      .isIn(['signup', 'login'])
      .withMessage('Type must be signup or login.'),
  ],
  resendOTP
);

module.exports = router;
