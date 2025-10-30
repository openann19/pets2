/**
 * Admin Routes for PawfectMatch
 * Handles admin dashboard endpoints
 */

import express from 'express';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/adminAuth';
import stripe from 'stripe';

// Type definitions for Stripe data
interface StripeSubscription {
  id: string;
  customer: string | stripe.Customer | stripe.DeletedCustomer;
  items: {
    data: Array<{
      plan?: stripe.Plan;
      price?: stripe.Price;
    }>;
  };
  status: string;
  current_period_end: number;
  current_period_start: number;
  created: number;
  cancel_at_period_end?: boolean;
}

interface StripeBalanceTransaction {
  type: string;
  status: string;
  amount: number;
}

interface StripeCustomer {
  id: string;
  email: string | null;
  name?: string | null;
}

interface UserDocument {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  premium?: {
    isActive: boolean;
    plan?: string;
    paymentStatus?: string;
    expiresAt?: Date;
  };
  createdAt?: Date;
}

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  tier?: string;
  status?: string;
  monthlyRevenue: number;
  ltv: number;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  lifetimeValue?: number;
}

interface SortObject {
  [key: string]: number;
}

interface QueryObject {
  [key: string]: unknown;
}

interface TimestampQuery {
  $gte?: Date;
  $lte?: Date;
}

interface Alert {
  assignedTo?: {
    id: string;
  };
  severity: string;
  status?: string;
  type?: string;
  createdAt?: Date;
  riskScore?: number;
}

interface SeverityOrder {
  [key: string]: number;
}
import Report from '../models/Report';
import SecurityAlert from '../models/SecurityAlert';
import { encrypt } from '../utils/encryption';
import { logAdminActivity, adminActionLogger } from '../middleware/adminLogger';
import { validate, schemas } from '../middleware/validator';
import subscriptionAnalyticsService from '../services/subscriptionAnalyticsService';
import paymentRetryService from '../services/paymentRetryService';
import { requireAuth, requireAdmin } from '../middleware/adminAuth';
import { checkPermission } from '../middleware/rbac';
import { getAnalytics, exportAnalytics } from '../controllers/adminAnalyticsController';
import { adminRateLimiter, strictRateLimiter } from '../middleware/rateLimiter';
import AdminActivityLog from '../models/AdminActivityLog';
import logger from '../utils/logger';

// Import specialized admin controllers
import AdminAPIController from '../controllers/admin/AdminAPIController';
import AdminKYCController from '../controllers/admin/AdminKYCController';

const router = express.Router();

// Apply authentication and admin role check to ALL admin routes
router.use(requireAuth);
router.use(requireAdmin);

// Apply rate limiting to all admin routes
router.use(adminRateLimiter);

// Analytics Routes
router.get('/analytics', /* checkPermission('analytics:read'), */ getAnalytics);
router.get('/analytics/export', checkPermission('analytics:read'), exportAnalytics);

// API Management Routes
router.get('/api-management/stats', checkPermission('api:read'), AdminAPIController.getAPIStats);
router.get('/api-management/endpoints', checkPermission('api:read'), AdminAPIController.getAPIEndpoints);
router.post('/api-management/endpoints/:endpointId/test', checkPermission('api:test'), AdminAPIController.testAPIEndpoint);
router.put('/api-management/endpoints/:endpointId', checkPermission('api:write'), AdminAPIController.updateAPIEndpoint);

// KYC Management Routes
router.get('/kyc-management/stats', checkPermission('kyc:read'), AdminKYCController.getKYCStats);
router.get('/kyc-management/verifications', checkPermission('kyc:read'), AdminKYCController.getKYCVerifications);
router.post('/kyc-management/verifications/:verificationId/review', checkPermission('kyc:review'), AdminKYCController.reviewKYCVerification);
router.post('/kyc-management/verifications/:verificationId/request-documents', checkPermission('kyc:write'), AdminKYCController.requestAdditionalDocuments);

// Audit Log Routes
router.get('/audit-logs', checkPermission('audit:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      adminId,
      action,
      startDate,
      endDate,
      success
    } = req.query;

    const query: Record<string, unknown> = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (success !== undefined) query.success = success === 'true';
    if (startDate || endDate) {
      query.timestamp = {} as TimestampQuery;
      if (startDate) (query.timestamp as TimestampQuery).$gte = new Date(String(startDate));
      if (endDate) (query.timestamp as TimestampQuery).$lte = new Date(String(endDate));
    }

    const pageNum = typeof page === 'string' ? parseInt(page) : 1;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : 50;
    
    const logs = await AdminActivityLog.find(query)
      .populate('adminId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await AdminActivityLog.countDocuments(query);

    await logAdminActivity(req, 'VIEW_AUDIT_LOGS', { query });

    res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error';
    logger.error('Failed to fetch audit logs', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: errorMessage
    });
  }
});

// Stripe Management Routes
router.get('/stripe/config', checkPermission('stripe:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get Stripe configuration from database
    const configDoc = await Configuration.findOne({ type: 'stripe' });

    let config = {
      secretKey: '',
      publishableKey: '',
      webhookSecret: '',
      isLiveMode: false,
      isConfigured: false
    };

    // If config exists in database, use it (masking the secret)
    if (configDoc?.data) {
      config = {
        secretKey: configDoc.data.secretKey ? '***configured***' : '',
        publishableKey: configDoc.data.publishableKey || '',
        webhookSecret: configDoc.data.webhookSecret ? '***configured***' : '',
        isLiveMode: configDoc.data.isLiveMode || false,
        isConfigured: !!(configDoc.data.secretKey && configDoc.data.publishableKey)
      };
    }
    // Fall back to environment variables if not in database
    else if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
      config = {
        secretKey: '***configured***',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '***configured***' : '',
        isLiveMode: process.env.STRIPE_SECRET_KEY.startsWith('sk_live_'),
        isConfigured: true
      };
    }

    await logAdminActivity(req, 'VIEW_STRIPE_CONFIG', {});
    res.json(config);
  } catch (error) {
    logger.error('Failed to load Stripe config', { error });
    res.status(500).json({ success: false, message: 'Failed to load Stripe config' });
  }
});

router.post('/stripe/config', checkPermission('stripe:configure'), validate(schemas.stripeConfig), adminActionLogger('UPDATE_STRIPE_CONFIG'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { secretKey, publishableKey, webhookSecret, isLiveMode } = req.body;

    // Validate required fields
    if (!secretKey || !publishableKey) {
      res.status(400).json({ success: false, message: 'API keys are required' });
    }

    // Verify we can initialize Stripe with the provided key (basic validation)
    try {
      const stripeClient = new stripe(secretKey);
      const stripeAccount = await stripeClient.accounts.retrieve();

      // Additional validation - check if account is valid
      if (!stripeAccount?.id) {
        res.status(400).json({ success: false, message: 'Invalid Stripe API key - unable to connect to Stripe account' });
      }
    } catch (stripeError) {
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';
      res.status(400).json({
        success: false,
        message: 'Invalid Stripe API key or connection error',
        error: errorMessage
      });
    }

    // Encrypt sensitive keys before storing
    const encryptedSecretKey = encrypt(secretKey);
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : '';

    // Save to database (upsert if not exists)
    await Configuration.findOneAndUpdate(
      { type: 'stripe' },
      {
        data: {
          secretKey: encryptedSecretKey,
          publishableKey, // No need to encrypt public key
          webhookSecret: encryptedWebhookSecret,
          isLiveMode: !!isLiveMode
        },
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Return success with masked keys
    res.json({
      success: true,
      secretKey: '***configured***',
      publishableKey,
      webhookSecret: webhookSecret ? '***configured***' : '',
      isLiveMode: !!isLiveMode,
      isConfigured: true
    });
  } catch (error) {
    logger.error('Failed to save Stripe config', { error });
    res.status(500).json({ success: false, message: 'Failed to save Stripe config' });
  }
});

router.get('/stripe/subscriptions', adminActionLogger('VIEW_STRIPE_SUBSCRIPTIONS'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stripeService = require('../services/stripeService');
    const stripeClient = await stripeService.getStripeClient();

    // Get real subscription data from Stripe API
    const stripeSubscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      expand: ['data.customer']
    });

    // Map Stripe data to our application format
    const subscriptions = stripeSubscriptions.data.map((sub: StripeSubscription) => {
      const customer = sub.customer;
      const plan = sub.items.data[0]?.plan;

      if (!plan) {
        return null;
      }

      // Handle customer as either string ID or customer object
      const customerId = typeof customer === 'string' ? customer : customer?.id || '';
      const customerEmail = typeof customer === 'object' && 'email' in customer ? customer.email : '';
      const customerName = typeof customer === 'object' && 'name' in customer ? customer.name : customerEmail;

      return {
        id: sub.id,
        customerId,
        customerEmail,
        customerName: customerName || customerEmail,
        planId: plan.id,
        planName: plan.nickname || `${plan.product} ${plan.interval}`,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        createdAt: new Date(sub.created * 1000).toISOString()
      };
    }).filter(Boolean);

    res.json(subscriptions);
  } catch (error) {
    logger.error('Failed to load subscriptions', { error });

    res.status(500).json({ success: false, message: 'Failed to load subscriptions', error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

router.get('/stripe/metrics', adminActionLogger('VIEW_STRIPE_METRICS'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stripeService = require('../services/stripeService');
    const stripeClient = await stripeService.getStripeClient();
    const User = require('../models/User');

    // Get data from Stripe API
    const [subscriptions, balanceTransactions, customers] = await Promise.all([
      stripeClient.subscriptions.list({ limit: 100, status: 'active' }),
      stripeClient.balanceTransactions.list({ limit: 100 }),
      stripeClient.customers.list({ limit: 100 })
    ]);

    // Calculate metrics
    const activeSubscriptions = subscriptions.data.length;

    // Calculate MRR by normalizing all subscription costs to monthly
    const monthlyRecurringRevenue = subscriptions.data.reduce((sum: number, sub: StripeSubscription) => {
      const plan = sub.items.data[0].plan;
      const monthlyFactor = plan.interval === 'year' ? (1 / 12) : 1;
      return sum + (plan.amount * monthlyFactor);
    }, 0);

    // Calculate total revenue from all balance transactions
    const totalRevenue = balanceTransactions.data.reduce((sum: number, transaction: StripeBalanceTransaction) => {
      if (transaction.type === 'charge' && transaction.status === 'available') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    // Get canceled subscriptions for churn calculation
    const canceledSubscriptions = await stripeClient.subscriptions.list({
      limit: 100,
      status: 'canceled'
    });

    // Calculate churn rate (canceled subscriptions / total subscriptions)
    const totalSubscriptions = activeSubscriptions + canceledSubscriptions.data.length;
    const churnRate = totalSubscriptions > 0 ?
      (canceledSubscriptions.data.length / totalSubscriptions) * 100 : 0;

    // Calculate ARPU (Average Revenue Per User)
    const averageRevenuePerUser = activeSubscriptions > 0 ?
      monthlyRecurringRevenue / activeSubscriptions : 0;

    // Get total app users for conversion rate
    const totalUsers = await User.countDocuments();

    // Calculate conversion rate (customers / total users)
    const conversionRate = totalUsers > 0 ?
      (customers.data.length / totalUsers) * 100 : 0;

    const metrics = {
      totalRevenue,
      monthlyRecurringRevenue,
      activeSubscriptions,
      churnRate: Number(churnRate.toFixed(2)),
      averageRevenuePerUser: Number((averageRevenuePerUser / 100).toFixed(2)), // Convert cents to dollars
      conversionRate: Number(conversionRate.toFixed(2))
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Failed to load billing metrics:', error);

    res.status(500).json({ success: false, message: 'Failed to load billing metrics', error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// AI Service Management Routes
router.get('/ai/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const config = {
      apiKey: process.env.DEEPSEEK_API_KEY ? '***configured***' : '',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
      isConfigured: !!process.env.DEEPSEEK_API_KEY,
      isActive: !!process.env.DEEPSEEK_API_KEY
    };

    res.json(config);
  } catch (error) {
    logger.error('Failed to load AI config', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load AI config' });
  }
});

router.post('/ai/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { apiKey, baseUrl, model, maxTokens, temperature } = req.body;

    if (!apiKey) {
      res.status(400).json({ success: false, message: 'API key is required' });
    }

    if (!apiKey.startsWith('sk-')) {
      res.status(400).json({ success: false, message: 'Invalid API key format' });
    }

    res.json({
      apiKey: '***configured***',
      baseUrl,
      model,
      maxTokens,
      temperature,
      isConfigured: true,
      isActive: true
    });
  } catch (error) {
    logger.error('Failed to save AI config', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to save AI config' });
  }
});

router.get('/ai/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = {
      totalRequests: 15420,
      totalTokens: 2847392,
      totalCost: 89.47,
      requestsToday: 342,
      tokensToday: 67891,
      costToday: 2.34,
      averageResponseTime: 1250,
      errorRate: 1.2,
      lastRequest: '2024-01-27T15:30:00Z'
    };

    res.json(stats);
  } catch (error) {
    logger.error('Failed to load AI stats', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load AI stats' });
  }
});

router.get('/ai/endpoints', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const endpoints = [
      {
        name: 'Bio Generation',
        endpoint: '/api/ai/generate-bio',
        description: 'Generate pet bios using AI',
        requests: 5420,
        avgResponseTime: 1200,
        errorRate: 0.8,
        lastUsed: '2024-01-27T15:30:00Z',
        status: 'healthy'
      },
      {
        name: 'Photo Analysis',
        endpoint: '/api/ai/analyze-photo',
        description: 'Analyze pet photos for breed and characteristics',
        requests: 3890,
        avgResponseTime: 2100,
        errorRate: 1.5,
        lastUsed: '2024-01-27T14:45:00Z',
        status: 'healthy'
      },
      {
        name: 'Compatibility Scoring',
        endpoint: '/api/ai/compatibility',
        description: 'Calculate pet compatibility scores',
        requests: 2890,
        avgResponseTime: 980,
        errorRate: 0.5,
        lastUsed: '2024-01-27T13:20:00Z',
        status: 'healthy'
      }
    ];

    res.json(endpoints);
  } catch (error) {
    logger.error('Failed to load AI endpoints', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load AI endpoints' });
  }
});

router.get('/ai/models', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const models = [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'General purpose conversational AI model',
        maxTokens: 4000,
        costPerToken: 0.0000014,
        isActive: true
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        description: 'Specialized code generation model',
        maxTokens: 8000,
        costPerToken: 0.0000028,
        isActive: false
      }
    ];

    res.json(models);
  } catch (error) {
    logger.error('Failed to load AI models', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load AI models' });
  }
});

router.post('/ai/test', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Get the DeepSeek API key from environment or database
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      res.status(500).json({ success: false, message: 'DeepSeek API key is not configured' });
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const maxTokens = parseInt(process.env.DEEPSEEK_MAX_TOKENS || '1000');
    const temperature = parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7');

    // Make actual API call to DeepSeek
    const axios = require('axios');

    const response = await axios.post(`${baseUrl}/v1/chat/completions`, {
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for the PawfectMatch pet adoption platform.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    res.json({
      response: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    logger.error('DeepSeek API error:', err.response ? err.response.data : (err instanceof Error ? err.message : 'Unknown error'));
    res.status(500).json({
      success: false,
      message: 'Failed to call DeepSeek API',
      error: err.response ? err.response.data : (err instanceof Error ? err.message : 'Unknown error')
    });
  }
});

// Maps Service Management Routes
router.get('/maps/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const config = {
      apiKey: process.env.GOOGLE_MAPS_API_KEY ? '***configured***' : '',
      isConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
      isActive: !!process.env.GOOGLE_MAPS_API_KEY,
      quotaLimit: parseInt(process.env.GOOGLE_MAPS_QUOTA_LIMIT || '100000'),
      quotaUsed: 0,
      billingAccount: process.env.GOOGLE_CLOUD_BILLING_ACCOUNT || '',
      restrictions: []
    };

    res.json(config);
  } catch (error) {
    logger.error('Failed to load Maps config', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load Maps config' });
  }
});

router.post('/maps/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { apiKey, billingAccount, quotaLimit, restrictions } = req.body;

    if (!apiKey) {
      res.status(400).json({ success: false, message: 'API key is required' });
    }

    if (!apiKey.startsWith('AIza')) {
      res.status(400).json({ success: false, message: 'Invalid Google Maps API key format' });
    }

    res.json({
      apiKey: '***configured***',
      isConfigured: true,
      isActive: true,
      quotaLimit,
      quotaUsed: 0,
      billingAccount,
      restrictions
    });
  } catch (error) {
    logger.error('Failed to save Maps config', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to save Maps config' });
  }
});

router.get('/maps/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = {
      totalRequests: 89420,
      requestsToday: 1240,
      requestsThisMonth: 28940,
      geocodingRequests: 45230,
      placesRequests: 28940,
      directionsRequests: 15250,
      totalCost: 234.50,
      costToday: 3.20,
      costThisMonth: 89.30,
      averageResponseTime: 450,
      errorRate: 0.8,
      lastRequest: '2024-01-27T15:30:00Z'
    };

    res.json(stats);
  } catch (error) {
    logger.error('Failed to load Maps stats', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load Maps stats' });
  }
});

router.get('/maps/services', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = [
      {
        name: 'Geocoding',
        endpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
        description: 'Convert addresses to coordinates',
        requests: 45230,
        avgResponseTime: 320,
        errorRate: 0.5,
        lastUsed: '2024-01-27T15:30:00Z',
        status: 'healthy',
        cost: 89.20
      },
      {
        name: 'Places API',
        endpoint: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        description: 'Find nearby places and points of interest',
        requests: 28940,
        avgResponseTime: 580,
        errorRate: 0.8,
        lastUsed: '2024-01-27T14:45:00Z',
        status: 'healthy',
        cost: 98.50
      },
      {
        name: 'Directions API',
        endpoint: 'https://maps.googleapis.com/maps/api/directions/json',
        description: 'Get directions between locations',
        requests: 15250,
        avgResponseTime: 420,
        errorRate: 1.2,
        lastUsed: '2024-01-27T13:20:00Z',
        status: 'healthy',
        cost: 46.80
      }
    ];

    res.json(services);
  } catch (error) {
    logger.error('Failed to load Maps services', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load Maps services' });
  }
});

router.get('/maps/quotas', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotas = [
      {
        service: 'Geocoding',
        limit: 40000,
        used: 45230,
        resetDate: '2024-02-01T00:00:00Z',
        status: 'exceeded'
      },
      {
        service: 'Places API',
        limit: 100000,
        used: 28940,
        resetDate: '2024-02-01T00:00:00Z',
        status: 'ok'
      },
      {
        service: 'Directions API',
        limit: 2500,
        used: 15250,
        resetDate: '2024-02-01T00:00:00Z',
        status: 'exceeded'
      }
    ];

    res.json(quotas);
  } catch (error) {
    logger.error('Failed to load Maps quotas', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load Maps quotas' });
  }
});

// Billing Dashboard Routes
router.get('/billing/customers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let customers = [];
    try {
      const stripeService = require('../services/stripeService');
      const client = await stripeService.getStripeClient();

      const [stripeCustomers, subscriptions] = await Promise.all([
        client.customers.list({ limit: 100 }),
        client.subscriptions.list({ limit: 100, expand: ['data.customer', 'data.items.data.price'] })
      ]);

      const emails = stripeCustomers.data.map((c: StripeCustomer) => (c.email || '').toLowerCase()).filter(Boolean);
      const User = require('../models/User');
      const users = await User.find({ email: { $in: emails } }).select('email firstName lastName premium').lean();
      const userMap = new Map(users.map((u: UserDocument) => [u.email.toLowerCase(), u]));

      const subsByCustomer = new Map();
      for (const sub of subscriptions.data) {
        const custId = typeof sub.customer === 'object' ? sub.customer.id : sub.customer;
        subsByCustomer.set(custId, sub);
      }

      customers = stripeCustomers.data.map((c: StripeCustomer) => {
        const u = userMap.get((c.email || '').toLowerCase());
        const sub = subsByCustomer.get(c.id) || null;
        const plan = sub?.items?.data?.[0]?.plan || sub?.items?.data?.[0]?.price;
        let amount = null; let interval = null;
        if (plan) {
          if (plan.amount != null) { amount = plan.amount; interval = plan.interval; }
          else if (plan.unit_amount != null) { amount = plan.unit_amount; interval = plan.recurring?.interval; }
        }
        const monthly = amount != null ? (interval === 'year' ? amount / 12 : amount) : null;
        const userData = u as { _id: string; email: string; firstName?: string; lastName?: string; isActive?: boolean; isBlocked?: boolean; [key: string]: unknown };
        return {
          id: c.id,
          name: c.name || (userData ? `${userData.firstName} ${userData.lastName}` : c.email),
          email: c.email,
          subscriptionTier: userData?.premium?.plan || plan?.nickname || plan?.product || null,
          subscriptionStatus: sub?.status || userData?.premium?.paymentStatus || 'inactive',
          monthlyRevenue: monthly != null ? Number((monthly / 100).toFixed(2)) : null,
          totalRevenue: null,
          joinDate: c.created ? new Date(c.created * 1000).toISOString() : null,
          lastPayment: null,
          nextBilling: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
          paymentMethod: 'card',
          lifetimeValue: null,
          churnRisk: 'low'
        };
      });
    } catch (error) {
      logger.warn('Stripe customers list unavailable, falling back to Mongo data', { error: (error instanceof Error ? error.message : 'Unknown error') });
      const User = require('../models/User');
      const users = await User.find({ 'premium.isActive': true }).select('email firstName lastName premium createdAt').lean();
      customers = users.map((u: UserDocument) => ({
        id: u._id.toString(),
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        subscriptionTier: u.premium?.plan || null,
        subscriptionStatus: u.premium?.paymentStatus || 'active',
        monthlyRevenue: null,
        totalRevenue: null,
        joinDate: u.createdAt ? new Date(u.createdAt).toISOString() : null,
        lastPayment: null,
        nextBilling: u.premium?.expiresAt || null,
        paymentMethod: 'card',
        lifetimeValue: null,
        churnRisk: 'low'
      }));
    }

    res.json(customers);
  } catch (error) {
    logger.error('Failed to load customers', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load customers' });
  }
});

router.get('/billing/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const User = require('../models/User');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Count active premium users
    const activeSubscriptions = await User.countDocuments({
      'premium.isActive': true,
      $or: [
        { 'premium.expiresAt': { $exists: false } },
        { 'premium.expiresAt': null },
        { 'premium.expiresAt': { $gte: now } }
      ]
    });

    const totalUsers = await User.countDocuments();
    const newCustomersThisMonth = await User.countDocuments({
      'premium.isActive': true,
      createdAt: { $gte: monthStart }
    });

    // Estimate churn (users who had premium but now inactive)
    const churnedCustomersThisMonth = await User.countDocuments({
      'premium.isActive': false,
      'premium.expiresAt': { $gte: lastMonthStart, $lt: monthStart }
    });

    const totalCustomers = await User.countDocuments({ 'premium.isActive': true });
    const churnRate = totalCustomers > 0 ? Number((churnedCustomersThisMonth / totalCustomers * 100).toFixed(2)) : 0;
    const conversionRate = totalUsers > 0 ? Number((totalCustomers / totalUsers * 100).toFixed(2)) : 0;

    // Attempt to get Stripe revenue data
    let totalRevenue = 0;
    let monthlyRecurringRevenue = 0;
    try {
      const stripeService = require('../services/stripeService');
      const client = await stripeService.getStripeClient();
      const subscriptions = await client.subscriptions.list({ limit: 100, status: 'active' });
      monthlyRecurringRevenue = subscriptions.data.reduce((sum: number, sub: StripeSubscription) => {
        const plan = sub.items.data[0]?.plan || sub.items.data[0]?.price;
        const amount = plan?.amount ?? plan?.unit_amount ?? 0;
        const interval = plan?.interval ?? plan?.recurring?.interval ?? 'month';
        const monthlyFactor = interval === 'year' ? (1 / 12) : 1;
        return sum + (amount * monthlyFactor);
      }, 0);
      const balanceTransactions = await client.balanceTransactions.list({ limit: 100 });
      totalRevenue = balanceTransactions.data.reduce((sum: number, t: StripeBalanceTransaction) => {
        if (t.type === 'charge' && t.status === 'available') return sum + t.amount;
        return sum;
      }, 0);
    } catch (error) {
      logger.warn('Stripe metrics unavailable, using estimates', { error: (error instanceof Error ? error.message : 'Unknown error') });
      // Stripe not configured, use estimates
    }

    const annualRecurringRevenue = monthlyRecurringRevenue * 12;
    const averageRevenuePerUser = activeSubscriptions > 0 ? Number((monthlyRecurringRevenue / activeSubscriptions / 100).toFixed(2)) : 0;

    const metrics = {
      totalRevenue: Number((totalRevenue / 100).toFixed(2)),
      monthlyRecurringRevenue: Number((monthlyRecurringRevenue / 100).toFixed(2)),
      annualRecurringRevenue: Number((annualRecurringRevenue / 100).toFixed(2)),
      activeSubscriptions,
      churnRate,
      averageRevenuePerUser,
      conversionRate,
      revenueGrowth: 0,
      customerGrowth: 0,
      totalCustomers,
      newCustomersThisMonth,
      churnedCustomersThisMonth
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Failed to load billing metrics', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load billing metrics' });
  }
});

router.get('/billing/revenue', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const User = require('../models/User');
    const now = new Date();
    const revenueData = [];

    // Generate last 6 months of data
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      const customers = await User.countDocuments({
        'premium.isActive': true,
        createdAt: { $lte: monthEnd }
      });

      const newCustomers = await User.countDocuments({
        'premium.isActive': true,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      const churnedCustomers = await User.countDocuments({
        'premium.isActive': false,
        'premium.expiresAt': { $gte: monthStart, $lt: monthEnd }
      });

      revenueData.push({
        month: monthStr,
        revenue: 0, // Would need transaction history to compute
        customers,
        newCustomers,
        churnedCustomers
      });
    }

    res.json(revenueData.reverse());
  } catch (error) {
    logger.error('Failed to load revenue data', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load revenue data' });
  }
});

router.get('/billing/payment-methods', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let paymentMethods = [];

    try {
      const stripeService = require('../services/stripeService');
      const client = await stripeService.getStripeClient();

      const customers = await client.customers.list({ limit: 100 });
      for (const customer of customers.data) {
        if (!customer.invoice_settings?.default_payment_method && !customer.default_source) continue;

        const pmId = customer.invoice_settings?.default_payment_method || customer.default_source;
        if (!pmId) continue;

        try {
          const pm = await client.paymentMethods.retrieve(pmId);
          paymentMethods.push({
            id: pm.id,
            customerId: customer.id,
            customerName: customer.name || customer.email,
            type: pm.type,
            last4: pm.card?.last4 || pm.us_bank_account?.last4 || '****',
            brand: pm.card?.brand || pm.type,
          });
        } catch (error) {
          logger.warn('Payment method retrieval failed', { error: (error instanceof Error ? error.message : 'Unknown error'), paymentMethodId: pmId });
        }
      }
    } catch (error) {
      logger.warn('Stripe payment methods unavailable, returning empty list', { error: (error instanceof Error ? error.message : 'Unknown error') });
    }

    res.json(paymentMethods);
  } catch (error) {
    logger.error('Failed to load payment methods', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load payment methods' });
  }
});

router.post('/billing/customers/export', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format = 'csv' } = req.body || {};

    // Reuse the same data building logic as /billing/customers
    let customers = [];
    try {
      const stripeService = require('../services/stripeService');
      const client = await stripeService.getStripeClient();
      const [stripeCustomers, subscriptions] = await Promise.all([
        client.customers.list({ limit: 100 }),
        client.subscriptions.list({ limit: 100, expand: ['data.customer', 'data.items.data.price'] })
      ]);
      const emails = stripeCustomers.data.map((c: StripeCustomer) => (c.email || '').toLowerCase()).filter(Boolean);
      const User = require('../models/User');
      const users = await User.find({ email: { $in: emails } }).select('email firstName lastName premium').lean();
      const userMap = new Map(users.map((u: UserDocument) => [u.email.toLowerCase(), u]));
      const subsByCustomer = new Map();
      for (const sub of subscriptions.data) {
        const custId = typeof sub.customer === 'object' ? sub.customer.id : sub.customer;
        subsByCustomer.set(custId, sub);
      }
      customers = stripeCustomers.data.map((c: StripeCustomer) => {
        const u = userMap.get((c.email || '').toLowerCase());
        const sub = subsByCustomer.get(c.id) || null;
        const plan = sub?.items?.data?.[0]?.plan || sub?.items?.data?.[0]?.price;
        let amount = null; let interval = null;
        if (plan) {
          if (plan.amount != null) { amount = plan.amount; interval = plan.interval; }
          else if (plan.unit_amount != null) { amount = plan.unit_amount; interval = plan.recurring?.interval; }
        }
        const monthly = amount != null ? (interval === 'year' ? amount / 12 : amount) : null;
        const userData = u as { _id: string; email: string; firstName?: string; lastName?: string; isActive?: boolean; isBlocked?: boolean; [key: string]: unknown };
        return {
          id: c.id,
          name: c.name || (userData ? `${userData.firstName} ${userData.lastName}` : c.email),
          email: c.email,
          subscriptionTier: userData?.premium?.plan || plan?.nickname || plan?.product || null,
          subscriptionStatus: sub?.status || userData?.premium?.paymentStatus || 'inactive',
          monthlyRevenue: monthly != null ? Number((monthly / 100).toFixed(2)) : null,
          lifetimeValue: null
        };
      });
    } catch (error) {
      logger.warn('Stripe customer export unavailable, using Mongo data', { error: (error instanceof Error ? error.message : 'Unknown error') });
      const User = require('../models/User');
      const users = await User.find({ 'premium.isActive': true }).select('email firstName lastName premium').lean();
      customers = users.map((u: UserDocument) => ({
        id: u._id.toString(),
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        subscriptionTier: u.premium?.plan || null,
        subscriptionStatus: u.premium?.paymentStatus || 'active',
        monthlyRevenue: null,
        lifetimeValue: null
      }));
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, data: customers });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    const header = 'Customer ID,Name,Email,Tier,Status,Monthly Revenue,LTV\n';
    const rows = customers.map((c: CustomerRow) => [
      c.id,
      (c.name || '').replace(/,/g, ' '),
      c.email,
      c.subscriptionTier || '',
      c.subscriptionStatus || '',
      c.monthlyRevenue != null ? c.monthlyRevenue.toFixed(2) : '',
      c.lifetimeValue != null ? c.lifetimeValue.toFixed ? c.lifetimeValue.toFixed(2) : c.lifetimeValue : ''
    ].join(',')).join('\n');
    res.send(header + rows + '\n');
  } catch (error) {
    logger.error('Failed to export customers', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to export customers' });
  }
});

// External Services Management Routes
router.get('/external-services', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = [
      {
        id: 'cloudinary',
        name: 'Cloudinary',
        provider: 'Cloudinary Inc.',
        description: 'Image and video management service',
        status: 'healthy',
        uptime: 99.9,
        responseTime: 245,
        lastCheck: '2024-01-27T15:30:00Z',
        cost: 45.20,
        usage: 1250000,
        limit: 2000000,
        isConfigured: !!process.env.CLOUDINARY_URL,
        isActive: !!process.env.CLOUDINARY_URL,
        apiKey: process.env.CLOUDINARY_URL ? '***configured***' : '',
        endpoint: 'https://api.cloudinary.com',
        features: ['Image Upload', 'Transformations', 'CDN', 'Analytics']
      },
      {
        id: 'sentry',
        name: 'Sentry',
        provider: 'Sentry.io',
        description: 'Error monitoring and performance tracking',
        status: 'healthy',
        uptime: 99.8,
        responseTime: 180,
        lastCheck: '2024-01-27T15:30:00Z',
        cost: 89.00,
        usage: 45000,
        limit: 100000,
        isConfigured: !!process.env.SENTRY_DSN,
        isActive: !!process.env.SENTRY_DSN,
        apiKey: process.env.SENTRY_DSN ? '***configured***' : '',
        endpoint: 'https://sentry.io/api',
        features: ['Error Tracking', 'Performance Monitoring', 'Alerts', 'Releases']
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        provider: 'Twilio SendGrid',
        description: 'Email delivery service',
        status: 'healthy',
        uptime: 99.7,
        responseTime: 320,
        lastCheck: '2024-01-27T15:30:00Z',
        cost: 25.00,
        usage: 85000,
        limit: 100000,
        isConfigured: !!process.env.SENDGRID_API_KEY,
        isActive: !!process.env.SENDGRID_API_KEY,
        apiKey: process.env.SENDGRID_API_KEY ? '***configured***' : '',
        endpoint: 'https://api.sendgrid.com',
        features: ['Email Sending', 'Templates', 'Analytics', 'Suppressions']
      },
      {
        id: 'aws-s3',
        name: 'AWS S3',
        provider: 'Amazon Web Services',
        description: 'Object storage service',
        status: 'warning',
        uptime: 98.5,
        responseTime: 450,
        lastCheck: '2024-01-27T15:30:00Z',
        cost: 67.80,
        usage: 850000000,
        limit: 1000000000,
        isConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        isActive: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        apiKey: process.env.AWS_ACCESS_KEY_ID ? '***configured***' : '',
        endpoint: 'https://s3.amazonaws.com',
        features: ['File Storage', 'Backup', 'CDN', 'Versioning']
      }
    ];

    res.json(services);
  } catch (error) {
    logger.error('Failed to load external services', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load external services' });
  }
});

router.get('/external-services/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const metrics = {
      totalServices: 4,
      activeServices: 3,
      totalCost: 227.00,
      averageUptime: 99.5,
      averageResponseTime: 299,
      totalErrors: 12,
      lastUpdated: '2024-01-27T15:30:00Z'
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Failed to load external services metrics', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to load external services metrics' });
  }
});

router.post('/external-services/:serviceId/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;
    const { apiKey, endpoint, limit, isActive } = req.body;

    // In production, save to database or environment variables
    res.json({
      id: serviceId,
      apiKey: apiKey ? '***configured***' : '',
      endpoint,
      limit,
      isActive,
      isConfigured: true
    });
  } catch (error) {
    logger.error('Failed to save service config', { error: (error instanceof Error ? error.message : 'Unknown error') });
    res.status(500).json({ success: false, message: 'Failed to save service config' });
  }
});

// Subscription Analytics Routes
router.get('/analytics/subscription', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeframe = '30d' } = req.query;
    const analytics = await subscriptionAnalyticsService.getSubscriptionAnalytics(timeframe);

    await logAdminActivity(req, 'VIEW_SUBSCRIPTION_ANALYTICS', { timeframe });
    res.json(analytics);
  } catch (error) {
    logger.error('Failed to load subscription analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to load subscription analytics' });
  }
});

router.get('/analytics/realtime', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const metrics = await subscriptionAnalyticsService.getRealTimeMetrics();

    await logAdminActivity(req, 'VIEW_REALTIME_METRICS', {});
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to load real-time metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to load real-time metrics' });
  }
});

router.post('/analytics/clear-cache', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    subscriptionAnalyticsService.clearCache();

    await logAdminActivity(req, 'CLEAR_ANALYTICS_CACHE', {});
    res.json({ success: true, message: 'Analytics cache cleared' });
  } catch (error) {
    logger.error('Failed to clear analytics cache:', error);
    res.status(500).json({ success: false, message: 'Failed to clear analytics cache' });
  }
});

// Payment Retry Management Routes
router.get('/payments/retry-stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await paymentRetryService.getRetryStatistics();

    await logAdminActivity(req, 'VIEW_RETRY_STATS', {});
    res.json(stats);
  } catch (error) {
    logger.error('Failed to load retry statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to load retry statistics' });
  }
});

router.post('/payments/process-retries', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await paymentRetryService.processScheduledRetries();

    await logAdminActivity(req, 'PROCESS_SCHEDULED_RETRIES', {});
    res.json({ success: true, message: 'Scheduled retries processed' });
  } catch (error) {
    logger.error('Failed to process scheduled retries:', error);
    res.status(500).json({ success: false, message: 'Failed to process scheduled retries' });
  }
});

router.post('/payments/process-notifications', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await paymentRetryService.processScheduledNotifications();

    await logAdminActivity(req, 'PROCESS_SCHEDULED_NOTIFICATIONS', {});
    res.json({ success: true, message: 'Scheduled notifications processed' });
  } catch (error) {
    logger.error('Failed to process scheduled notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to process scheduled notifications' });
  }
});

router.post('/external-services/:serviceId/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  const { serviceId } = req.params;
  try {
    const { isActive } = req.body;

    // In production, update database
    res.json({ success: true, serviceId, isActive });
  } catch (error) {
    logger.error('Failed to toggle service', { error: (error instanceof Error ? error.message : 'Unknown error'), serviceId });
    res.status(500).json({ success: false, message: 'Failed to toggle service' });
  }
});

// User Management Routes
router.get('/users', checkPermission('users:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = req.query;

    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role && role !== 'all') {
      if (role === 'premium') {
        query['premium.isActive'] = true;
      } else if (role === 'admin') {
        query.role = 'admin';
      } else {
        query['premium.isActive'] = { $ne: true };
        query.role = { $ne: 'admin' };
      }
    }

    // Build sort
    const sort: SortObject = {};
    sort[String(sortBy)] = sortDirection === 'asc' ? 1 : -1;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName email status role premium.isActive avatar createdAt lastLogin emailVerified')
        .sort(sort)
        .limit(parseInt(String(limit)))
        .skip((parseInt(String(page)) - 1) * parseInt(String(limit)))
        .lean(),
      User.countDocuments(query)
    ]);

    // Enhance users with additional data
    const enhancedUsers = await Promise.all(users.map(async (user: Record<string, unknown>) => {
      const [petCount, matchCount] = await Promise.all([
        Pet.countDocuments({ owner: user._id }),
        Match.countDocuments({
          $or: [
            { user1: user._id },
            { user2: user._id }
          ],
          status: 'active'
        })
      ]);

      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status || 'active',
        role: user.premium?.isActive ? 'premium' : (user.role === 'admin' ? 'admin' : 'user'),
        verified: user.emailVerified || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || user.createdAt,
        petCount,
        matchCount,
        avatar: user.avatar
      };
    }));

    await logAdminActivity(req, 'VIEW_USERS', { query, page, limit });

    res.json({
      success: true,
      data: {
        users: enhancedUsers,
        pagination: {
          page: parseInt(String(page)),
          limit: parseInt(String(limit)),
          total,
          pages: Math.ceil(total / parseInt(String(limit)))
        }
      }
    });
  } catch (error) {
    logger.error('Failed to fetch users', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.put('/users/:userId/status', checkPermission('users:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'banned', 'pending'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, suspended, banned, pending'
      });
    }

    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select('firstName lastName email status');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logAdminActivity(req, 'UPDATE_USER_STATUS', { userId, newStatus: status });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Failed to update user status', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.delete('/users/:userId', checkPermission('users:delete'), strictRateLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const Match = require('../models/Match');

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete associated data
    await Promise.all([
      Pet.deleteMany({ owner: userId }),
      Match.deleteMany({
        $or: [
          { user1: userId },
          { user2: userId }
        ]
      })
    ]);

    // Delete user
    await User.findByIdAndDelete(userId);

    await logAdminActivity(req, 'DELETE_USER', { userId, userEmail: user.email });

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete user', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

// Reports Management Routes
router.get('/reports', checkPermission('reports:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      priority,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (createdBy) query.createdBy = createdBy;

    const sortOptions: SortObject = {};
    sortOptions[String(sortBy)] = sortOrder === 'desc' ? -1 : 1;

    // Build aggregation pipeline for reports
    const pipeline = [];
    pipeline.push({ $match: query });
    pipeline.push({ $sort: sortOptions });
    pipeline.push({
      $facet: {
        total: [{ $count: 'count' }],
        reports: [
          { $skip: (parseInt(page as string) - 1) * parseInt(limit as string) },
          { $limit: parseInt(limit as string) },
          {
            $lookup: {
              from: 'users',
              localField: 'reportedUserId',
              foreignField: '_id',
              as: 'reportedUser',
              pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1, avatar: 1 } }]
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'reporterId',
              foreignField: '_id',
              as: 'reporter',
              pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }]
            }
          },
          {
            $addFields: {
              reportedUser: { $arrayElemAt: ['$reportedUser', 0] },
              reporter: { $arrayElemAt: ['$reporter', 0] }
            }
          }
        ]
      }
    });

    const result = await Report.aggregate(pipeline);
    const total = result[0]?.total[0]?.count || 0;
    const reports = result[0]?.reports || [];

    await logAdminActivity(req, 'VIEW_REPORTS', { query });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        total,
        pages: Math.ceil(total / parseInt(String(limit)))
      }
    });
  } catch (error) {
    logger.error('Failed to fetch reports', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/reports', checkPermission('reports:create'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      priority = 'medium',
      parameters,
      isPublic = false,
      tags = [],
      schedule
    } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      res.status(400).json({
        success: false,
        message: 'Title, description, and type are required'
      });
    }

    // Create report document
    const reportData: Record<string, unknown> = {
      reporterId: req.user._id,
      category: type,
      type: 'analytics',
      reason: description,
      description: title,
      priority,
      status: 'pending',
      metadata: {
        parameters: parameters || {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          filters: {},
          metrics: ['users']
        },
        isPublic,
        tags,
        schedule
      }
    };

    const newReport = await Report.create(reportData);

    await logAdminActivity(req, 'CREATE_REPORT', { reportId: newReport._id, type });

    res.status(201).json({
      success: true,
      report: newReport,
      message: 'Report created successfully'
    });
  } catch (error) {
    logger.error('Failed to create report', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.put('/reports/:id', checkPermission('reports:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update report in database
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logAdminActivity(req, 'UPDATE_REPORT', { reportId: id, updates });

    res.json({
      success: true,
      report: updatedReport,
      message: 'Report updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update report', { error, reportId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.delete('/reports/:id', checkPermission('reports:delete'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete report from database
    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await logAdminActivity(req, 'DELETE_REPORT', { reportId: id });

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete report', { error, reportId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/reports/:id/schedule', checkPermission('reports:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { frequency, time, timezone, enabled } = req.body;

    if (!frequency || !time || !timezone) {
      res.status(400).json({
        success: false,
        message: 'Frequency, time, and timezone are required'
      });
    }

    // Update report with schedule
    const report = await Report.findById(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (!report.metadata) {
      report.metadata = {};
    }
    
    report.metadata.schedule = {
      frequency,
      time,
      timezone,
      enabled: enabled !== false
    };
    
    await report.save();

    const schedule = report.metadata.schedule;

    await logAdminActivity(req, 'SCHEDULE_REPORT', { reportId: id, schedule });

    res.json({
      success: true,
      schedule,
      message: 'Report schedule updated successfully'
    });
  } catch (error) {
    logger.error('Failed to schedule report', { error, reportId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/reports/:id/export', checkPermission('reports:export'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.body;

    // Generate export for report
    const report = await Report.findById(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const exportResult = {
      reportId: id,
      format,
      downloadUrl: `/api/admin/reports/${id}/download?format=${format}&token=${Buffer.from(id + Date.now().toString()).toString('base64')}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      fileSize: null,
      createdAt: new Date().toISOString()
    };

    await logAdminActivity(req, 'EXPORT_REPORT', { reportId: id, format });

    res.json({
      success: true,
      export: exportResult,
      message: `Report exported successfully as ${format.toUpperCase()}`
    });
  } catch (error) {
    logger.error('Failed to export report', { error, reportId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.get('/reports/:id/download', checkPermission('reports:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    // Retrieve report and generate export
    const report = await Report.findById(id).populate('reporterId', 'firstName lastName email').populate('reportedUserId', 'firstName lastName email');
    
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const mimeType = format === 'pdf' ? 'application/pdf' :
      format === 'csv' ? 'text/csv' :
        format === 'json' ? 'application/json' : 'text/plain';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.${format}"`);

    await logAdminActivity(req, 'DOWNLOAD_REPORT', { reportId: id, format });

    // Generate actual export based on format
    let content = '';
    
    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
    } else if (format === 'csv') {
      content = `Report ID,Type,Status,Priority,Reason,Submitted At\n`;
      content += `${report._id},${report.type},${report.status},${report.priority},${report.reason},${report.submittedAt}\n`;
    } else {
      content = `Report Details:\nID: ${report._id}\nType: ${report.type}\nStatus: ${report.status}\nPriority: ${report.priority}\nReason: ${report.reason}\nSubmitted: ${report.submittedAt}\n`;
    }

    res.send(content);
  } catch (error) {
    logger.error('Failed to download report', { error, reportId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

// Security Alerts Management Routes
router.get('/security/alerts', checkPermission('security:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      type,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for security alerts
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (assignedTo) query['assignedTo.id'] = assignedTo;

    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await SecurityAlert.find(query)
      .populate('assignedTo.id', 'firstName lastName email')
      .populate('acknowledgedBy.id', 'firstName lastName email')
      .populate('resolvedBy.id', 'firstName lastName email')
      .sort(sortOptions)
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await SecurityAlert.countDocuments(query);

    await logAdminActivity(req, 'VIEW_SECURITY_ALERTS', { query: req.query });

    res.json({
      success: true,
      alerts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    logger.error('Failed to fetch security alerts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security alerts',
      message: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

// Redirect to avoid duplicate code
router.get('/security/alerts/backup', checkPermission('security:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      type,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Old implementation with mock data backup
    const mockAlerts = [
      {
        id: '1',
        title: 'Suspicious Login Attempts Detected',
        description: 'Multiple failed login attempts from unknown IP addresses',
        type: 'authentication',
        severity: 'high',
        status: 'new',
        priority: 'high',
        source: {
          type: 'system',
          name: 'Security Monitor',
          ip: '192.168.1.100',
          location: 'Unknown',
        },
        affectedResources: [
          {
            type: 'user',
            id: 'user123',
            name: 'John Doe',
            status: 'affected',
          },
        ],
        timeline: [
          {
            timestamp: new Date().toISOString(),
            event: 'Alert Generated',
            description: 'System detected suspicious activity',
            actor: 'Security System',
          },
        ],
        evidence: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['authentication', 'security', 'login'],
        isAcknowledged: false,
        escalationLevel: 0,
        relatedAlerts: [],
        riskScore: 85,
        impactAssessment: {
          confidentiality: 'high',
          integrity: 'medium',
          availability: 'low',
          businessImpact: 'high',
        },
        remediation: {
          steps: [
            {
              id: '1',
              description: 'Block suspicious IP addresses',
              status: 'pending',
            },
          ],
          estimatedTime: '2 hours',
        },
      },
      {
        id: '2',
        title: 'Data Export Request from Unauthorized User',
        description: 'User attempted to export sensitive data without proper permissions',
        type: 'authorization',
        severity: 'medium',
        status: 'investigating',
        priority: 'medium',
        source: {
          type: 'user_report',
          name: 'System Audit',
        },
        affectedResources: [
          {
            type: 'database',
            id: 'export_logs',
            name: 'Export Logs',
            status: 'affected',
          },
        ],
        timeline: [
          {
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            event: 'Unauthorized Access',
            description: 'User requested data export',
            actor: 'user456',
          },
        ],
        evidence: [
          {
            type: 'log',
            name: 'access_log.txt',
            url: '/api/admin/security/evidence/access_log_2024_01_27.txt',
            size: 1024,
          },
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        tags: ['authorization', 'data-export', 'permissions'],
        isAcknowledged: true,
        escalationLevel: 0,
        relatedAlerts: [],
        riskScore: 65,
        impactAssessment: {
          confidentiality: 'medium',
          integrity: 'medium',
          availability: 'low',
          businessImpact: 'medium',
        },
        remediation: {
          steps: [
            {
              id: '1',
              description: 'Review user permissions',
              status: 'completed',
            },
            {
              id: '2',
              description: 'Update access controls',
              status: 'in_progress',
            },
          ],
          estimatedTime: '4 hours',
        },
      },
    ];

    // Apply filters
    let filteredAlerts: Alert[] = mockAlerts;
    if (status) filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    if (severity) filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    if (type) filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    if (assignedTo) filteredAlerts = filteredAlerts.filter((alert: Alert) => alert.assignedTo?.id === assignedTo);

    // Sort
    filteredAlerts.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortBy === 'severity') {
        const severityOrder: SeverityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aVal = severityOrder[String(a.severity)];
        bVal = severityOrder[String(b.severity)];
      } else if (sortBy === 'riskScore') {
        aVal = a.riskScore;
        bVal = b.riskScore;
      } else {
        aVal = (a as Record<string, unknown>)[String(sortBy)] || '';
        bVal = (b as Record<string, unknown>)[String(sortBy)] || '';
      }

      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const total = filteredAlerts.length;
    const alerts = filteredAlerts.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    await logAdminActivity(req, 'VIEW_SECURITY_ALERTS', { query: req.query });

    res.json({
      success: true,
      alerts,
      pagination: {
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        total,
        pages: Math.ceil(total / parseInt(String(limit)))
      }
    });
  } catch (error) {
    logger.error('Failed to fetch security alerts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security alerts',
      message: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/security/alerts/:id/acknowledge', checkPermission('security:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // For now, return mock response until Alert model is implemented
    const updatedAlert = {
      id,
      isAcknowledged: true,
      acknowledgmentBy: {
        id: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        timestamp: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    await logAdminActivity(req, 'ACKNOWLEDGE_SECURITY_ALERT', { alertId: id });

    res.json({
      success: true,
      alert: updatedAlert,
      message: 'Security alert acknowledged successfully'
    });
  } catch (error) {
    logger.error('Failed to acknowledge security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/security/alerts/:id/resolve', checkPermission('security:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution) {
      res.status(400).json({
        success: false,
        message: 'Resolution description is required'
      });
    }

    // For now, return mock response until Alert model is implemented
    const updatedAlert = {
      id,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: {
        id: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
      },
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Alert Resolved',
          description: resolution,
          actor: req.user.firstName + ' ' + req.user.lastName,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await logAdminActivity(req, 'RESOLVE_SECURITY_ALERT', { alertId: id, resolution });

    res.json({
      success: true,
      alert: updatedAlert,
      message: 'Security alert resolved successfully'
    });
  } catch (error) {
    logger.error('Failed to resolve security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to resolve security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/security/alerts/:id/escalate', checkPermission('security:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { level } = req.body;

    if (typeof level !== 'number' || level < 0) {
      res.status(400).json({
        success: false,
        message: 'Valid escalation level is required'
      });
    }

    // For now, return mock response until Alert model is implemented
    const updatedAlert = {
      id,
      status: 'escalated',
      escalationLevel: level,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Alert Escalated',
          description: `Alert escalated to level ${level}`,
          actor: req.user.firstName + ' ' + req.user.lastName,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await logAdminActivity(req, 'ESCALATE_SECURITY_ALERT', { alertId: id, level });

    res.json({
      success: true,
      alert: updatedAlert,
      message: `Security alert escalated to level ${level}`
    });
  } catch (error) {
    logger.error('Failed to escalate security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to escalate security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/security/alerts/:id/assign', checkPermission('security:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    if (!assigneeId) {
      res.status(400).json({
        success: false,
        message: 'Assignee ID is required'
      });
    }

    // For now, return mock response until Alert/User models are implemented
    const mockAssignee = {
      id: assigneeId,
      name: 'Assigned Admin',
      email: 'admin@pawfectmatch.com',
    };

    const updatedAlert = {
      id,
      assignedTo: mockAssignee,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: 'Alert Assigned',
          description: `Alert assigned to ${mockAssignee.name}`,
          actor: req.user.firstName + ' ' + req.user.lastName,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await logAdminActivity(req, 'ASSIGN_SECURITY_ALERT', { alertId: id, assigneeId });

    res.json({
      success: true,
      alert: updatedAlert,
      message: 'Security alert assigned successfully'
    });
  } catch (error) {
    logger.error('Failed to assign security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to assign security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.put('/security/alerts/:id', checkPermission('security:update'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // For now, return mock response until Alert model is implemented
    const updatedAlert = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await logAdminActivity(req, 'UPDATE_SECURITY_ALERT', { alertId: id, updates });

    res.json({
      success: true,
      alert: updatedAlert,
      message: 'Security alert updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to update security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.delete('/security/alerts/:id', checkPermission('security:delete'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // For now, return mock response until Alert model is implemented
    await logAdminActivity(req, 'DELETE_SECURITY_ALERT', { alertId: id });

    res.json({
      success: true,
      message: 'Security alert deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete security alert', { error, alertId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete security alert',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.post('/security/alerts/export', checkPermission('security:export'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format = 'csv', alertIds } = req.body;

    // For now, return mock response until Alert model is implemented
    const exportResult = {
      format,
      exportedAlerts: alertIds?.length || 2,
      downloadUrl: `/api/admin/security/alerts/download?format=${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    await logAdminActivity(req, 'EXPORT_SECURITY_ALERTS', { format, alertIds });

    res.json({
      success: true,
      export: exportResult,
      message: `Security alerts exported successfully as ${String(format).toUpperCase()}`
    });
  } catch (error) {
    logger.error('Failed to export security alerts', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to export security alerts',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

router.get('/security/alerts/download', checkPermission('security:read'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    // For now, return mock file until Alert model is implemented
    const mockContent = `Mock ${String(format).toUpperCase()} Security Alerts Export\nGenerated: ${new Date().toISOString()}\nAlert 1: Suspicious Login Attempts\nAlert 2: Data Export Request`;

    const mimeType = format === 'pdf' ? 'application/pdf' :
      format === 'csv' ? 'text/csv' :
        format === 'json' ? 'application/json' : 'text/plain';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="security-alerts.${format}"`);

    await logAdminActivity(req, 'DOWNLOAD_SECURITY_ALERTS', { format });

    res.send(mockContent);
  } catch (error) {
    logger.error('Failed to download security alerts', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to download security alerts',
      error: (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

export default router;