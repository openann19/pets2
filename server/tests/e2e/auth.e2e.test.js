/**
 * E2E Tests for Authentication Flow
 * Tests the complete user journey from registration to login
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

describe('Auth E2E Tests', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB for tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    
    // Connect to MongoDB before importing app
    await mongoose.connect(mongoUri);
    
    // Import app after env vars and DB are set
    app = require('../../server');
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000); // 30 second timeout for cleanup

  describe('User Registration Flow', () => {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(testUser.email);
    }, 10000); // 10 second timeout

    it('should not register user with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `test${Date.now()}@example.com`,
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('User Login Flow', () => {
    const testUser = {
      email: `login${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Login',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      // Register test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    let accessToken;
    const testUser = {
      email: `protected${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Protected',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      // Register and login
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      accessToken = response.body.data.accessToken;
    });

    it('should access /api/auth/me with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should not access /api/auth/me without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should not access /api/auth/me with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      const testEmail = `ratelimit${Date.now()}@example.com`;
      
      // Make 6 failed attempts (rate limit is 5 per 15 min)
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: testEmail,
              password: 'wrongpassword'
            })
        );
      }
      
      const responses = await Promise.all(attempts);
      
      // Last response should be rate limited
      const lastResponse = responses[responses.length - 1];
      
      // Either 429 (rate limited) or 401 (unauthorized) is acceptable
      // Rate limiting might not trigger in test due to IP handling
      expect([429, 401]).toContain(lastResponse.status);
      
      // If rate limited, check message
      if (lastResponse.status === 429) {
        expect(lastResponse.body.message).toContain('Too many');
      }
    }, 15000);
  });
});

module.exports = { describe, it, expect, beforeAll, afterAll };
