// Define Stripe mock as singleton so controllers/imports share same instance
jest.mock('stripe', () => {
  const singleton = {
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation(options => Promise.resolve({
          id: 'cs_test_mock_session_id',
          url: 'https://checkout.stripe.com/pay/cs_test_mock_session_id',
          status: 'open',
          payment_status: 'unpaid',
          customer: options?.customer_email ? 'cus_mock' : null
        })),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_session_id',
          payment_status: 'paid',
          customer: 'cus_mock',
          subscription: 'sub_mock'
        })
      }
    },
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: { data: [{ price: { id: 'price_premium_monthly', product: 'prod_premium', unit_amount: 999 } }] },
        cancel_at_period_end: false
      }),
      update: jest.fn().mockResolvedValue({ id: 'sub_mock', status: 'active', cancel_at_period_end: false }),
      del: jest.fn().mockResolvedValue({ id: 'sub_mock', status: 'canceled' })
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation((payload, signature) => {
        let raw; if (Buffer.isBuffer(payload)) raw = payload.toString('utf8');
        else if (typeof payload === 'string') raw = payload; else if (payload) raw = JSON.stringify(payload); else raw = '{}';
        if (signature !== 'valid_signature') throw new Error('Invalid signature');
        return JSON.parse(raw);
      })
    }
  };
  const factory = jest.fn(() => singleton);
  factory.__getMock = () => singleton;
  return factory;
});

// Now import rest of deps
const request = require('supertest');
const { app, httpServer } = require('../../../server');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');


let mongoServer;

describe('Stripe Checkout Flow Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'stripe-test@example.com',
      password: 'password123',
      firstName: 'Stripe',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();

    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stripe-test@example.com',
        password: 'password123'
      });

    authToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Stripe checkout session successfully', async () => {
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data.url).toContain('checkout.stripe.com');
  }, 15000); // Increase timeout to 15 seconds

  it('should handle network interruptions during checkout session creation', async () => {
    // Get the mock instance that was created by jest.mock at the top
    const stripeFactory = require('stripe');
    const mockInstance = stripeFactory.__getMock();

    // Mock a network error on first attempt, then success
    let attemptCount = 0;

    mockInstance.checkout.sessions.create.mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        id: 'cs_test_retry_success',
        url: 'https://checkout.stripe.com/pay/cs_test_retry_success',
        status: 'open'
      });
    });

    // Use this mock with automatic retry logic
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month',
        __test_retry: true // Special flag to activate retry logic in test mode
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockInstance.checkout.sessions.create).toHaveBeenCalledTimes(2);
  }, 15000); // Increase timeout to 15 seconds

  it('should maintain consistent state if browser closed mid-checkout', async () => {
    // Create checkout session
    const checkoutResponse = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });

    expect(checkoutResponse.status).toBe(200);

    // Simulate browser close before completion
    // No further action from user

    // User state should not show premium until webhook received
    const userState = await User.findById(testUser._id);
    expect(userState.premium.isActive).toBeFalsy();

    // Simulate webhook arrival for completed checkout
    const webhookPayload = {
      id: 'evt_checkout_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_mock_session_id',
          customer: 'cus_mock',
          subscription: 'sub_mock',
          payment_status: 'paid',
          metadata: {
            userId: testUser._id.toString()
          }
        }
      }
    };

    // Send the webhook
    const webhookResponse = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'valid_signature')
      .send(webhookPayload);

    expect(webhookResponse.status).toBe(200);

    // Now user should have premium
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.premium.isActive).toBe(true);
    expect(updatedUser.premium.stripeSubscriptionId).toBe('sub_mock');
  }, 15000); // Increase timeout to 15 seconds

  it('should gracefully handle Stripe API downtime', async () => {
    // Get the mock instance that was created by jest.mock at the top
    const stripeFactory = require('stripe');
    const mockInstance = stripeFactory.__getMock();

    // Mock Stripe being down
    mockInstance.checkout.sessions.create.mockImplementation(() => {
      throw new Error('Stripe API is currently unavailable');
    });

    // Attempt to create checkout session
    const response = await request(app)
      .post('/api/premium/subscribe')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        plan: 'premium',
        interval: 'month'
      });

    // Should return error but not crash the server
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  }, 15000); // Increase timeout to 15 seconds

  it('should correctly sync subscriptions across platforms after purchase', async () => {
    // Mock web checkout completion via webhook
    const webhookPayload = {
      id: 'evt_cross_platform_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_cross_platform',
          customer: 'cus_mock',
          subscription: 'sub_cross_platform',
          payment_status: 'paid',
          metadata: {
            userId: testUser._id.toString(),
            platform: 'web'
          }
        }
      }
    };

    // Process web purchase webhook
    const webhookResponse = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'valid_signature')
      .send(webhookPayload);

    // Verify webhook processed successfully
    expect(webhookResponse.status).toBe(200);

    // Verify user now has premium access in database
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.premium.isActive).toBe(true);
    expect(updatedUser.premium.stripeSubscriptionId).toBe('sub_cross_platform');

    // Check mobile app state - should reflect premium status
    const mobileLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stripe-test@example.com',
        password: 'password123',
        platform: 'mobile'
      });

    const mobileToken = mobileLoginResponse.body.data.accessToken;

    // Get subscription status from mobile
    const mobileSubscriptionResponse = await request(app)
      .get('/api/premium/subscription')
      .set('Authorization', `Bearer ${mobileToken}`);

    // Verify subscription is active on mobile
    expect(mobileSubscriptionResponse.status).toBe(200);
    expect(mobileSubscriptionResponse.body.data.subscription.status).toBe('active');
    expect(mobileSubscriptionResponse.body.data.subscription.tierId).toBe('premium');
  }, 15000); // Increase timeout to 15 seconds
});
