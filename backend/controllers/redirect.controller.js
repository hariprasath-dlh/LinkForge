const URL = require('../models/URL.model');
const Analytics = require('../models/Analytics.model');
const { parseUserAgent } = require('../utils/parseUserAgent');

const handleRedirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await URL.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found.',
      });
    }

    if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This link has expired and is no longer active.',
      });
    }

    const uaString = req.headers['user-agent'] || '';
    const { browser, device, os } = parseUserAgent(uaString);

    const ipAddress =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    await Analytics.create({
      urlId: url._id,
      visitedAt: new Date(),
      ipAddress,
      userAgent: uaString,
      browser,
      device,
      os,
    });

    await URL.findByIdAndUpdate(url._id, { $inc: { totalClicks: 1 } });

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Redirect failed. Please try again.',
    });
  }
};

module.exports = { handleRedirect };
