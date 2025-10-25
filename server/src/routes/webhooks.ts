const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');
const router = express.Router();

/**
 * Middleware to process raw body for Stripe signature verification
 * This needs to be before the standard JSON body parser
 */
const rawBodyMiddleware = express.raw({ 
  type: 'application/json',
  limit: '256kb' // Reasonable size limit for webhook payloads
});

// Stripe webhook endpoint
router.post('/stripe', rawBodyMiddleware, handleStripeWebhook);

module.exports = router;
