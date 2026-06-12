const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/stats.controller');

router.get('/:shortCode', getPublicStats);

module.exports = router;
