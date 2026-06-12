const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');
const {
  getAllURLs,
  createURL,
  deleteURL,
  editURL,
} = require('../controllers/url.controller');

router.get('/', authMiddleware, getAllURLs);

router.post(
  '/',
  authMiddleware,
  [
    body('originalUrl')
      .notEmpty().withMessage('URL is required.')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage(
        'Please enter a valid URL starting with http:// or https://'
      ),
  ],
  createURL
);

router.delete('/:id', authMiddleware, deleteURL);

router.patch(
  '/:id',
  authMiddleware,
  [
    body('originalUrl')
      .notEmpty().withMessage('URL is required.')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage(
        'Please enter a valid URL starting with http:// or https://'
      ),
  ],
  editURL
);

module.exports = router;
