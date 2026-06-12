const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirect.controller');

router.get('/r/:shortCode', handleRedirect);
router.get('/:shortCode', handleRedirect);

module.exports = router;
