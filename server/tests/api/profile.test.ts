/**
 * Profile API Endpoint Tests
 * Tests all 8 profile management endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import Pet from '../../src/models/Pet';
import User from '../../src/models/User';
import { setupTestDB, teardownTestDB, clearTestDB, createMockUser, generateTestToken } from '../setup';

describe('Profile API Endpoints', () => {
  let testUser: any;
  let testToken: string;
  let testPet: any;

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
    
    // Create a test pet
    testPet = await Pet.create({
      name: 'Test Pet',
      species: 'dog',
      breed: 'Labrador',
      age: 3,
      owner: testUser._id,
    });
  });

  describe('PUT /api/profile/pets/:petId', () => {
    it('should update pet with valid ownership', async () => {
      const response = await request(app)
        .put(`/api/profile/pets/${testPet._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Updated Pet Name',
          age: 4,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Pet Name');
      expect(response.body.data.age).toBe(4);
    });

    it('should reject update without ownership', async () => {
      const otherUser = await createMockUser();
      const otherToken = generateTestToken(otherUser._id.toString());

      const response = await request(app)
        .put(`/api/profile/pets/${testPet._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/profile/pets/${testPet._id}`)
        .send({ name: 'No Auth' });

      expect(response.status).toBe(401);
    });

    it('should validate pet data', async () => {
      const response = await request(app)
        .put(`/api/profile/pets/${testPet._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ age: -5 }); // Invalid age

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/profile/pets', () => {
    it('should create new pet', async () => {
      const response = await request(app)
        .post('/api/profile/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'New Pet',
          species: 'cat',
          breed: 'Persian',
          age: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Pet');
      expect(response.body.data.owner.toString()).toBe(testUser._id.toString());
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/profile/pets')
        .send({ name: 'No Auth Pet' });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/profile/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Incomplete' }); // Missing required fields

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/profile/stats/messages', () => {
    it('should return message count', async () => {
      const response = await request(app)
        .get('/api/profile/stats/messages')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.count).toBe('number');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/profile/stats/messages');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/profile/stats/pets', () => {
    it('should return pet count', async () => {
      const response = await request(app)
        .get('/api/profile/stats/pets')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBeGreaterThanOrEqual(1); // At least our test pet
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/profile/stats/pets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/profile/privacy', () => {
    it('should return privacy settings with defaults', async () => {
      const response = await request(app)
        .get('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('profileVisibility');
      expect(response.body.data).toHaveProperty('showOnlineStatus');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/profile/privacy');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/profile/privacy', () => {
    it('should update privacy settings', async () => {
      const response = await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          profileVisibility: 'matches',
          showOnlineStatus: false,
          incognitoMode: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profileVisibility).toBe('matches');
      expect(response.body.data.showOnlineStatus).toBe(false);
    });

    it('should validate privacy values', async () => {
      const response = await request(app)
        .put('/api/profile/privacy')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          profileVisibility: 'invalid-value',
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/profile/privacy')
        .send({ profileVisibility: 'nobody' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/profile/export', () => {
    it('should export all user data (GDPR)', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('pets');
      expect(response.body.data).toHaveProperty('messages');
      expect(response.body.data).toHaveProperty('exportedAt');
      
      // Should not include password
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should include all user pets in export', async () => {
      const response = await request(app)
        .get('/api/profile/export')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.pets[0].name).toBe('Test Pet');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/profile/export');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/profile/account', () => {
    it('should soft delete account with correct password', async () => {
      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ password: 'correct_password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is marked inactive
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).not.toBeNull();
      expect(deletedUser?.get('isActive')).toBe(false);
      expect(deletedUser?.get('deletedAt')).toBeDefined();
    });

    it('should reject deletion with wrong password', async () => {
      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ password: 'wrong_password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require password', async () => {
      const response = await request(app)
        .delete('/api/profile/account')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/profile/account')
        .send({ password: 'password' });

      expect(response.status).toBe(401);
    });
  });
});
