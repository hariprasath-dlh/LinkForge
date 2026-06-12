const URL = require('../models/URL.model');
const Analytics = require('../models/Analytics.model');

const getPublicStats = async (req, res) => {
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

    const lastVisitRecord = await Analytics.findOne({ urlId: url._id }).sort({
      visitedAt: -1,
    });

    const isExpired =
      url.expiryDate && new Date(url.expiryDate) < new Date();

    return res.status(200).json({
      success: true,
      stats: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        totalClicks: url.totalClicks,
        createdAt: url.createdAt,
        lastVisited: lastVisitRecord ? lastVisitRecord.visitedAt : null,
        isExpired,
        isActive: url.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public stats.',
    });
  }
};

module.exports = { getPublicStats };
