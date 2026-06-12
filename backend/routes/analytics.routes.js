const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getAnalytics } = require('../controllers/analytics.controller');

router.get('/:urlId', authMiddleware, getAnalytics);

module.exports = router;
