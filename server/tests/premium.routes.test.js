const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
// Mock the Stripe library
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' }),
      },
    },
    subscriptions: {
        del: jest.fn().mockResolvedValue({ status: 'canceled' })
    }
  }));
});

let authToken;
let userId;
let mongoServer;

describe('Premium Routes API Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create and log in a user
    const user = new User({
        email: 'premiumuser@example.com',
        password: 'password123',
        firstName: 'Premium',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
    });
    await user.save();
    userId = user._id;

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'premiumuser@example.com', password: 'password123' });
    authToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  afterEach(async () => {
    await User.updateOne({ _id: userId }, { $set: { premium: { isActive: false, plan: 'basic' } } });
  });

  describe('POST /api/premium/subscribe', () => {
    it('should create a Stripe checkout session for a subscription', async () => {
      const res = await request(app)
        .post('/api/premium/subscribe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plan: 'premium', interval: 'month' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sessionId');
      expect(res.body.data).toHaveProperty('url');
      expect(res.body.data.sessionId).toBe('cs_test_123');
    });
  });

  // Note: Testing the webhook requires a more complex setup with a live Stripe CLI
  // or a dedicated webhook testing service. This is a good candidate for manual or E2E testing.

  describe('POST /api/premium/cancel', () => {
    beforeEach(async () => {
        // Give the user a premium subscription to cancel
        await User.findByIdAndUpdate(userId, {
            $set: {
                'premium.isActive': true,
                'premium.plan': 'premium',
                'premium.stripeSubscriptionId': 'sub_test_123',
                'premium.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
    });

    it('should cancel a user\'s subscription', async () => {
        const res = await request(app)
            .post('/api/premium/cancel')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Subscription cancelled successfully');

        const updatedUser = await User.findById(userId);
        expect(updatedUser.premium.isActive).toBe(false);
    });
  });
});
