const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'URL',
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: '',
  },
  browser: {
    type: String,
    default: 'unknown',
  },
  device: {
    type: String,
    default: 'unknown',
  },
  os: {
    type: String,
    default: 'unknown',
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
