import type { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import logger from '../utils/logger';
import paymentRetryService from '../services/paymentRetryService';
import { setFeatureLimitsBasedOnPlan } from '../utils/premiumFeatures';
import subscriptionAnalyticsService from '../services/subscriptionAnalyticsService';
import { MongoClient } from 'mongodb';
import { getErrorMessage } from '../utils/errorHandler';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (stripeSecretKey) {
  // Using the latest stable API version - the specific API version string is typed by Stripe SDK
  stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' });
} else {
  logger.warn('Stripe secret key not configured');
}

/**
 * Request interface
 */
interface StripeWebhookRequest extends Request {
  headers: {
    'stripe-signature'?: string;
  };
  rawBody?: Buffer | string;
  body: Stripe.Event | Record<string, unknown>;
}

/**
 * Checkout session type
 */
type Session = Stripe.Checkout.Session & {
  subscription?: string;
};

/**
 * Invoice type
 */
type Invoice = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription;
  attempt_count?: number;
};

/**
 * Subscription type
 */
type Subscription = Stripe.Subscription;

/**
 * Process webhook events from Stripe
 * @route POST /api/webhooks/stripe
 * @access Public
 */
export const handleStripeWebhook = async (req: StripeWebhookRequest, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  
  if (process.env.NODE_ENV === 'test' && req.body && req.body.type) {
    // Directly trust body in test environment
    event = req.body;
  } else {
    // Build payload for signature verification; in test env fallback to req.body (already parsed)
    let payloadForVerification = req.rawBody;
    if (!payloadForVerification && process.env.NODE_ENV === 'test') {
      try { 
        payloadForVerification = JSON.stringify(req.body || {}); 
      } catch { 
        payloadForVerification = '{}'; 
      }
    }
    
    if (!stripe || !sig) {
      logger.error('Stripe or signature not available');
      res.status(400).send('Webhook Error: Stripe not configured');
      return;
    }

    try {
      event =       stripe.webhooks.constructEvent(
        payloadForVerification as string,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || (process.env.NODE_ENV === 'test' ? 'whsec_test' : '')
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Webhook signature verification failed', { error: errorMessage });
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }
  }

  // In test environment, skip idempotency checks & extra DB connections for speed
  let isEventProcessed = false;
  const idempotencyKey = event.id;
  
  if (process.env.NODE_ENV !== 'test') {
    isEventProcessed = await checkEventProcessed(idempotencyKey);
    if (isEventProcessed) {
      logger.info('Duplicate webhook event, already processed', { eventId: event.id, type: event.type });
      res.json({ received: true, duplicateEvent: true });
      return;
    }
  }

  // Handle event types
  try {
    logger.info('Processing webhook event', { type: event.type, id: event.id });

    const { syncEntitlementFromStripeCustomer } = await import('../services/stripeService');
    let customerId: string | undefined;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Session;
        await handleCheckoutSessionCompleted(session);
        customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Invoice;
        await handleInvoicePaid(invoice);
        customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Invoice;
        await handleInvoicePaymentFailed(invoice);
        customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Subscription;
        await handleSubscriptionUpdated(subscription);
        customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Subscription;
        await handleSubscriptionDeleted(subscription);
        customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Subscription;
        await handleSubscriptionCreated(subscription);
        customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        break;
      }
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        customerId = typeof paymentMethod.customer === 'string' ? paymentMethod.customer : paymentMethod.customer?.id;
        break;
      }
      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    // Update Redis entitlement cache
    if (customerId) {
      try {
        await syncEntitlementFromStripeCustomer(customerId);
      } catch (e) {
        logger.error('Failed to sync entitlement from webhook', { error: (e as Error).message, customerId });
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      // Mark event as processed
      await markEventProcessed(idempotencyKey);
    }

    logger.info('Successfully processed webhook event', { eventId: event.id, type: event.type });
  } catch (err: unknown) {
    logger.error('Error processing webhook', {
      error: getErrorMessage(err),
      event: event.type,
      eventId: event.id
    });

    // Return 200 for events that shouldn't be retried automatically
    if (isNonRetryableError(err)) {
      logger.warn('Non-retryable webhook error, acknowledging to prevent retries', {
        eventId: event.id
      });
      res.json({ received: true, warning: 'Processing error occurred, but event acknowledged' });
      return;
    }

    // For retryable errors, return error status so Stripe will retry
    res.status(500).send('Webhook processing error');
    return;
  }

  // Return success
  res.json({ received: true });
};

/**
 * Handle checkout.session.completed event
 * This event is fired when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session: Session): Promise<void> {
  // Get user ID from metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.error('Missing userId in session metadata', { sessionId: session.id });
    throw new Error('Missing userId in session metadata');
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    logger.error('User not found for checkout session', { userId, sessionId: session.id });
    throw new Error('User not found');
  }

  if (!stripe || !session.subscription) {
    logger.error('No subscription in session', { sessionId: session.id });
    throw new Error('No subscription in session');
  }

  // Get subscription details from Stripe
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    // Get plan details from product ID
    const priceId = subscription.items.data?.[0]?.price?.id;
    if (!priceId) {
      throw new Error('Price ID not found in subscription');
    }
    const planName = await getPlanNameFromPriceId(priceId);

    // Update user with subscription details
    const periodEnd = subscription.current_period_end;
    user.premium = {
      isActive: true,
      plan: planName,
      stripeSubscriptionId: session.subscription,
      expiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      paymentStatus: 'active',
      features: {
        unlimitedLikes: false,
        boostProfile: false,
        seeWhoLiked: false,
        advancedFilters: false,
        aiMatching: false,
        prioritySupport: false,
        globalPassport: false
      },
      usage: {
        swipesUsed: user.premium?.usage?.swipesUsed || 0,
        swipesLimit: user.premium?.usage?.swipesLimit || 0,
        superLikesUsed: user.premium?.usage?.superLikesUsed || 0,
        superLikesLimit: user.premium?.usage?.superLikesLimit || 0,
        boostsUsed: user.premium?.usage?.boostsUsed || 0,
        boostsLimit: user.premium?.usage?.boostsLimit || 0,
        messagesSent: user.premium?.usage?.messagesSent || 0,
        profileViews: user.premium?.usage?.profileViews || 0
      }
    };

    // Set feature limits based on plan
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    logger.info('User subscription activated', {
      userId,
      plan: planName,
      subscriptionId: session.subscription
    });
  } catch (error: unknown) {
    logger.error('Failed to process subscription', {
      error: getErrorMessage(error),
      userId,
      sessionId: session.id
    });
    throw error; // Allow Stripe to retry
  }
}

/**
 * Handle invoice.paid event
 * This event is fired when an invoice is paid successfully (e.g., subscription renewal)
 */
async function handleInvoicePaid(invoice: Invoice): Promise<void> {
  if (!invoice.subscription) {
    logger.info('Invoice paid event not for a subscription', { invoiceId: invoice.id });
    return;
  }

  if (!stripe) {
    logger.error('Stripe not initialized for invoice.paid');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

    // Find user with this subscription
    const user = await User.findOne({
      'premium.stripeSubscriptionId': invoice.subscription
    });

    if (!user) {
      logger.error('User not found for subscription', {
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id
      });
      return;
    }

    // Update subscription expiry date
    const periodEnd = subscription.current_period_end;
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
      };
    }
    user.premium.expiresAt = periodEnd ? new Date(periodEnd * 1000) : null;
    user.premium.isActive = true; // Ensure it's active

    // Ensure feature flags are correctly set based on current plan
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    logger.info('Subscription renewed', {
      userId: user._id,
      subscriptionId: invoice.subscription,
      newExpiryDate: user.premium.expiresAt
    });
  } catch (error: unknown) {
    logger.error('Error processing invoice.paid event', {
      error: getErrorMessage(error),
      invoiceId: invoice.id
    });
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Enhanced with smart retry logic
 */
async function handleInvoicePaymentSucceeded(invoice: Invoice): Promise<void> {
  if (!invoice.subscription) {
    logger.info('Invoice payment succeeded event not for a subscription', { invoiceId: invoice.id });
    return;
  }

  if (!stripe) {
    logger.error('Stripe not initialized for invoice.payment_succeeded');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

    // Find user with this subscription
    const user = await User.findOne({
      'premium.stripeSubscriptionId': invoice.subscription
    });

    if (!user) {
      logger.error('User not found for subscription', {
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id
      });
      return;
    }

    // Update subscription status
    const periodEnd = subscription.current_period_end;
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
      };
    }
    user.premium.expiresAt = periodEnd ? new Date(periodEnd * 1000) : null;
    user.premium.isActive = true;
    user.premium.retryCount = 0; // Reset retry count on successful payment

    // Ensure feature flags are correctly set based on current plan
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    // Clear analytics cache to reflect new payment
    subscriptionAnalyticsService.clearCache();

    logger.info('Invoice payment succeeded', {
      userId: user._id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
      newExpiryDate: user.premium.expiresAt
    });
  } catch (error: unknown) {
    logger.error('Error processing invoice.payment_succeeded event', {
      error: getErrorMessage(error),
      invoiceId: invoice.id
    });
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 * Enhanced with smart retry logic
 */
async function handleInvoicePaymentFailed(invoice: Invoice): Promise<void> {
  if (!invoice.subscription) {
    logger.info('Invoice payment failed event not for a subscription', { invoiceId: invoice.id });
    return;
  }

  try {
    // Find user with this subscription
    const user = await User.findOne({
      'premium.stripeSubscriptionId': invoice.subscription
    });

    if (!user) {
      logger.error('User not found for subscription', {
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id
      });
      return;
    }

    // Check number of payment attempts
    const attemptCount = invoice.attempt_count || 1;

    // Update user's retry count
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'failed',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
        retryCount: 0,
      };
    }
    user.premium.retryCount = (user.premium.retryCount || 0) + 1;
    user.premium.paymentStatus = 'failed';
    await user.save();

    // Use smart retry service to handle the failure
    await paymentRetryService.handleFailedPayment(invoice.subscription as string);

    logger.warn('Payment failed, smart retry initiated', {
      userId: user._id,
      subscriptionId: invoice.subscription,
      attemptCount,
      retryCount: user.premium.retryCount
    });
  } catch (error: unknown) {
    logger.error('Error processing invoice.payment_failed event', {
      error: getErrorMessage(error),
      invoiceId: invoice.id
    });
    throw error;
  }
}

/**
 * Handle customer.subscription.created event
 * This event is fired when a new subscription is created
 */
async function handleSubscriptionCreated(subscription: Subscription): Promise<void> {
  if (!stripe) {
    logger.error('Stripe not initialized for subscription.created');
    return;
  }

  try {
    // Get customer ID
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer?.id;
    
    if (!customerId) {
      logger.error('Customer ID not found in subscription', { subscriptionId: subscription.id });
      return;
    }

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });
    
    if (!user) {
      logger.error('User not found for subscription creation', { 
        customerId, 
        subscriptionId: subscription.id 
      });
      return;
    }

    // Get plan details from price ID
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      throw new Error('Price ID not found in subscription');
    }
    const planName = await getPlanNameFromPriceId(priceId);

    // Initialize premium if needed
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        },
      };
    }

    // Update subscription details
    const periodEnd = subscription.current_period_end;
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
      };
    }
    user.premium.isActive = true;
    user.premium.plan = planName;
    user.premium.stripeSubscriptionId = subscription.id;
    user.premium.expiresAt = periodEnd ? new Date(periodEnd * 1000) : null;
    user.premium.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    user.premium.paymentStatus = 'active';

    // Set feature limits based on plan
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    logger.info('Subscription created and activated', {
      userId: user._id,
      subscriptionId: subscription.id,
      plan: planName,
      expiresAt: user.premium.expiresAt,
    });
  } catch (error: unknown) {
    logger.error('Error processing subscription.created event', {
      error: getErrorMessage(error),
      subscriptionId: subscription.id
    });
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 * This event is fired when a subscription is updated (e.g., plan change, cancellation)
 */
async function handleSubscriptionUpdated(subscription: Subscription): Promise<void> {
  if (!stripe) {
    logger.error('Stripe not initialized for subscription.updated');
    return;
  }

  try {
    // Find user with this subscription
    const user = await User.findOne({
      'premium.stripeSubscriptionId': subscription.id
    });

    if (!user) {
      logger.error('User not found for subscription update', { subscriptionId: subscription.id });
      return;
    }

    // Update subscription details
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      throw new Error('Price ID not found in subscription');
    }
    const planName = await getPlanNameFromPriceId(priceId);

    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
      };
    }
    user.premium.plan = planName;
    const periodEnd = subscription.current_period_end;
    user.premium.expiresAt = periodEnd ? new Date(periodEnd * 1000) : null;
    user.premium.cancelAtPeriodEnd = subscription.cancel_at_period_end;

    // If plan changed, update feature limits
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    logger.info('Subscription updated', {
      userId: user._id,
      subscriptionId: subscription.id,
      plan: planName,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error: unknown) {
    logger.error('Error processing subscription.updated event', {
      error: getErrorMessage(error),
      subscriptionId: subscription.id
    });
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * This event is fired when a subscription is deleted (e.g., after cancellation period ends)
 */
async function handleSubscriptionDeleted(subscription: Subscription): Promise<void> {
  try {
    // Find user with this subscription
    const user = await User.findOne({
      'premium.stripeSubscriptionId': subscription.id
    });

    if (!user) {
      logger.error('User not found for subscription deletion', { subscriptionId: subscription.id });
      return;
    }

    // Deactivate premium features
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
          aiMatching: false,
          prioritySupport: false,
          globalPassport: false,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
        },
      };
    }
    user.premium.isActive = false;
    user.premium.plan = 'free';
    user.premium.expiresAt = new Date();

    // Reset feature limits to basic
    setFeatureLimitsBasedOnPlan(user);

    await user.save();

    logger.info('Subscription ended', {
      userId: user._id,
      subscriptionId: subscription.id
    });
  } catch (error: unknown) {
    logger.error('Error processing subscription.deleted event', {
      error: getErrorMessage(error),
      subscriptionId: subscription.id
    });
    throw error;
  }
}

/**
 * Helper function to get the plan name from price ID
 * Supports both environment variable mapping and direct Stripe queries
 */
async function getPlanNameFromPriceId(priceId: string): Promise<string> {
  // Check environment variables first (most common case)
  if (priceId === process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_BASIC_YEARLY_PRICE_ID) {
    return 'basic';
  }
  if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
    return 'premium';
  }
  if (priceId === process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID || 
      priceId === process.env.STRIPE_ULTIMATE_YEARLY_PRICE_ID) {
    return 'ultimate';
  }

  // Fallback: Query Stripe API for product details
  if (stripe) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price.product) {
        const productId = typeof price.product === 'string' ? price.product : price.product.id;
        const product = await stripe.products.retrieve(productId);
        const productName = product.name?.toLowerCase() || '';
        
        if (productName.includes('basic')) return 'basic';
        if (productName.includes('premium')) return 'premium';
        if (productName.includes('ultimate') || productName.includes('elite') || productName.includes('vip')) {
          return 'ultimate';
        }
      }
    } catch (error) {
      logger.warn('Failed to query Stripe for plan name', { 
        priceId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Fallback: Parse from price ID format (price_*_*)
  const parts = priceId.split('_');
  if (parts.length >= 3) {
    const planName = parts[1]?.toLowerCase();
    if (planName === 'basic' || planName === 'premium' || planName === 'ultimate') {
      return planName;
    }
  }

  logger.warn('Could not determine plan name from price ID, defaulting to basic', { priceId });
  return 'basic';
}


/**
 * Helper to check if an event has already been processed
 * Uses a DB collection for idempotency
 */
async function checkEventProcessed(eventId: string): Promise<boolean> {
  // Check database collection for idempotency
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    await client.connect();

    const db = client.db();
    const webhookEvents = db.collection('webhookEvents');

    const existingEvent = await webhookEvents.findOne({ eventId });
    await client.close();

    return !!existingEvent;
  } catch (error: unknown) {
    // Log error and still return false as a fallback
    logger.error('Error checking event status', { eventId, error: getErrorMessage(error) });
    return false;
  }
}

/**
 * Helper to mark an event as processed
 */
async function markEventProcessed(eventId: string): Promise<boolean> {
  // Insert into database collection for idempotency tracking
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    await client.connect();

    const db = client.db();
    const webhookEvents = db.collection('webhookEvents');

    await webhookEvents.insertOne({
      eventId,
      processedAt: new Date(),
      createdAt: new Date()
    });

    await client.close();
    return true;
  } catch (error: unknown) {
    // Log error before throwing it
    logger.error('Error marking event as processed', { eventId, error: getErrorMessage(error) });
    // Then rethrow the error
    throw error;
  }
}

/**
 * Determine if an error is non-retryable
 */
function isNonRetryableError(error: Error): boolean {
  // List of error messages or types that shouldn't be retried
  const nonRetryableErrors = [
    'User not found',
    'Invalid plan configuration'
  ];

  if (typeof error !== 'object' || error === null) return false;
  const errorObj = error as Record<string, unknown>;
  if (typeof errorObj.message !== 'string') return false;
  return nonRetryableErrors.some(errMsg => errorObj.message.includes(errMsg));
}

