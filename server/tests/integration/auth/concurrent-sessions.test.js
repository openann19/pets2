const request = require('supertest');
const app = require('../../../server');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('Concurrent User Sessions Tests', () => {
  let testUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'concurrent-test@example.com',
      password: 'password123',
      firstName: 'Concurrent',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const login = async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'concurrent-test@example.com',
        password: 'password123'
      });

    return {
      token: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken
    };
  };

  beforeEach(async () => {
    // Reset user token state before each test
    await User.findByIdAndUpdate(testUser._id, {
      $unset: {
        tokensInvalidatedAt: 1,
        revokedJtis: 1,
        refreshTokens: 1
      }
    });
  });

  it('should handle multiple device logins correctly', async () => {
    // Login on first device (web)
    const webSession = await login();

    // Login on second device (mobile)
    const mobileSession = await login();

    // Both tokens should work independently
    const webResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${webSession.token}`);

    const mobileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${mobileSession.token}`);

    // Both requests should succeed
    expect(webResponse.status).toBe(200);
    expect(mobileResponse.status).toBe(200);

    // Verify the sessions are independent (have different tokens)
    expect(webSession.token).not.toEqual(mobileSession.token);
  });

  it('should revoke all sessions on logout-everywhere action', async () => {
    // Setup multiple sessions
    const session1 = await login();
    const session2 = await login();
    const session3 = await login();

    // All sessions should be valid initially
    const initialCheck1 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session1.token}`);

    const initialCheck2 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session2.token}`);

    expect(initialCheck1.status).toBe(200);
    expect(initialCheck2.status).toBe(200);

    // Logout everywhere using session1
    await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${session1.token}`);

    // All tokens should now be invalidated
    const response1 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session1.token}`);

    const response2 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session2.token}`);

    const response3 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session3.token}`);

    // All should be unauthorized
    expect(response1.status).toBe(401);
    expect(response2.status).toBe(401);
    expect(response3.status).toBe(401);
  });

  it('should allow individual session logout without affecting others', async () => {
    // Setup multiple sessions
    const session1 = await login();
    const session2 = await login();

    // Logout only session1
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${session1.token}`);

    // Session1 should be invalid
    const response1 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session1.token}`);

    // Session2 should still be valid
    const response2 = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${session2.token}`);

    expect(response1.status).toBe(401);
    expect(response2.status).toBe(200);
  });
});
