const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../src/routes/analytics');
const { EVENT_TYPES } = require('../src/services/analyticsService');

// Mock the analytics service
jest.mock('../src/services/analyticsService', () => ({
  trackUserEvent: jest.fn().mockResolvedValue(undefined),
  trackPetEvent: jest.fn().mockResolvedValue(undefined),
  trackMatchEvent: jest.fn().mockResolvedValue(undefined),
  getUserAnalytics: jest.fn().mockResolvedValue({
    totalSwipes: 10,
    totalLikes: 5,
    totalMatches: 3,
    lastActive: new Date().toISOString(),
    events: []
  }),
  getPetAnalytics: jest.fn().mockResolvedValue({
    views: 15,
    likes: 8,
    matches: 2,
    lastViewed: new Date().toISOString(),
    events: []
  }),
  getMatchAnalytics: jest.fn().mockResolvedValue({
    events: []
  }),
  EVENT_TYPES: {
    USER_LOGIN: 'user_login',
    PET_CREATE: 'pet_create',
    PET_LIKE: 'pet_like',
    MATCH_CREATE: 'match_create',
    MESSAGE_SEND: 'message_send',
  }
}));

const {
  trackUserEvent,
  trackPetEvent,
  trackMatchEvent,
  getUserAnalytics,
  getPetAnalytics,
  getMatchAnalytics
} = require('../src/services/analyticsService');

// Create a test app
const app = express();
app.use(express.json());

// Mock authentication middleware
const authenticateToken = (req, res, next) => {
  req.userId = 'test-user-id';
  next();
};

app.use('/api/analytics', authenticateToken, analyticsRoutes);

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analytics/user', () => {
    it('should track user event successfully', async () => {
      const response = await request(app)
        .post('/api/analytics/user')
        .send({
          eventType: EVENT_TYPES.USER_LOGIN,
          metadata: { source: 'mobile_app' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(trackUserEvent).toHaveBeenCalledWith(
        'test-user-id',
        EVENT_TYPES.USER_LOGIN,
        { source: 'mobile_app' }
      );
    });

    it('should return error for invalid event type', async () => {
      const response = await request(app)
        .post('/api/analytics/user')
        .send({
          eventType: 'invalid_event',
          metadata: { source: 'mobile_app' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      trackUserEvent.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .post('/api/analytics/user')
        .send({
          eventType: EVENT_TYPES.USER_LOGIN,
          metadata: { source: 'mobile_app' }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/analytics/pet', () => {
    it('should track pet event successfully', async () => {
      const response = await request(app)
        .post('/api/analytics/pet')
        .send({
          petId: 'test-pet-id',
          eventType: EVENT_TYPES.PET_LIKE,
          metadata: { fromUserId: 'test-user-id' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(trackPetEvent).toHaveBeenCalledWith(
        'test-pet-id',
        EVENT_TYPES.PET_LIKE,
        'test-user-id',
        { fromUserId: 'test-user-id' }
      );
    });

    it('should return error for invalid event type', async () => {
      const response = await request(app)
        .post('/api/analytics/pet')
        .send({
          petId: 'test-pet-id',
          eventType: 'invalid_event',
          metadata: { fromUserId: 'test-user-id' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      trackPetEvent.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .post('/api/analytics/pet')
        .send({
          petId: 'test-pet-id',
          eventType: EVENT_TYPES.PET_LIKE,
          metadata: { fromUserId: 'test-user-id' }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/analytics/match', () => {
    it('should track match event successfully', async () => {
      const response = await request(app)
        .post('/api/analytics/match')
        .send({
          matchId: 'test-match-id',
          eventType: EVENT_TYPES.MESSAGE_SEND,
          metadata: { content: 'Hello!' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(trackMatchEvent).toHaveBeenCalledWith(
        'test-match-id',
        EVENT_TYPES.MESSAGE_SEND,
        'test-user-id',
        { content: 'Hello!' }
      );
    });

    it('should return error for invalid event type', async () => {
      const response = await request(app)
        .post('/api/analytics/match')
        .send({
          matchId: 'test-match-id',
          eventType: 'invalid_event',
          metadata: { content: 'Hello!' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      trackMatchEvent.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .post('/api/analytics/match')
        .send({
          matchId: 'test-match-id',
          eventType: EVENT_TYPES.MESSAGE_SEND,
          metadata: { content: 'Hello!' }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/analytics/user', () => {
    it('should get user analytics successfully', async () => {
      const response = await request(app)
        .get('/api/analytics/user');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(getUserAnalytics).toHaveBeenCalledWith('test-user-id', 'week');
    });

    it('should handle user not found', async () => {
      getUserAnalytics.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/analytics/user');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      getUserAnalytics.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .get('/api/analytics/user');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/analytics/pet/:petId', () => {
    it('should get pet analytics successfully', async () => {
      const response = await request(app)
        .get('/api/analytics/pet/test-pet-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(getPetAnalytics).toHaveBeenCalledWith('test-pet-id');
    });

    it('should handle pet not found', async () => {
      getPetAnalytics.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/analytics/pet/test-pet-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      getPetAnalytics.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .get('/api/analytics/pet/test-pet-id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/analytics/match/:matchId', () => {
    it('should get match analytics successfully', async () => {
      const response = await request(app)
        .get('/api/analytics/match/test-match-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(getMatchAnalytics).toHaveBeenCalledWith('test-match-id');
    });

    it('should handle match not found', async () => {
      getMatchAnalytics.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/analytics/match/test-match-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle service errors', async () => {
      getMatchAnalytics.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .get('/api/analytics/match/test-match-id');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});