const request = require('supertest');
const { app, httpServer } = require('../../../server');
const User = require('../../../src/models/User');
const Pet = require('../../../src/models/Pet');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('Premium Feature Race Condition Tests', () => {
  let testUser;
  let authToken;
  let testPet;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'premium-race@example.com',
      password: 'password123',
      firstName: 'Premium',
      lastName: 'Race',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();

    // Create a test pet
    testPet = new Pet({
      name: 'Test Pet',
      species: 'dog',
      breed: 'Test Breed',
      age: 3,
      gender: 'male',
      size: 'medium',
      intent: 'adoption',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      owner: testUser._id
    });
    await testPet.save();

    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'premium-race@example.com',
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

  beforeEach(async () => {
    // Reset user's premium status before each test
    await User.findByIdAndUpdate(testUser._id, {
      'premium.isActive': false,
      'premium.plan': 'basic',
      'premium.stripeSubscriptionId': null
    });
  });

  it('should handle checkout completion and immediate feature usage correctly', async () => {
    // Start with non-premium user
    const user = await User.findById(testUser._id);
    expect(user.premium.isActive).toBe(false);

    // Simulate two parallel operations:
    // 1. User completes checkout (webhook being processed)
    // 2. User immediately attempts to use premium feature

    // Create webhook event
    const webhookEvent = {
      id: 'evt_race_condition_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_race_test',
          customer: 'cus_mock_race',
          subscription: 'sub_mock_race',
          payment_status: 'paid',
          metadata: {
            userId: testUser._id.toString()
          }
        }
      }
    };

    // Function to simulate webhook processing (takes some time)
    const simulateWebhookProcessing = async () => {
      // Add artificial delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process webhook
      return await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(webhookEvent);
    };

    // Function to simulate user attempting premium feature
    const attemptPremiumFeature = async () => {
      return await request(app)
        .post(`/api/premium/boost/${testPet._id}`)
        .set('Authorization', `Bearer ${authToken}`);
    };

    // Start webhook processing (don't await)
    const webhookPromise = simulateWebhookProcessing();

    // Immediately try to use premium feature (should fail initially)
    const initialAttempt = await attemptPremiumFeature();

    // Should be rejected since webhook hasn't completed yet
    expect(initialAttempt.status).toBe(403);
    expect(initialAttempt.body.message).toContain('premium users only');

    // Wait for webhook to complete
    await webhookPromise;

    // Now try premium feature again
    const secondAttempt = await attemptPremiumFeature();

    // Should succeed now
    expect(secondAttempt.status).toBe(200);
    expect(secondAttempt.body.success).toBe(true);
  });

  it('should handle mid-cycle cancellation correctly', async () => {
    // Setup active premium subscription
    await User.findByIdAndUpdate(testUser._id, {
      'premium.isActive': true,
      'premium.plan': 'premium',
      'premium.stripeSubscriptionId': 'sub_cancel_test',
      'premium.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Verify premium feature access works
    const initialBoost = await request(app)
      .post(`/api/premium/boost/${testPet._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(initialBoost.status).toBe(200);

    // Cancel subscription
    await request(app)
      .post('/api/premium/cancel')
      .set('Authorization', `Bearer ${authToken}`);

    // Verify user still has premium access after cancellation (until period end)
    const userAfterCancel = await User.findById(testUser._id);
    expect(userAfterCancel.premium.isActive).toBe(false); // Marked as cancelled

    // BUT should still have access to premium features until expiry
    const boostAfterCancel = await request(app)
      .post(`/api/premium/boost/${testPet._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Should still work due to expiry date not being reached
    expect(boostAfterCancel.status).toBe(200);

    // Now simulate time advancing to after expiry date
    const pastExpiryDate = new Date(Date.now() - 1000);
    await User.findByIdAndUpdate(testUser._id, {
      'premium.expiresAt': pastExpiryDate
    });

    // Try premium feature after expiry
    const boostAfterExpiry = await request(app)
      .post(`/api/premium/boost/${testPet._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Should be rejected
    expect(boostAfterExpiry.status).toBe(403);
  });

  it('should handle simultaneous premium feature requests correctly', async () => {
    // Set up premium user with limited feature usage
    await User.findByIdAndUpdate(testUser._id, {
      'premium.isActive': true,
      'premium.plan': 'premium',
      'premium.stripeSubscriptionId': 'sub_limit_test',
      'premium.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      'premium.boostsRemaining': 1 // Only 1 boost remaining
    });

    // Simulate multiple simultaneous boost requests
    const boostRequests = Array(5).fill().map(() =>
      request(app)
        .post(`/api/premium/boost/${testPet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
    );

    // Execute all requests concurrently
    const responses = await Promise.all(boostRequests);

    // Count successful and failed responses
    const successfulResponses = responses.filter(res => res.status === 200);
    const failedResponses = responses.filter(res => res.status !== 200);

    // Only one request should succeed (due to the limit)
    expect(successfulResponses.length).toBe(1);
    expect(failedResponses.length).toBe(4);

    // User's boosts should now be depleted
    const userAfterBoosts = await User.findById(testUser._id);
    expect(userAfterBoosts.premium.boostsRemaining).toBe(0);
  });

  it('should handle plan upgrade and immediate feature access', async () => {
    // Set up user with basic plan
    await User.findByIdAndUpdate(testUser._id, {
      'premium.isActive': true,
      'premium.plan': 'basic',
      'premium.stripeSubscriptionId': 'sub_basic',
      'premium.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Try to use a premium-only feature
    const initialVideoCall = await request(app)
      .post('/api/premium/video-call')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user123' });

    // Should fail as this requires premium plan
    expect(initialVideoCall.status).toBe(403);
    expect(initialVideoCall.body.message).toContain('premium');

    // Simulate plan upgrade via webhook
    const upgradeEvent = {
      id: 'evt_upgrade_test',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_basic', // Same subscription ID
          customer: 'cus_upgrade',
          status: 'active',
          items: {
            data: [{
              price: { product: 'prod_premium' } // Upgraded to premium
            }]
          },
          metadata: {
            userId: testUser._id.toString()
          }
        }
      }
    };

    // Process upgrade webhook
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'valid_signature')
      .send(upgradeEvent);

    // Now try premium feature again
    const videoCallAfterUpgrade = await request(app)
      .post('/api/premium/video-call')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ targetUserId: 'user123' });

    // Should succeed now
    expect(videoCallAfterUpgrade.status).toBe(200);
  });
});
