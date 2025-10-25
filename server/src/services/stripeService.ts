import stripe from 'stripe';
import Configuration from '../models/Configuration';
import { decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import { sendAdminNotification } from './adminNotificationService';
import { StripeService, StripeCustomerData, StripeCustomer, StripeSubscription, StripeWebhookEvent, StripeCheckoutSession, StripeBalance, StripeChargesList, StripeInvoice } from '../types';

/**
 * Get a configured Stripe client instance
 * 
 * @returns Stripe client instance
 * @throws Error If Stripe is not configured
 */
const getStripeClient = async (): Promise<stripe> => {
  try {
    // In test mode, ALWAYS return a mock client to avoid real API calls
    // This ensures tests are fast, isolated, and don't require valid Stripe keys
    if (process.env['NODE_ENV'] === 'test') {
      logger.warn('Stripe service disabled in test mode - returning mock client');
      return {
        account: { retrieve: async () => ({ id: 'acct_test_mock' }) },
        checkout: {
          sessions: {
            create: async () => ({ id: 'cs_test_mock', url: 'https://checkout.stripe.com/test' }),
            retrieve: async () => ({ id: 'cs_test_mock', payment_status: 'paid' })
          }
        },
        subscriptions: {
          retrieve: async () => ({ id: 'sub_test_mock', status: 'active' }),
          update: async () => ({ id: 'sub_test_mock', status: 'active' }),
          create: async () => ({ id: 'sub_test_mock', status: 'active' })
        },
        customers: {
          create: async () => ({ id: 'cus_test_mock' }),
          retrieve: async () => ({ id: 'cus_test_mock' }),
          update: async () => ({ id: 'cus_test_mock' })
        },
        balanceTransactions: {
          list: async () => ({ data: [], has_more: false })
        },
        charges: {
          list: async () => ({ data: [], has_more: false })
        }
      } as unknown as stripe;
    }

    // First try to get from database
    const configDoc = await Configuration.findOne({ key: 'stripe' });
    let secretKey: string | null = null;

    // Enhanced null checking and validation
    if (configDoc && configDoc.value && configDoc.value.secretKey) {
      try {
        secretKey = configDoc.isEncrypted ? decrypt(configDoc.value.secretKey) : configDoc.value.secretKey;
      } catch (decryptError) {
        logger.error('Failed to decrypt Stripe secret key from database', { error: decryptError });
      }
    }

    // Fallback to environment variable
    if (!secretKey) {
      secretKey = process.env['STRIPE_SECRET_KEY'] || null;
    }

    if (!secretKey) {
      throw new Error('Stripe secret key not found in database or environment variables');
    }

    // Validate key format
    if (!secretKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe secret key format');
    }

    const stripeClient = new stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });

    // Test the connection
    await stripeClient.accounts.retrieve();
    
    logger.info('Stripe client initialized successfully');
    return stripeClient;
  } catch (error) {
    logger.error('Failed to initialize Stripe client', { error });
    throw new Error(`Stripe initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Create a Stripe customer
 * @param userData - User data
 * @returns Stripe customer
 */
export const createCustomer = async (userData: StripeCustomerData): Promise<StripeCustomer> => {
  try {
    const stripe = await getStripeClient();
    
    const customer = await stripe.customers.create({
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      metadata: {
        userId: userData._id,
        platform: 'pawfectmatch'
      }
    });

    logger.info('Stripe customer created', { customerId: customer.id, userId: userData._id });
    return customer as StripeCustomer;
  } catch (error) {
    logger.error('Error creating Stripe customer', { error, userData });
    throw error;
  }
};

/**
 * Create a Stripe subscription
 * @param customerId - Stripe customer ID
 * @param planId - Stripe plan ID
 * @returns Stripe subscription
 */
export const createSubscription = async (customerId: string, planId: string): Promise<StripeSubscription> => {
  try {
    const stripe = await getStripeClient();
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    logger.info('Stripe subscription created', { subscriptionId: subscription.id, customerId, planId });
    return subscription as StripeSubscription;
  } catch (error) {
    logger.error('Error creating Stripe subscription', { error, customerId, planId });
    throw error;
  }
};

/**
 * Cancel a Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 * @returns Cancelled subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<StripeSubscription> => {
  try {
    const stripe = await getStripeClient();
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info('Stripe subscription cancelled', { subscriptionId });
    return subscription as StripeSubscription;
  } catch (error) {
    logger.error('Error cancelling Stripe subscription', { error, subscriptionId });
    throw error;
  }
};

/**
 * Update a Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 * @param planId - New plan ID
 * @returns Updated subscription
 */
export const updateSubscription = async (subscriptionId: string, planId: string): Promise<StripeSubscription> => {
  try {
    const stripe = await getStripeClient();
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0]?.id || '',
        price: planId,
      }],
      proration_behavior: 'create_prorations',
    });

    logger.info('Stripe subscription updated', { subscriptionId, planId });
    return updatedSubscription as StripeSubscription;
  } catch (error) {
    logger.error('Error updating Stripe subscription', { error, subscriptionId, planId });
    throw error;
  }
};

/**
 * Handle Stripe webhook
 * @param payload - Webhook payload
 * @param signature - Webhook signature
 * @returns Processed event
 */
export const handleWebhook = async (payload: Buffer | string, signature: string): Promise<StripeWebhookEvent> => {
  try {
    const stripe = await getStripeClient();
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    
    logger.info('Stripe webhook received', { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as StripeSubscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as StripeSubscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as StripeInvoice);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as StripeInvoice);
        break;
      default:
        logger.info('Unhandled Stripe webhook event', { type: event.type });
    }

    return event as StripeWebhookEvent;
  } catch (error) {
    logger.error('Error handling Stripe webhook', { error, signature });
    throw error;
  }
};

/**
 * Handle subscription created event
 * @param subscription - Stripe subscription object
 */
const handleSubscriptionCreated = async (subscription: StripeSubscription): Promise<void> => {
  try {
    logger.info('Subscription created', { subscriptionId: subscription.id, customerId: subscription.customer });
    
    // Update user's premium status in database
    // This would typically update the User model
    await sendAdminNotification('subscription_created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      planId: subscription.items.data[0]?.price?.id || '',
    });
  } catch (error) {
    logger.error('Error handling subscription created', { error, subscription });
  }
};

/**
 * Handle subscription updated event
 * @param subscription - Stripe subscription object
 */
const handleSubscriptionUpdated = async (subscription: StripeSubscription): Promise<void> => {
  try {
    logger.info('Subscription updated', { subscriptionId: subscription.id, status: subscription.status });
    
    await sendAdminNotification('subscription_updated', {
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
    });
  } catch (error) {
    logger.error('Error handling subscription updated', { error, subscription });
  }
};

/**
 * Handle subscription deleted event
 * @param subscription - Stripe subscription object
 */
const handleSubscriptionDeleted = async (subscription: StripeSubscription): Promise<void> => {
  try {
    logger.info('Subscription deleted', { subscriptionId: subscription.id });
    
    await sendAdminNotification('subscription_deleted', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    });
  } catch (error) {
    logger.error('Error handling subscription deleted', { error, subscription });
  }
};

/**
 * Handle payment succeeded event
 * @param invoice - Stripe invoice object
 */
const handlePaymentSucceeded = async (invoice: StripeInvoice): Promise<void> => {
  try {
    logger.info('Payment succeeded', { invoiceId: invoice.id, subscriptionId: invoice.subscription });
    
    await sendAdminNotification('payment_succeeded', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_paid,
    });
  } catch (error) {
    logger.error('Error handling payment succeeded', { error, invoice });
  }
};

/**
 * Handle payment failed event
 * @param invoice - Stripe invoice object
 */
const handlePaymentFailed = async (invoice: StripeInvoice): Promise<void> => {
  try {
    logger.info('Payment failed', { invoiceId: invoice.id, subscriptionId: invoice.subscription });
    
    await sendAdminNotification('payment_failed', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_due,
    });
  } catch (error) {
    logger.error('Error handling payment failed', { error, invoice });
  }
};

/**
 * Get Stripe customer
 * @param customerId - Stripe customer ID
 * @returns Stripe customer
 */
export const getCustomer = async (customerId: string): Promise<StripeCustomer> => {
  try {
    const stripe = await getStripeClient();
    return await stripe.customers.retrieve(customerId) as StripeCustomer;
  } catch (error) {
    logger.error('Error getting Stripe customer', { error, customerId });
    throw error;
  }
};

/**
 * Get Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 * @returns Stripe subscription
 */
export const getSubscription = async (subscriptionId: string): Promise<StripeSubscription> => {
  try {
    const stripe = await getStripeClient();
    return await stripe.subscriptions.retrieve(subscriptionId) as StripeSubscription;
  } catch (error) {
    logger.error('Error getting Stripe subscription', { error, subscriptionId });
    throw error;
  }
};

/**
 * Create checkout session
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param successUrl - Success URL
 * @param cancelUrl - Cancel URL
 * @returns Checkout session
 */
export const createCheckoutSession = async (
  customerId: string, 
  priceId: string, 
  successUrl: string, 
  cancelUrl: string
): Promise<StripeCheckoutSession> => {
  try {
    const stripe = await getStripeClient();
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    logger.info('Checkout session created', { sessionId: session.id, customerId, priceId });
    return session as StripeCheckoutSession;
  } catch (error) {
    logger.error('Error creating checkout session', { error, customerId, priceId });
    throw error;
  }
};

/**
 * Get Stripe balance
 * @returns Stripe balance
 */
export const getBalance = async (): Promise<StripeBalance> => {
  try {
    const stripe = await getStripeClient();
    return await stripe.balance.retrieve();
  } catch (error) {
    logger.error('Error getting Stripe balance', { error });
    throw error;
  }
};

/**
 * Get Stripe charges
 * @param limit - Number of charges to retrieve
 * @returns Stripe charges
 */
export const getCharges = async (limit: number = 10): Promise<StripeChargesList> => {
  try {
    const stripe = await getStripeClient();
    return await stripe.charges.list({ limit });
  } catch (error) {
    logger.error('Error getting Stripe charges', { error, limit });
    throw error;
  }
};

// Export the service interface
const stripeService: StripeService = {
  createCustomer,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  handleWebhook,
};

export default stripeService;
