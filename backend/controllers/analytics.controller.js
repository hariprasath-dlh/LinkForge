const URL = require('../models/URL.model');
const Analytics = require('../models/Analytics.model');

const getAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;

    const url = await URL.findOne({ _id: urlId, userId: req.user.userId });
    if (!url) {
      return res.status(403).json({
        success: false,
        message: 'URL not found or access denied.',
      });
    }

    const analyticsRecords = await Analytics.find({ urlId }).sort({
      visitedAt: -1,
    });

    const totalClicks = analyticsRecords.length;
    const lastVisited =
      analyticsRecords.length > 0 ? analyticsRecords[0].visitedAt : null;
    const recentVisits = analyticsRecords.slice(0, 20);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = {};
    analyticsRecords
      .filter((r) => new Date(r.visitedAt) >= thirtyDaysAgo)
      .forEach((r) => {
        const date = new Date(r.visitedAt).toISOString().split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const browserMap = {};
    analyticsRecords.forEach((r) => {
      const b = r.browser || 'unknown';
      browserMap[b] = (browserMap[b] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserMap).map(
      ([name, value]) => ({ name, value })
    );

    const deviceMap = {};
    analyticsRecords.forEach((r) => {
      const d = r.device || 'desktop';
      deviceMap[d] = (deviceMap[d] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceMap).map(
      ([name, value]) => ({ name, value })
    );

    return res.status(200).json({
      success: true,
      analytics: {
        totalClicks,
        lastVisited,
        recentVisits,
        dailyTrend,
        browserBreakdown,
        deviceBreakdown,
        url,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics.',
    });
  }
};

module.exports = { getAnalytics };
