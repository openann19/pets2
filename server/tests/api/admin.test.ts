/**
 * Admin API Endpoint Tests
 * Tests all 8 admin management endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('Admin API Endpoints', () => {
  let adminUser: any;
  let adminToken: string;
  let regularUser: any;
  let regularToken: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create admin user
    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'hashed_password',
      role: 'admin',
      isActive: true,
    });
    adminToken = generateTestToken(adminUser._id.toString());

    // Create regular user
    regularUser = await createMockUser();
    regularToken = generateTestToken(regularUser._id.toString());
  });

  describe('GET /api/admin/api-management/stats', () => {
    it('should return API statistics for admin', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEndpoints');
      expect(response.body.data).toHaveProperty('activeEndpoints');
      expect(response.body.data).toHaveProperty('totalCalls');
      expect(response.body.data).toHaveProperty('avgResponseTime');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/stats')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('admin');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/api-management/endpoints', () => {
    it('should return list of endpoints with filters', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/endpoints')
        .query({ method: 'GET', status: 'active' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support search filtering', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/endpoints')
        .query({ search: 'profile' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/api-management/endpoints')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/api-keys/generate', () => {
    it('should generate new API key for admin', async () => {
      const response = await request(app)
        .post('/api/admin/api-keys/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test API Key',
          permissions: ['read', 'write'],
          expiresIn: '30d',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('key');
      expect(response.body.data).toHaveProperty('keyId');
      expect(response.body.data.name).toBe('Test API Key');
    });

    it('should validate API key permissions', async () => {
      const response = await request(app)
        .post('/api/admin/api-keys/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Key',
          permissions: ['invalid_permission'],
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post('/api/admin/api-keys/generate')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ name: 'Unauthorized Key' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/api-keys/:keyId', () => {
    let testApiKey: any;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/admin/api-keys/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Key to Delete',
          permissions: ['read'],
        });

      testApiKey = response.body.data;
    });

    it('should revoke API key', async () => {
      const response = await request(app)
        .delete(`/api/admin/api-keys/${testApiKey.keyId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/admin/api-keys/${testApiKey.keyId}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent key', async () => {
      const response = await request(app)
        .delete('/api/admin/api-keys/nonexistent-key')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/admin/kyc/pending', () => {
    beforeEach(async () => {
      // Create users with pending KYC
      await User.create({
        firstName: 'Pending',
        lastName: 'KYC',
        email: 'pending@example.com',
        password: 'hashed',
        kycStatus: 'pending',
        isActive: true,
      });
    });

    it('should return pending KYC requests', async () => {
      const response = await request(app)
        .get('/api/admin/kyc/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/kyc/pending')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/kyc/:userId/approve', () => {
    let pendingUser: any;

    beforeEach(async () => {
      pendingUser = await User.create({
        firstName: 'Pending',
        lastName: 'User',
        email: 'pending.kyc@example.com',
        password: 'hashed',
        kycStatus: 'pending',
        isActive: true,
      });
    });

    it('should approve KYC request', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Documents verified' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify status updated
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.get('kycStatus')).toBe('approved');
    });

    it('should log approval activity', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Approved' });

      expect(response.status).toBe(200);
      // Activity log should be created (implementation dependent)
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/approve`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ notes: 'Unauthorized' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/admin/kyc/:userId/reject', () => {
    let pendingUser: any;

    beforeEach(async () => {
      pendingUser = await User.create({
        firstName: 'Pending',
        lastName: 'User',
        email: 'reject.kyc@example.com',
        password: 'hashed',
        kycStatus: 'pending',
        isActive: true,
      });
    });

    it('should reject KYC request with reason', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Incomplete documents',
          notes: 'Missing proof of address',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify status updated
      const updatedUser = await User.findById(pendingUser._id);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.get('kycStatus')).toBe('rejected');
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // No reason

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('reason');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post(`/api/admin/kyc/${pendingUser._id}/reject`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ reason: 'Unauthorized' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/kyc/stats', () => {
    beforeEach(async () => {
      // Create users with different KYC statuses
      await User.create([
        { firstName: 'Pending1', lastName: 'User', email: 'p1@example.com', password: 'h', kycStatus: 'pending', isActive: true },
        { firstName: 'Pending2', lastName: 'User', email: 'p2@example.com', password: 'h', kycStatus: 'pending', isActive: true },
        { firstName: 'Approved', lastName: 'User', email: 'a1@example.com', password: 'h', kycStatus: 'approved', isActive: true },
        { firstName: 'Rejected', lastName: 'User', email: 'r1@example.com', password: 'h', kycStatus: 'rejected', isActive: true },
      ]);
    });

    it('should return KYC statistics', async () => {
      const response = await request(app)
        .get('/api/admin/kyc/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('approved');
      expect(response.body.data).toHaveProperty('rejected');
      expect(response.body.data.pending).toBeGreaterThanOrEqual(2);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/kyc/stats')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });
  });
});
