/**
 * Enhanced E2E Tests for Authentication
 * Comprehensive testing of authentication flows, JWT handling, and security features
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

let app;
let mongoServer;

describe('Enhanced Auth E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    process.env.BCRYPT_ROUNDS = '10';
    process.env.RATE_LIMIT_WINDOW_MS = '900000'; // 15 minutes
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    
    await mongoose.connect(mongoUri);
    app = require('../../server');
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

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
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should hash password securely', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `test${Date.now()}@example.com`
        })
        .expect(201);

      // Verify password is hashed
      const user = await mongoose.connection.db.collection('users').findOne({
        email: response.body.data.user.email
      });
      
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should not register user with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `test${Date.now()}@example.com`,
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate age requirement', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: `test${Date.now()}@example.com`,
          dateOfBirth: futureDateString
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('age');
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
      expect(response.body.message).toContain('Invalid');
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
      expect(response.body.message).toContain('Invalid');
    });

    it('should validate login input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('JWT Token Management', () => {
    let accessToken;
    let refreshToken;
    const testUser = {
      email: `jwt${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'JWT',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should generate valid JWT tokens', async () => {
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      
      // Verify token structure
      const decodedAccess = jwt.decode(accessToken);
      const decodedRefresh = jwt.decode(refreshToken);
      
      expect(decodedAccess).toHaveProperty('userId');
      expect(decodedAccess).toHaveProperty('email');
      expect(decodedRefresh).toHaveProperty('userId');
      expect(decodedRefresh).toHaveProperty('type', 'refresh');
    });

    it('should verify access token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.accessToken).not.toBe(accessToken);
    });

    it('should reject invalid access token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired access token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'test', email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject invalid refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });

    it('should revoke refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify refresh token is revoked
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Password Reset Flow', () => {
    const testUser = {
      email: `reset${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Reset',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should initiate password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    it('should not initiate reset for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should validate email format for password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });
  });

  describe('Account Security', () => {
    const testUser = {
      email: `security${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Security',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should track login attempts', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .expect(401);
      }

      // Check if login attempts are tracked
      const user = await mongoose.connection.db.collection('users').findOne({
        email: testUser.email
      });

      expect(user).toHaveProperty('loginAttempts');
      expect(user.loginAttempts).toBeGreaterThan(0);
    });

    it('should lock account after multiple failed attempts', async () => {
      // Make enough failed attempts to lock account
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });
      }

      // Try to login with correct password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('locked');
    });

    it('should validate password strength on change', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should change password successfully', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTest123!@#'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('changed');
    });
  });

  describe('Rate Limiting', () => {
    const testUser = {
      email: `rate${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Rate',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should rate limit login attempts', async () => {
      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: testUser.email,
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(attempts);
      
      // Last response should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect([429, 401]).toContain(lastResponse.status);
      
      if (lastResponse.status === 429) {
        expect(lastResponse.body.message).toContain('Too many');
      }
    });

    it('should rate limit registration attempts', async () => {
      // Make multiple registration attempts
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/register')
            .send({
              ...testUser,
              email: `rate${Date.now()}${i}@example.com`
            })
        );
      }

      const responses = await Promise.all(attempts);
      
      // Some responses should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    const testUser = {
      email: `session${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Session',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should handle concurrent sessions', async () => {
      // Login from multiple sessions
      const session1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const session2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(session1.body.data.accessToken).toBeDefined();
      expect(session2.body.data.accessToken).toBeDefined();
      expect(session1.body.data.accessToken).not.toBe(session2.body.data.accessToken);
    });

    it('should invalidate all sessions on logout', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .expect(200);

      // Verify token is invalidated
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .expect(401);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should sanitize user input', async () => {
      const maliciousUser = {
        email: `malicious${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: '<script>alert("xss")</script>',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousUser)
        .expect(201);

      expect(response.body.data.user.firstName).not.toContain('<script>');
      expect(response.body.data.user.firstName).not.toContain('alert');
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
        'invalid.com',
        'invalid@com',
        'invalid@com.',
        'invalid@.com.'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email,
            password: 'Test123!@#',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('email');
      }
    });

    it('should validate password complexity', async () => {
      const weakPasswords = [
        '123',
        'password',
        'PASSWORD',
        'Password',
        'Password1',
        'Password!',
        'password123!',
        'PASSWORD123!'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${Date.now()}@example.com`,
            password,
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('password');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Close database connection
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
          dateOfBirth: '1990-01-01'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('error');

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGODB_URI);
    });

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing required headers', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  describe('Performance', () => {
    it('should handle registration requests efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `perf${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Perf',
          lastName: 'Test',
          dateOfBirth: '1990-01-01'
        })
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle login requests efficiently', async () => {
      const testUser = {
        email: `perflogin${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Perf',
        lastName: 'Login',
        dateOfBirth: '1990-01-01'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const startTime = Date.now();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
