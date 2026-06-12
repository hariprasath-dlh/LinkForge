const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual to check if account is currently locked
UserSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > new Date();
});

// Method to increment failed login attempts
UserSchema.methods.incrementFailedAttempts = async function () {
  // If previous lock has expired, reset the counter
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
    return await this.save();
  }
  // Increment failed attempts
  this.failedLoginAttempts += 1;
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  return await this.save();
};

// Method to reset failed attempts on successful login
UserSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  return await this.save();
};

// Method to check if OTP is valid and not expired
UserSchema.methods.isOTPValid = function (enteredOTP) {
  if (!this.otp || !this.otpExpiry) {
    return { valid: false, reason: 'No OTP found. Please request a new one.' };
  }
  if (new Date() > this.otpExpiry) {
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (this.otp !== enteredOTP) {
    return { valid: false, reason: 'Invalid OTP. Please try again.' };
  }
  return { valid: true };
};

// Method to clear OTP after verification
UserSchema.methods.clearOTP = async function () {
  this.otp = null;
  this.otpExpiry = null;
  return await this.save();
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
