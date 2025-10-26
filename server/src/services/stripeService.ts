import Stripe from 'stripe';
import { decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import { sendAdminNotification } from './adminNotificationService';
import Configuration from '../models/Configuration';

// Mock Stripe client interface for testing
interface MockStripeClient {
  account: {
    retrieve: () => Promise<{ id: string }>;
  };
  checkout: {
    sessions: {
      create: () => Promise<{ id: string; url: string }>;
      retrieve: () => Promise<{ id: string; payment_status: string }>;
    };
  };
  subscriptions: {
    retrieve: () => Promise<{ id: string; status: string }>;
    update: () => Promise<{ id: string; status: string }>;
    create: () => Promise<{ id: string; status: string }>;
  };
  customers: {
    create: () => Promise<{ id: string }>;
    retrieve: () => Promise<{ id: string }>;
    update: () => Promise<{ id: string }>;
  };
  balanceTransactions: {
    list: () => Promise<{ data: never[]; has_more: boolean }>;
  };
  charges: {
    list: () => Promise<{ data: never[]; has_more: boolean }>;
  };
}

/**
 * Get a configured Stripe client instance
 * 
 * @returns Promise resolving to Stripe client instance
 * @throws Error if Stripe is not configured
 */
export const getStripeClient = async (): Promise<Stripe | MockStripeClient> => {
  try {
    // In test mode, ALWAYS return a mock client to avoid real API calls
    // This ensures tests are fast, isolated, and don't require valid Stripe keys
    if (process.env.NODE_ENV === 'test') {
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
      } as MockStripeClient;
    }

    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    let secretKey: string | null = null;

    // Enhanced null checking and validation
    if (configDoc?.data?.secretKey) {
      try {
        secretKey = await decrypt(configDoc.data.secretKey);
      } catch (decryptError) {
        logger.error('Failed to decrypt Stripe secret key from database', {
          error: (decryptError as Error).message,
          configId: configDoc._id
        });
        // Fall through to environment variable
      }
    }

    // Fall back to environment variable if database key is not available
    if (!secretKey && process.env.STRIPE_SECRET_KEY) {
      secretKey = process.env.STRIPE_SECRET_KEY;
    }

    // Validate that we have a secret key
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      const error = new Error('Stripe is not configured - missing or invalid secret key');
      logger.error('Stripe configuration error', {
        error: error.message,
        hasConfigDoc: !!configDoc,
        hasConfigData: !!(configDoc?.data),
        hasConfigSecretKey: !!(configDoc?.data?.secretKey),
        hasEnvVar: !!process.env.STRIPE_SECRET_KEY,
        envVarLength: process.env.STRIPE_SECRET_KEY?.length || 0
      });

      // Send admin notification for critical configuration error
      await sendAdminNotification({
        type: 'error',
        severity: 'critical',
        title: 'Stripe Configuration Error',
        message: 'Stripe payment processing is not configured properly. Payment functionality will not work.',
        metadata: {
          hasConfigDoc: !!configDoc,
          hasEnvVar: !!process.env.STRIPE_SECRET_KEY,
        }
      }).catch((notificationError: Error) => {
        logger.error('Failed to send admin notification for Stripe config error', {
          notificationError: notificationError.message
        });
      });

      throw error;
    }

    // Validate the secret key format (relaxed in test mode)
    if (!secretKey.startsWith('sk_') && process.env.NODE_ENV !== 'test') {
      const error = new Error('Invalid Stripe secret key format');
      logger.error('Stripe secret key validation failed', {
        error: error.message,
        keyPrefix: secretKey.substring(0, Math.min(10, secretKey.length)) + '...',
        keyLength: secretKey.length
      });
      throw error;
    }

    // In test mode with a test key, skip API connectivity test
    if (process.env.NODE_ENV === 'test') {
      logger.info('Stripe client initialized in test mode - skipping API connectivity test');
      return new Stripe(secretKey) as any;
    }

    // Initialize and return Stripe client
    const client = new Stripe(secretKey);

    // Test the client with a simple API call
    try {
      await client.accounts.retrieve();
      logger.info('Stripe client initialized successfully');
    } catch (testError) {
      const testErr = testError as Stripe.StripeRawError;
      logger.warn('Stripe client test failed', {
        error: testErr.message,
        type: testErr.type,
        code: testErr.code
      });

      // Send admin notification for Stripe connectivity issues
      await sendAdminNotification({
        type: 'warning',
        severity: 'high',
        title: 'Stripe Connectivity Issue',
        message: 'Stripe client test failed. Payment processing may be affected.',
        metadata: {
          error: testErr.message,
          type: testErr.type,
          code: testErr.code
        }
      }).catch((notificationError: Error) => {
        logger.error('Failed to send admin notification for Stripe connectivity issue', {
          notificationError: notificationError.message
        });
      });

      // Don't throw here - the client might still work for other operations
    }

    return client;
  } catch (error) {
    logger.error('Failed to initialize Stripe client', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });

    // Send admin notification for critical Stripe initialization failure
    await sendAdminNotification({
      type: 'error',
      severity: 'critical',
      title: 'Stripe Initialization Failed',
      message: 'Failed to initialize Stripe client. Payment processing is completely unavailable.',
      metadata: {
        error: (error as Error).message,
        name: (error as Error).name
      }
    }).catch((notificationError: Error) => {
      logger.error('Failed to send admin notification for Stripe initialization failure', {
        notificationError: (notificationError as Error).message
      });
    });

    throw new Error('Failed to initialize Stripe client: ' + (error as Error).message);
  }
};

/**
 * Get Stripe publishable key
 * 
 * @returns Promise resolving to Stripe publishable key or null
 */
export const getPublishableKey = async (): Promise<string | null> => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });
    let publishableKey: string | null = null;

    // Enhanced null checking
    if (configDoc?.data?.publishableKey) {
      publishableKey = configDoc.data.publishableKey as string;
    } else if (process.env.STRIPE_PUBLISHABLE_KEY) {
      // Fall back to environment variable
      publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    }

    // Validate the publishable key format
    if (publishableKey && typeof publishableKey === 'string' && publishableKey.trim().length > 0) {
      if (!publishableKey.startsWith('pk_')) {
        logger.warn('Invalid Stripe publishable key format', {
          keyPrefix: publishableKey.substring(0, 10) + '...',
          keyLength: publishableKey.length
        });
        return null;
      }
      return publishableKey;
    }

    logger.warn('Stripe publishable key not found', {
      hasConfigDoc: !!configDoc,
      hasConfigData: !!(configDoc?.data),
      hasConfigPublishableKey: !!(configDoc?.data?.publishableKey),
      hasEnvVar: !!process.env.STRIPE_PUBLISHABLE_KEY
    });

    return null;
  } catch (error) {
    logger.error('Failed to get Stripe publishable key', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return null;
  }
};

/**
 * Get Stripe webhook secret
 * 
 * @returns Promise resolving to Stripe webhook secret or null
 */
export const getWebhookSecret = async (): Promise<string | null> => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });

    if (configDoc?.data?.webhookSecret) {
      return await decrypt(configDoc.data.webhookSecret);
    } else if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Fall back to environment variable
      return process.env.STRIPE_WEBHOOK_SECRET;
    }

    return null;
  } catch (error) {
    logger.error('Failed to get Stripe webhook secret:', { error });
    return null;
  }
};

/**
 * Check if Stripe is in live mode
 * 
 * @returns Promise resolving to true if Stripe is in live mode
 */
export const isLiveMode = async (): Promise<boolean> => {
  try {
    // First try to get from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });

    if (configDoc?.data && configDoc.data.isLiveMode !== undefined) {
      return configDoc.data.isLiveMode as boolean;
    } else if (process.env.STRIPE_SECRET_KEY) {
      // Fall back to environment variable
      return process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');
    }

    return false;
  } catch (error) {
    logger.error('Failed to check Stripe mode:', { error });
    return false;
  }
};

// Export default object for backward compatibility
export default {
  getStripeClient,
  getPublishableKey,
  getWebhookSecret,
  isLiveMode
};

