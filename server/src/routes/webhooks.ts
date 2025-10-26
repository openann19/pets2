import express, { type Request, type Response, Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router: Router = express.Router();

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

export default router;

