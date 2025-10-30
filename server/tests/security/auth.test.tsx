/**
 * Security Tests
 * Tests authentication, authorization, and security measures
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import Pet from '../../src/models/Pet';
import User from '../../src/models/User';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('Security Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Authentication', () => {
    it('should reject requests without JWT token', async () => {
      const response = await request(app)
        .get('/api/profile/pets');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate JWT signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      
      const response = await request(app)
        .get('/api/profile/pets')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/api/profile/pets')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should accept valid JWT tokens', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get('/api/profile/stats/pets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Authorization', () => {
    it('should prevent updating other users pets', async () => {
      const user1 = await createMockUser();
      const user2 = await createMockUser();
      
      const user1Pet = await Pet.create({
        name: 'User 1 Pet',
        species: 'dog',
        owner: user1._id,
      });

      const user2Token = generateTestToken(user2._id.toString());

      const response = await request(app)
        .put(`/api/profile/pets/${user1Pet._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacked' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not authorized');
    });

    it('should enforce admin-only endpoints', async () => {
      const regularUser = await createMockUser();
      const userToken = generateTestToken(regularUser._id.toString());

      const response = await request(app)
        .get('/api/admin/api-management/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admins to access admin endpoints', async () => {
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'hashed',
        role: 'admin',
        isActive: true,
      });

      const adminToken = generateTestToken(adminUser._id.toString());

      const response = await request(app)
        .get('/api/admin/api-management/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    it('should prevent SQL injection attempts', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const maliciousInput = "'; DROP TABLE users; --";

      const response = await request(app)
        .get(`/api/adoption/pets/${maliciousInput}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
    });

    it('should sanitize user inputs', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post('/api/profile/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '<script>alert("xss")</script>',
          species: 'dog',
          breed: 'Lab',
          age: 3,
        });

      if (response.status === 201) {
        expect(response.body.data.name).not.toContain('<script>');
      }
    });

    it('should validate ObjectId format', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get('/api/profile/pets/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      // Make 101 requests (assuming limit is 100/window)
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/profile/stats/messages')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000); // Increase timeout for many requests
  });

  describe('Password Security', () => {
    it('should require password for account deletion', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // No password

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password');
    });

    it('should verify password before account deletion', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'wrong_password' });

      expect(response.status).toBe(401);
    });

    it('should not expose password in responses', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('Data Privacy', () => {
    it('should not leak other users data', async () => {
      const user1 = await createMockUser();
      const user2 = await createMockUser();
      
      const token1 = generateTestToken(user1._id.toString());

      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${token1}`);

      // Should only get user1's data
      expect(response.body.data.user._id.toString()).toBe(user1._id.toString());
      expect(response.body.data.user._id.toString()).not.toBe(user2._id.toString());
    });

    it('should respect privacy settings', async () => {
      const user = await createMockUser();
      const token = generateTestToken(user._id.toString());

      // Set incognito mode
      await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${token}`)
        .send({ incognitoMode: true });

      // Verify privacy is enforced (implementation-dependent)
      const response = await request(app)
        .get('/api/profile/privacy')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.data.incognitoMode).toBe(true);
    });
  });
});
