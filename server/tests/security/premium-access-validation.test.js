/**
 * Premium Access Security Tests
 * 
 * These tests verify that premium features are properly protected against
 * unauthorized access and privilege escalation attempts
 */

const request = require('supertest');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Global variables are available in Jest test environment

let mongoServer;

describe('Premium Access Security Tests', () => {
  let basicUser;
  let basicUserToken;
  let premiumUser;
  let premiumUserToken;
  let basicUserPet;
  let premiumUserPet;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test users with different subscription levels
    basicUser = new User({
      email: 'basic-user@example.com',
      password: 'password123',
      firstName: 'Basic',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      premium: {
        isActive: false,
        plan: 'basic',
        expiresAt: new Date()
      }
    });
    await basicUser.save();

    premiumUser = new User({
      email: 'premium-user@example.com',
      password: 'password123',
      firstName: 'Premium',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      premium: {
        isActive: true,
        plan: 'premium',
        stripeSubscriptionId: 'sub_test_premium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days in the future
      }
    });
    await premiumUser.save();

    // Create pets for each user
    basicUserPet = new Pet({
      name: 'Basic Pet',
      species: 'dog',
      breed: 'Mixed',
      age: 3,
      gender: 'male',
      size: 'medium',
      intent: 'adoption',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      owner: basicUser._id
    });
    await basicUserPet.save();

    premiumUserPet = new Pet({
      name: 'Premium Pet',
      species: 'cat',
      breed: 'Persian',
      age: 2,
      gender: 'female',
      size: 'small',
      intent: 'adoption',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      owner: premiumUser._id
    });
    await premiumUserPet.save();

    // Generate auth tokens
    basicUserToken = generateTestToken(basicUser._id.toString());
    premiumUserToken = generateTestToken(premiumUser._id.toString());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  describe('Premium Feature Access Control', () => {
    it('should prevent unauthorized premium feature access via API', async () => {
      // Basic user tries to access premium boost feature
      const response = await request(app)
        .post(`/api/premium/boost/${basicUserPet._id}`)
        .set('Authorization', `Bearer ${basicUserToken}`)
        .send({});

      // Should be rejected with 403 Forbidden
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Premium subscription required');
    });

    it('should allow access to premium features for premium users', async () => {
      // Premium user uses boost feature
      const response = await request(app)
        .post(`/api/premium/boost/${premiumUserPet._id}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({});

      // Should succeed
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should prevent basic users from accessing premium-only endpoints', async () => {
      // Try to access various premium endpoints
      const premiumEndpoints = [
        `/api/premium/super-likes`,
        `/api/premium/usage`,
        `/api/premium/subscription`
      ];

      for (const endpoint of premiumEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${basicUserToken}`);

        // All should be forbidden
        expect([403, 404]).toContain(response.status);
      }
    });
  });

  describe('JWT Tampering Prevention', () => {
    it('should reject tokens with tampered premium status', async () => {
      // Create a tampered token claiming premium status
      const jwtSecret = process.env.JWT_SECRET || 'test-secret';
      const payload = { userId: basicUser._id.toString(), premium: true };
      const tamperedToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      // Try to use tampered token to access premium features
      const response = await request(app)
        .post(`/api/premium/boost/${basicUserPet._id}`)
        .set('Authorization', `Bearer ${tamperedToken}`)
        .send({});

      // Should be rejected as the token payload doesn't match the user's actual status
      expect(response.status).toBe(403);
    });

    it('should verify premium status from database, not just from token', async () => {
      // Create token with correct signature but manipulated claims
      const jwtSecret = process.env.JWT_SECRET || 'test-secret';
      const payload = {
        userId: basicUser._id.toString(),
        premium: { isActive: true, plan: 'ultimate' } // Falsely claiming ultimate status
      };
      const manipulatedToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      // Try to use this token to access premium features
      const response = await request(app)
        .post(`/api/premium/boost/${basicUserPet._id}`)
        .set('Authorization', `Bearer ${manipulatedToken}`)
        .send({});

      // Should be rejected as server should check database, not trust the token
      expect(response.status).toBe(403);
    });
  });

  describe('Resource Access Control', () => {
    it('should prevent users from boosting other users pets', async () => {
      // Premium user tries to boost basic user's pet
      const response = await request(app)
        .post(`/api/premium/boost/${basicUserPet._id}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({});

      // Should be rejected with 404 Not Found
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should verify ownership before allowing premium actions', async () => {
      // Create a new pet not owned by premium user
      const otherPet = new Pet({
        name: 'Other Pet',
        species: 'bird',
        breed: 'Parrot',
        age: 1,
        gender: 'male',
        size: 'small',
        intent: 'adoption',
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        owner: basicUser._id // Owned by basic user
      });
      await otherPet.save();

      // Premium user tries to boost a pet they don't own
      const response = await request(app)
        .post(`/api/premium/boost/${otherPet._id}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({});

      // Should be rejected
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('API Parameter Validation', () => {
    it('should validate premium endpoint parameters', async () => {
      // Try to call boost with invalid pet ID
      const invalidPetId = '000000000000000000000000';
      const response = await request(app)
        .post(`/api/premium/boost/${invalidPetId}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({});

      // Should return error
      expect(response.status).toBe(404);
    });

    it('should validate premium endpoint body parameters', async () => {
      // Try to call premium endpoint with invalid body
      const invalidBody = { boostDuration: 'infinite', priority: 'extreme' }; // Invalid params
      const response = await request(app)
        .post(`/api/premium/boost/${premiumUserPet._id}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send(invalidBody);

      // Should not crash with 500, but return appropriate error
      expect(response.status).not.toBe(500);
    });
  });

  describe('Subscription Expiration Handling', () => {
    it('should deny premium features after subscription expires', async () => {
      // First set the premium user's subscription to be expired
      await User.findByIdAndUpdate(premiumUser._id, {
        'premium.expiresAt': new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day in the past
      });

      // Try to use premium feature
      const response = await request(app)
        .post(`/api/premium/boost/${premiumUserPet._id}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({});

      // Should be rejected
      expect(response.status).toBe(403);
    });

    it('should reject premium access with trial that ended', async () => {
      // Create a user with expired trial
      const trialUser = new User({
        email: 'trial-expired@example.com',
        password: 'password123',
        firstName: 'Trial',
        lastName: 'Expired',
        dateOfBirth: '1990-01-01',
        premium: {
          isActive: false, // Not active anymore
          plan: 'premium',
          trialEndDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      });
      await trialUser.save();

      const trialUserToken = generateTestToken(trialUser._id.toString());

      // Try to use premium feature
      const response = await request(app)
        .get('/api/premium/super-likes')
        .set('Authorization', `Bearer ${trialUserToken}`);

      // Should be rejected
      expect([403, 404]).toContain(response.status);
    });
  });
});
