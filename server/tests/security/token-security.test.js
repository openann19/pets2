const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('Token Security Tests', () => {
  let user;
  let validToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    user = new User({
      email: 'security-test@example.com',
      password: 'password123',
      firstName: 'Security',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    });
    await user.save();
    
    // Get a valid token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'security-test@example.com', password: 'password123' });
    
    validToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  it('should reject a JWT with modified payload', async () => {
    // Decode token (without verification)
    const decoded = jwt.decode(validToken);
    
    // Create modified payload
    const modifiedPayload = {
      ...decoded,
      userId: '6579a1f53d12d7abcdef1234', // Different user ID
      premium: { isActive: true, plan: 'ultimate' } // Attempt privilege escalation
    };
    
    // Re-sign with incorrect secret (simulating an attack)
    const forgedToken = jwt.sign(
      modifiedPayload,
      'incorrect_secret_key', // Attacker doesn't know real secret
      { expiresIn: '1h' }
    );
    
    // Try to use forged token
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${forgedToken}`);
    
    // Should be rejected
    expect(response.status).toBe(401);
  });

  it('should reject tokens with tampered user IDs even with correct signature', async () => {
    // Get JWT secret (in a real attack, this would be unknown)
    const jwtSecret = process.env.JWT_SECRET || 'test_secret';
    
    // Decode token (without verification)
    const decoded = jwt.decode(validToken);
    
    // Create a different user
    const anotherUser = new User({
      email: 'another-user@example.com',
      password: 'password123',
      firstName: 'Another',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
    });
    await anotherUser.save();
    
    // Create modified payload with another user's ID
    const modifiedPayload = {
      ...decoded,
      userId: anotherUser._id.toString() // Try to impersonate another user
    };
    
    // Sign with correct secret (simulating a case where an attacker somehow got the secret)
    const tamperedToken = jwt.sign(modifiedPayload, jwtSecret);
    
    // Try to use tampered token
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${tamperedToken}`);
    
    // This should ideally be rejected by additional security checks
    // beyond just the JWT signature (e.g., token blacklisting)
    expect(response.status).toBe(401);
  });

  it('should reject tokens that have been revoked after password change', async () => {
    // Login to get initial token
    const initialLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'security-test@example.com', password: 'password123' });
    
    const initialToken = initialLogin.body.data.accessToken;
    
    // Verify initial token works
    const initialCheck = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${initialToken}`);
    
    expect(initialCheck.status).toBe(200);
    
    // Change password
    await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${initialToken}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newPassword456'
      });
    
    // Try using the old token after password change
    const afterChangeCheck = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${initialToken}`);
    
    // Should be rejected as password change should invalidate all tokens
    expect(afterChangeCheck.status).toBe(401);
    
    // Login again with new password to get a new valid token
    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'security-test@example.com', password: 'newPassword456' });
    
    const newToken = newLogin.body.data.accessToken;
    
    // New token should work
    const newCheck = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${newToken}`);
    
    expect(newCheck.status).toBe(200);
  });

  it('should reject malformed tokens', async () => {
    const malformedTokens = [
      'not.a.jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // Incomplete JWT
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0', // Missing signature
      'totally-invalid-token-123',
      '', // Empty string
      undefined // No token
    ];
    
    // Test each malformed token
    for (const token of malformedTokens) {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', token ? `Bearer ${token}` : '');
      
      expect(response.status).toBe(401);
    }
  });
});
