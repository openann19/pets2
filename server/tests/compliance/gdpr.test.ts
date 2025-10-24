/**
 * GDPR Compliance Tests
 * Tests data export, deletion, and privacy compliance
 */

import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('GDPR Compliance Tests', () => {
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

  describe('Right to Access (Data Export)', () => {
    it('should export all user data', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Should contain all required data
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('pets');
      expect(response.body.data).toHaveProperty('messages');
      expect(response.body.data).toHaveProperty('matches');
      expect(response.body.data).toHaveProperty('exportedAt');
    });

    it('should include complete user profile', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      const userData = response.body.data.user;
      
      expect(userData).toHaveProperty('firstName');
      expect(userData).toHaveProperty('lastName');
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('createdAt');
      
      // Sensitive data should be excluded
      expect(userData).not.toHaveProperty('password');
      expect(userData).not.toHaveProperty('passwordHash');
      expect(userData).not.toHaveProperty('refreshTokens');
    });

    it('should include all user pets', async () => {
      const Pet = require('../../src/models/Pet');
      await Pet.create({
        name: 'Export Test Pet',
        species: 'dog',
        owner: testUser._id,
      });

      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data.pets.length).toBeGreaterThan(0);
      expect(response.body.data.pets[0]).toHaveProperty('name');
      expect(response.body.data.pets[0]).toHaveProperty('species');
    });

    it('should include message history', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });

    it('should timestamp the export', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data.exportedAt).toBeDefined();
      const exportTime = new Date(response.body.data.exportedAt);
      expect(exportTime.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Right to Erasure (Data Deletion)', () => {
    it('should soft delete user account', async () => {
      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ password: 'correct_password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify soft delete
      const User = require('../../src/models/User');
      const deletedUser = await User.findById(testUser._id);
      
      expect(deletedUser.isActive).toBe(false);
      expect(deletedUser.deletedAt).toBeDefined();
      expect(deletedUser.deletedAt).toBeInstanceOf(Date);
    });

    it('should preserve data integrity after soft delete', async () => {
      const Pet = require('../../src/models/Pet');
      await Pet.create({
        name: 'Test Pet',
        species: 'dog',
        owner: testUser._id,
      });

      await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ password: 'correct_password' });

      // Data should still exist
      const User = require('../../src/models/User');
      const deletedUser = await User.findById(testUser._id);
      
      expect(deletedUser).toBeDefined();
      expect(deletedUser.email).toBe(testUser.email);
      
      // Pets should still exist
      const pets = await Pet.find({ owner: testUser._id });
      expect(pets.length).toBeGreaterThan(0);
    });

    it('should prevent login after account deletion', async () => {
      await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ password: 'correct_password' });

      // Try to use API with deleted account
      const response = await request(app)
        .get('/api/profile/stats/pets')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Right to Rectification', () => {
    it('should allow users to update their data', async () => {
      const User = require('../../src/models/User');
      
      // Update user data
      await User.findByIdAndUpdate(testUser._id, {
        firstName: 'Updated',
        lastName: 'Name',
      });

      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');
    });

    it('should allow pet data updates', async () => {
      const Pet = require('../../src/models/Pet');
      const pet = await Pet.create({
        name: 'Old Name',
        species: 'dog',
        owner: testUser._id,
      });

      await request(app)
        .put(`/api/profile/pets/${pet._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'New Name' });

      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      const updatedPet = response.body.data.pets.find(
        (p: any) => p._id.toString() === pet._id.toString()
      );
      
      expect(updatedPet.name).toBe('New Name');
    });
  });

  describe('Right to Restrict Processing', () => {
    it('should respect privacy settings', async () => {
      const response = await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          profileVisibility: 'nobody',
          showOnlineStatus: false,
          shareLocation: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.profileVisibility).toBe('nobody');
      expect(response.body.data.showOnlineStatus).toBe(false);
    });

    it('should allow incognito mode', async () => {
      const response = await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ incognitoMode: true });

      expect(response.status).toBe(200);
      expect(response.body.data.incognitoMode).toBe(true);
    });
  });

  describe('Right to Data Portability', () => {
    it('should export data in machine-readable format (JSON)', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body.data).toBeInstanceOf(Object);
    });

    it('should include all necessary metadata', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      // Each data type should have metadata
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user).toHaveProperty('createdAt');
      
      if (response.body.data.pets.length > 0) {
        expect(response.body.data.pets[0]).toHaveProperty('_id');
        expect(response.body.data.pets[0]).toHaveProperty('createdAt');
      }
    });
  });

  describe('Consent Management', () => {
    it('should track privacy settings changes', async () => {
      await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          allowMessages: 'matches',
          showReadReceipts: true,
        });

      const response = await request(app)
        .get('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data.allowMessages).toBe('matches');
      expect(response.body.data.showReadReceipts).toBe(true);
    });
  });

  describe('Data Minimization', () => {
    it('should not collect unnecessary data', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      // Should not include internal system data
      expect(response.body.data).not.toHaveProperty('__v');
      expect(response.body.data.user).not.toHaveProperty('refreshTokens');
      expect(response.body.data.user).not.toHaveProperty('passwordResetTokens');
    });
  });
});
