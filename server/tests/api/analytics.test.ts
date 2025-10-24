/**
 * Analytics API Endpoint Tests
 * Tests all 10 analytics endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('Analytics API Endpoints', () => {
  let testUser: any;
  let testToken: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    testUser = await createMockUser();
    testToken = generateTestToken(testUser._id.toString());
  });

  describe('POST /api/analytics/user', () => {
    it('should track user event', async () => {
      const response = await request(app)
        .post('/api/analytics/user')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          eventType: 'profile_view',
          metadata: {
            source: 'web',
            duration: 1500,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should validate event type', async () => {
      const response = await request(app)
        .post('/api/analytics/user')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          eventType: '', // Invalid
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/analytics/user')
        .send({ eventType: 'test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/analytics/pet', () => {
    let testPet: any;

    beforeEach(async () => {
      const Pet = require('../../src/models/Pet');
      testPet = await Pet.create({
        name: 'Analytics Pet',
        species: 'dog',
        owner: testUser._id,
      });
    });

    it('should track pet event', async () => {
      const response = await request(app)
        .post('/api/analytics/pet')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petId: testPet._id,
          eventType: 'pet_view',
          metadata: {
            viewSource: 'discovery',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should require petId', async () => {
      const response = await request(app)
        .post('/api/analytics/pet')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          eventType: 'pet_view',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analytics/match', () => {
    it('should track match event', async () => {
      const response = await request(app)
        .post('/api/analytics/match')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          matchId: 'match123',
          eventType: 'match_created',
          metadata: {
            matchScore: 0.95,
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should require matchId', async () => {
      const response = await request(app)
        .post('/api/analytics/match')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          eventType: 'match_created',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/user', () => {
    beforeEach(async () => {
      // Create some analytics events
      const AnalyticsEvent = require('../../src/models/AnalyticsEvent');
      await AnalyticsEvent.create({
        userId: testUser._id,
        eventType: 'profile_view',
        createdAt: new Date(),
      });
    });

    it('should return user analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/user')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEvents');
    });

    it('should support timeframe filtering', async () => {
      const response = await request(app)
        .get('/api/analytics/user')
        .query({ timeframe: 'daily' })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/user');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/pet/:petId', () => {
    let testPet: any;

    beforeEach(async () => {
      const Pet = require('../../src/models/Pet');
      testPet = await Pet.create({
        name: 'Analytics Pet',
        species: 'dog',
        owner: testUser._id,
      });

      // Create analytics for this pet
      const AnalyticsEvent = require('../../src/models/AnalyticsEvent');
      await AnalyticsEvent.create({
        entityType: 'pet',
        entityId: testPet._id,
        eventType: 'pet_view',
        createdAt: new Date(),
      });
    });

    it('should return pet analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/pet/${testPet._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('views');
    });

    it('should validate petId format', async () => {
      const response = await request(app)
        .get('/api/analytics/pet/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/match/:matchId', () => {
    it('should return match analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/match/match123')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/users/:userId', () => {
    it('should return analytics for specific user', async () => {
      const response = await request(app)
        .get(`/api/analytics/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should only allow users to view their own analytics', async () => {
      const otherUser = await createMockUser();

      const response = await request(app)
        .get(`/api/analytics/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/analytics/matches/:userId', () => {
    it('should return match analytics for user', async () => {
      const response = await request(app)
        .get(`/api/analytics/matches/${testUser._id}`)
        .query({ timeframe: 'weekly' })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('insights');
      expect(response.body.data).toHaveProperty('trends');
    });
  });

  describe('POST /api/analytics/events', () => {
    it('should accept batch events', async () => {
      const events = [
        {
          userId: testUser._id,
          eventType: 'swipe_right',
          metadata: { petId: 'pet1' },
        },
        {
          userId: testUser._id,
          eventType: 'swipe_left',
          metadata: { petId: 'pet2' },
        },
        {
          userId: testUser._id,
          eventType: 'match_created',
          metadata: { matchId: 'match1' },
        },
      ];

      const response = await request(app)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ events });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.processed).toBe(3);
    });

    it('should validate events array', async () => {
      const response = await request(app)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ events: 'not-an-array' });

      expect(response.status).toBe(400);
    });

    it('should require events array', async () => {
      const response = await request(app)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle empty events array', async () => {
      const response = await request(app)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ events: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    it('should process large batches efficiently', async () => {
      const events = Array(100).fill(null).map((_, i) => ({
        userId: testUser._id,
        eventType: 'test_event',
        metadata: { index: i },
      }));

      const start = Date.now();
      const response = await request(app)
        .post('/api/analytics/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ events });

      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(response.body.processed).toBe(100);
      expect(duration).toBeLessThan(5000); // Should complete in 5s
    }, 10000); // Extended timeout
  });

  describe('GET /api/analytics/performance', () => {
    beforeEach(async () => {
      const AnalyticsEvent = require('../../src/models/AnalyticsEvent');
      
      // Create events with performance data
      await AnalyticsEvent.create([
        {
          userId: testUser._id,
          eventType: 'api_call',
          durationMs: 120,
          success: true,
          createdAt: new Date(),
        },
        {
          userId: testUser._id,
          eventType: 'api_call',
          durationMs: 450,
          success: true,
          createdAt: new Date(),
        },
        {
          userId: testUser._id,
          eventType: 'api_call',
          durationMs: 85,
          success: false,
          createdAt: new Date(),
        },
      ]);
    });

    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('responseTimeP95');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('errorRate');
      expect(response.body.data).toHaveProperty('activeUsers');
    });

    it('should calculate P95 correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${testToken}`);

      expect(typeof response.body.data.responseTimeP95).toBe('number');
      expect(response.body.data.responseTimeP95).toBeGreaterThan(0);
    });

    it('should calculate error rate', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${testToken}`);

      expect(typeof response.body.data.errorRate).toBe('number');
      expect(response.body.data.errorRate).toBeGreaterThanOrEqual(0);
      expect(response.body.data.errorRate).toBeLessThanOrEqual(100);
    });

    it('should include timestamp', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data).toHaveProperty('timestamp');
      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
