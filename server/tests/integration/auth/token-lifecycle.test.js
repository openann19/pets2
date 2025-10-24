const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, httpServer } = require('../../../server');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('JWT Token Lifecycle Tests', () => {
  let user;
  let testToken;
  let testRefreshToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    user = new User({
      email: 'token-test@example.com',
      password: 'password123',
      firstName: 'Token',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await user.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  beforeEach(async () => {
    // Get fresh tokens before each test
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'token-test@example.com', password: 'password123' });
    
    testToken = res.body.data.accessToken;
    testRefreshToken = res.body.data.refreshToken;
  });

  it('should gracefully handle token expiration during active session', async () => {
    // Store original implementation
    const originalJwtVerify = jwt.verify;

    // Mock token to be expired only on first call
    let hasBeenCalled = false;
    jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
      if (!hasBeenCalled) {
        hasBeenCalled = true;
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      }
      // Restore original behavior after first call
      return originalJwtVerify(token, secret, callback);
    });

    // Attempt an action that should fail with expired token
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${testToken}`);

    // Should receive 401 with specific error code
    expect(response.status).toBe(401);
    expect(response.body.error).toBeTruthy();
    expect(response.body.message).toContain('expired');

    // Now simulate client refresh token flow
    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: testRefreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();

    // Use new token for retry
    const retryResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${refreshResponse.body.data.accessToken}`);

    expect(retryResponse.status).toBe(200);
    expect(retryResponse.body.data).toBeTruthy();

    // Restore original JWT implementation
    jwt.verify = originalJwtVerify;
  });

  it('should correctly validate active vs. expired tokens', async () => {
    // Valid request with current token
    const validResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(validResponse.status).toBe(200);

    // Create an expired token
    const payload = { userId: user._id.toString(), exp: Math.floor(Date.now() / 1000) - 3600 };
    const expiredToken = jwt.sign(payload, process.env.JWT_SECRET || 'test_secret');

    // Request with expired token
    const expiredResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(expiredResponse.status).toBe(401);
  });

  it('should intercept expired token and refresh on client side', async () => {
    // This is a mock of client-side behavior
    // In a real app, this would be done in the frontend with axios interceptors
    
    // Mock an expired token error
    const mockApiCall = async (shouldBeExpired = false) => {
      if (shouldBeExpired) {
        return {
          status: 401,
          body: { error: 'TokenExpiredError', message: 'jwt expired' }
        };
      }
      
      // Simulate successful API call with valid token
      return { status: 200, body: { data: { message: 'Success' } } };
    };
    
    // Mock refresh token call
    const mockRefreshToken = async () => {
      return {
        status: 200,
        body: { data: { accessToken: 'new_token_123', refreshToken: 'new_refresh_token_123' } }
      };
    };
    
    // Client-side interceptor logic
    const clientApiCall = async () => {
      // First attempt with expired token
      const initialResponse = await mockApiCall(true);
      
      if (initialResponse.status === 401 && 
          initialResponse.body.error === 'TokenExpiredError') {
        
        // Token expired, try to refresh
        const refreshResponse = await mockRefreshToken();
        
        if (refreshResponse.status === 200) {
          // Use new token to retry the original request
          return await mockApiCall();
        }
      }
      
      return initialResponse;
    };
    
    // Execute the client flow
    const finalResponse = await clientApiCall();
    
    // Verify the flow worked
    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body.data.message).toBe('Success');
  });
});
