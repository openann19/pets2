const request = require('supertest');
const { app, httpServer } = require('../../../server');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    webhooks: {
      constructEvent: jest.fn().mockImplementation((payload, signature) => {
        if (!signature || signature !== 'valid_signature') {
          throw new Error('Invalid signature');
        }
        return JSON.parse(payload);
      })
    },
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_mock',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [{
            price: { product: 'prod_premium' }
          }]
        },
        cancel_at_period_end: false
      })
    }
  }));
});

let mongoServer;

describe('Webhook Resilience Tests', () => {
  let testUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'webhook-test@example.com',
      password: 'password123',
      firstName: 'Webhook',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  describe('Webhook Processing Resilience', () => {
    it('should handle idempotency for duplicate webhook events', async () => {
      // Create webhook event with same ID
      const webhookEvent = {
        id: 'evt_idempotency_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_idempotency_test',
            customer: 'cus_mock',
            subscription: 'sub_mock_idempotency',
            payment_status: 'paid',
            metadata: {
              userId: testUser._id.toString()
            }
          }
        }
      };

      // Process webhook first time
      const firstResponse = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(webhookEvent);

      expect(firstResponse.status).toBe(200);

      // User should have premium now
      const userAfterFirst = await User.findById(testUser._id);
      expect(userAfterFirst.premium.isActive).toBe(true);
      expect(userAfterFirst.premium.stripeSubscriptionId).toBe('sub_mock_idempotency');

      // Record subscription update time
      const firstUpdateTime = userAfterFirst.updatedAt;

      // Wait a moment to ensure timestamps would differ if updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send identical webhook event second time
      const secondResponse = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(webhookEvent);

      expect(secondResponse.status).toBe(200);

      // User should still have premium, but no changes should have been made
      const userAfterSecond = await User.findById(testUser._id);
      expect(userAfterSecond.updatedAt.getTime()).toEqual(firstUpdateTime.getTime());
    });

    it('should process webhook after server restart', async () => {
      // This test simulates server downtime and restart

      // First, create a pending subscription record
      await User.findByIdAndUpdate(testUser._id, {
        'premium.pendingSubscriptionId': 'sub_mock_restart'
      });

      // Simulate server restart by recreating the app
      const originalServer = httpServer;
      if (originalServer.listening) {
        await new Promise(resolve => originalServer.close(resolve));
      }

      // Reinitialize the app (this would happen during server restart)
      const { app: restartedApp } = require('../../../server');

      // Now send webhook that should be processed by the restarted server
      const webhookEvent = {
        id: 'evt_server_restart_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_server_restart',
            customer: 'cus_mock_restart',
            subscription: 'sub_mock_restart',
            payment_status: 'paid',
            metadata: {
              userId: testUser._id.toString()
            }
          }
        }
      };

      // Process webhook on restarted server
      const response = await request(restartedApp)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(webhookEvent);

      expect(response.status).toBe(200);

      // Verify subscription processed after restart
      const user = await User.findById(testUser._id);
      expect(user.premium.isActive).toBe(true);
      expect(user.premium.stripeSubscriptionId).toBe('sub_mock_restart');
      expect(user.premium.pendingSubscriptionId).toBeUndefined();
    });

    it('should handle database connection interruptions during webhook processing', async () => {
      // Setup mock for database interruption
      const originalSave = mongoose.Model.prototype.save;
      let saveAttempts = 0;

      // Mock save to fail on first attempt
      mongoose.Model.prototype.save = function () {
        saveAttempts++;
        if (saveAttempts === 1) {
          return Promise.reject(new Error('Database connection lost'));
        }
        return originalSave.apply(this, arguments);
      };

      // Reset user's subscription for this test
      await User.findByIdAndUpdate(testUser._id, {
        'premium.isActive': false,
        'premium.stripeSubscriptionId': null
      });

      // Create webhook event
      const webhookEvent = {
        id: 'evt_database_interruption_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_database_test',
            customer: 'cus_mock_db',
            subscription: 'sub_mock_db',
            payment_status: 'paid',
            metadata: {
              userId: testUser._id.toString()
            }
          }
        }
      };

      // Send webhook with retry mechanism
      let finalResponse;

      try {
        // First attempt should fail internally due to DB error
        await request(app)
          .post('/api/webhooks/stripe')
          .set('stripe-signature', 'valid_signature')
          .send(webhookEvent);

        // Simulate Stripe's automatic retry
        finalResponse = await request(app)
          .post('/api/webhooks/stripe')
          .set('stripe-signature', 'valid_signature')
          .send(webhookEvent);
      } catch (error) {
        console.error('Test error:', error);
      } finally {
        // Restore original save method
        mongoose.Model.prototype.save = originalSave;
      }

      // Second attempt should succeed
      expect(finalResponse.status).toBe(200);

      // Verify subscription was activated on retry
      const user = await User.findById(testUser._id);
      expect(user.premium.isActive).toBe(true);
      expect(user.premium.stripeSubscriptionId).toBe('sub_mock_db');
    });

    it('should properly handle concurrent webhook events', async () => {
      // Reset user's subscription
      await User.findByIdAndUpdate(testUser._id, {
        'premium.isActive': false,
        'premium.stripeSubscriptionId': null
      });

      // Create multiple webhook events to send concurrently
      const webhookEvents = [
        {
          id: 'evt_concurrent_1',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_concurrent_1',
              customer: 'cus_mock_1',
              subscription: 'sub_mock_1',
              payment_status: 'paid',
              metadata: {
                userId: testUser._id.toString()
              }
            }
          }
        },
        {
          id: 'evt_concurrent_2',
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: 'sub_mock_1',
              customer: 'cus_mock_1',
              status: 'active',
              items: {
                data: [{
                  price: { product: 'prod_ultimate' }
                }]
              },
              metadata: {
                userId: testUser._id.toString()
              }
            }
          }
        }
      ];

      // Send webhook events concurrently
      const responses = await Promise.all(
        webhookEvents.map(event =>
          request(app)
            .post('/api/webhooks/stripe')
            .set('stripe-signature', 'valid_signature')
            .send(event)
        )
      );

      // All responses should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check final state - both events should have been processed in order
      const user = await User.findById(testUser._id);
      expect(user.premium.isActive).toBe(true);
      expect(user.premium.stripeSubscriptionId).toBe('sub_mock_1');
      expect(user.premium.plan).toBe('ultimate');
    });
  });
});
