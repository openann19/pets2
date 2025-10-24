/**
 * E2E Tests for Pet Swipe Flow
 * Tests creating pets, swiping, and matching
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let userToken;
let petId;

describe('Pet Swipe E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    
    // Connect to MongoDB before importing app
    await mongoose.connect(mongoUri);
    
    app = require('../../server');
    
    // Create test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `pettest${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Pet',
        lastName: 'Tester',
        dateOfBirth: '1990-01-01'
      });
    
    userToken = response.body.data.accessToken;
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000); // 30 second timeout for cleanup

  describe('Pet Creation', () => {
    it('should create a new pet', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'male',
          size: 'large',
          description: 'Friendly and energetic dog',
          temperament: ['friendly', 'energetic', 'playful'],
          vaccinated: true,
          neutered: true,
          location: {
            city: 'Test City',
            state: 'Test State',
            coordinates: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Buddy');
      
      petId = response.body.data._id;
    });

    it('should not create pet without authentication', async () => {
      await request(app)
        .post('/api/pets')
        .send({
          name: 'Test Pet',
          species: 'dog'
        })
        .expect(401);
    });

    it('should not create pet with invalid data', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '', // Invalid: empty name
          species: 'invalid-species'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Pet Listing', () => {
    it('should get list of pets for swiping', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get single pet by ID', async () => {
      const response = await request(app)
        .get(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(petId);
      expect(response.body.data.name).toBe('Buddy');
    });
  });

  describe('Swipe Actions', () => {
    let secondUserToken;
    let secondPetId;

    beforeAll(async () => {
      // Create second user and pet for matching
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `pettest2${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'Pet2',
          lastName: 'Tester2',
          dateOfBirth: '1990-01-01'
        });
      
      secondUserToken = userResponse.body.data.accessToken;

      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          name: 'Max',
          species: 'dog',
          breed: 'Labrador',
          age: 2,
          gender: 'male',
          size: 'large',
          location: {
            city: 'Test City',
            state: 'Test State'
          }
        });
      
      secondPetId = petResponse.body.data._id;
    });

    it('should record a like swipe', async () => {
      const response = await request(app)
        .post(`/api/pets/${secondPetId}/swipe`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          action: 'like'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should record a pass swipe', async () => {
      // Create another pet to swipe on
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          name: 'Luna',
          species: 'cat',
          breed: 'Persian',
          age: 1
        });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.data._id}/swipe`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          action: 'pass'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should create a match when both users like each other', async () => {
      // Second user likes first user's pet
      const response = await request(app)
        .post(`/api/pets/${petId}/swipe`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          action: 'like'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isMatch', true);
    });
  });

  describe('Matches', () => {
    it('should get list of matches', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get match details', async () => {
      // Get first match
      const matchesResponse = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${userToken}`);

      const matchId = matchesResponse.body.data[0]._id;

      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(matchId);
    });
  });
});

module.exports = { describe, it, expect, beforeAll, afterAll };
