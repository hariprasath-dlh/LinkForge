const { validationResult } = require('express-validator');
const URL = require('../models/URL.model');
const Analytics = require('../models/Analytics.model');
const { generateUniqueShortCode } = require('../utils/shortCodeGenerator');

const getAllURLs = async (req, res) => {
  try {
    const urls = await URL.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, urls });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch URLs.',
    });
  }
};

const createURL = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { originalUrl, customAlias, expiryDate } = req.body;

    let shortCode;

    if (customAlias) {
      const aliasRegex = /^[a-zA-Z0-9-]+$/;
      if (!aliasRegex.test(customAlias)) {
        return res.status(400).json({
          success: false,
          message:
            'Custom alias can only contain letters, numbers, and hyphens.',
        });
      }
      if (customAlias.length < 3 || customAlias.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias must be between 3 and 30 characters.',
        });
      }
      const existing = await URL.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            'This custom alias is already taken. Please choose another.',
        });
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueShortCode(URL);
    }

    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be a future date.',
        });
      }
    }

    const url = await URL.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      userId: req.user.userId,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Short URL created successfully.',
      url,
    });
  } catch (error) {
    console.error('Create URL error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create short URL.',
    });
  }
};

const deleteURL = async (req, res) => {
  try {
    const url = await URL.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!url) {
      return res.status(403).json({
        success: false,
        message:
          'URL not found or you do not have permission to delete it.',
      });
    }

    await Analytics.deleteMany({ urlId: req.params.id });
    await URL.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'URL and all its analytics deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete URL.',
    });
  }
};

const editURL = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { originalUrl } = req.body;

    const url = await URL.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!url) {
      return res.status(403).json({
        success: false,
        message: 'URL not found or you do not have permission to edit it.',
      });
    }

    url.originalUrl = originalUrl;
    await url.save();

    return res.status(200).json({
      success: true,
      message: 'URL updated successfully.',
      url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update URL.',
    });
  }
};

module.exports = { getAllURLs, createURL, deleteURL, editURL };
