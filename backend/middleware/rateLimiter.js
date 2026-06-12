const rateLimit = require('express-rate-limit');

// Rate limiter for login route
// Max 5 login attempts per IP per 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many login attempts from this IP address. ' +
      'Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: true,
});

// Rate limiter for register route
// Max 10 signup attempts per IP per hour
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many accounts created from this IP address. ' +
      'Please wait 1 hour before trying again.',
  },
  skipSuccessfulRequests: true,
});

// General API rate limiter
// Max 100 requests per IP per 15 minutes for all other routes
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests from this IP address. ' +
      'Please wait 15 minutes before trying again.',
  },
});

// Rate limiter for OTP send route
// Max 3 OTP requests per IP per 10 minutes
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many OTP requests from this IP address. ' +
      'Please wait 10 minutes before requesting again.',
  },
});

module.exports = {
  loginRateLimiter,
  registerRateLimiter,
  generalRateLimiter,
  otpRateLimiter,
};
