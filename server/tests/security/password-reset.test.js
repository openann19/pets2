const request = require('supertest');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const crypto = require('crypto');

let mongoServer;

describe('Password Reset Security Tests', () => {
  let testUser;
  let resetToken;
  let hashedToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'reset-test@example.com',
      password: 'password123',
      firstName: 'Reset',
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

  beforeEach(async () => {
    // Generate a fresh reset token before each test
    resetToken = crypto.randomBytes(32).toString('hex');
    hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set reset token in the user document
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry
    
    await User.findByIdAndUpdate(testUser._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: resetExpires
    });
  });

  it('should invalidate reset token after password reset', async () => {
    // First reset - should work
    const firstResetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newPassword456'
      });
    
    expect(firstResetResponse.status).toBe(200);
    
    // Second reset with the same token - should fail
    const secondResetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'anotherPassword789'
      });
    
    // Should be rejected as token should be invalidated after first use
    expect(secondResetResponse.status).toBe(400);
  });

  it('should reject expired reset tokens', async () => {
    // Set token as expired
    await User.findByIdAndUpdate(testUser._id, {
      resetPasswordExpires: new Date(Date.now() - 3600000) // 1 hour in the past
    });
    
    // Try to use expired token
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newPassword456'
      });
    
    // Should be rejected
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('expired');
  });

  it('should validate new password complexity during reset', async () => {
    // Try to reset with weak passwords
    const weakPasswords = [
      '12345', // too short
      'password', // common password
      'abcdefg', // no numbers or special chars
      testUser.firstName // contains first name
    ];
    
    for (const weakPassword of weakPasswords) {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: weakPassword
        });
      
      // Should reject weak passwords
      expect(response.status).toBe(400);
    }
    
    // Try with strong password
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'StrongP@ssw0rd123!'
      });
    
    // Should succeed
    expect(response.status).toBe(200);
  });

  it('should rate limit reset password attempts', async () => {
    // Make multiple reset attempts in quick succession
    const attempts = 10;
    const responses = [];
    
    for (let i = 0; i < attempts; i++) {
      // Generate invalid tokens for attempts
      const invalidToken = crypto.randomBytes(32).toString('hex');
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: invalidToken,
          newPassword: 'StrongP@ssw0rd123!'
        });
      
      responses.push(response);
    }
    
    // Later responses should be rate limited
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status).toBe(429); // Too Many Requests
  });

  it('should prevent timing attacks on token validation', async () => {
    // Create two tokens: one valid, one invalid
    const validToken = resetToken;
    const invalidToken = crypto.randomBytes(32).toString('hex');
    
    // Measure response time for valid token
    const validStart = process.hrtime();
    await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: validToken,
        newPassword: 'StrongP@ssw0rd123!'
      });
    const validEnd = process.hrtime(validStart);
    
    // Measure response time for invalid token
    const invalidStart = process.hrtime();
    await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: invalidToken,
        newPassword: 'StrongP@ssw0rd123!'
      });
    const invalidEnd = process.hrtime(invalidStart);
    
    // Convert hrtime to milliseconds
    const validTime = validEnd[0] * 1000 + validEnd[1] / 1000000;
    const invalidTime = invalidEnd[0] * 1000 + invalidEnd[1] / 1000000;
    
    // Response times should be relatively close
    // This test is a best-effort attempt - it might be flaky due to server load
    // In real-world scenarios, we'd need more sophisticated timing analysis
    const timeDiff = Math.abs(validTime - invalidTime);
    
    // Time difference should be minimal - using a reasonable threshold
    // This is testing that constant-time comparison is used for tokens
    expect(timeDiff).toBeLessThan(100); // within 100ms (generous threshold for test environments)
  });
});
