/**
 * E2E Tests for Pet Matching Algorithms
 * Comprehensive testing of matching algorithms, swipe processing, and match creation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let user1Token;
let user2Token;
let user3Token;
let pet1Id;
let pet2Id;
let pet3Id;

describe('Pet Matching Algorithms E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    process.env.MATCHING_ALGORITHM = 'advanced';
    process.env.MATCHING_THRESHOLD = '0.7';
    process.env.LOCATION_RADIUS = '50';
    
    await mongoose.connect(mongoUri);
    app = require('../../server');
    
    // Create test users and pets
    await setupTestData();
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  async function setupTestData() {
    // Create user 1
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user1${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'User',
        lastName: 'One',
        dateOfBirth: '1990-01-01'
      });
    user1Token = user1Response.body.data.accessToken;

    // Create user 2
    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user2${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'User',
        lastName: 'Two',
        dateOfBirth: '1985-05-15'
      });
    user2Token = user2Response.body.data.accessToken;

    // Create user 3
    const user3Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `user3${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'User',
        lastName: 'Three',
        dateOfBirth: '1992-08-20'
      });
    user3Token = user3Response.body.data.accessToken;

    // Create pet 1 (User 1)
    const pet1Response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${user1Token}`)
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
          city: 'New York',
          state: 'NY',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      });
    pet1Id = pet1Response.body.data._id;

    // Create pet 2 (User 2)
    const pet2Response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Luna',
        species: 'dog',
        breed: 'Labrador',
        age: 2,
        gender: 'female',
        size: 'large',
        description: 'Sweet and gentle lab',
        temperament: ['gentle', 'sweet', 'calm'],
        vaccinated: true,
        neutered: true,
        location: {
          city: 'Brooklyn',
          state: 'NY',
          coordinates: {
            latitude: 40.6782,
            longitude: -73.9442
          }
        }
      });
    pet2Id = pet2Response.body.data._id;

    // Create pet 3 (User 3)
    const pet3Response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${user3Token}`)
      .send({
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
        age: 1,
        gender: 'female',
        size: 'small',
        description: 'Fluffy and affectionate cat',
        temperament: ['affectionate', 'calm', 'independent'],
        vaccinated: true,
        neutered: true,
        location: {
          city: 'Manhattan',
          state: 'NY',
          coordinates: {
            latitude: 40.7589,
            longitude: -73.9851
          }
        }
      });
    pet3Id = pet3Response.body.data._id;
  }

  describe('Pet Discovery Algorithm', () => {
    it('should return pets for swiping based on location', async () => {
      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should not include user's own pet
      const ownPet = response.body.data.find(pet => pet._id === pet1Id);
      expect(ownPet).toBeUndefined();
    });

    it('should filter pets by species preference', async () => {
      // Set user preference for dogs only
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog'],
          ageRange: [1, 10],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 50
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should only return dogs
      const cats = response.body.data.filter(pet => pet.species === 'cat');
      expect(cats.length).toBe(0);
    });

    it('should filter pets by age range', async () => {
      // Set user preference for pets aged 2-4
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog', 'cat'],
          ageRange: [2, 4],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 50
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should only return pets aged 2-4
      const outOfRangePets = response.body.data.filter(pet => pet.age < 2 || pet.age > 4);
      expect(outOfRangePets.length).toBe(0);
    });

    it('should filter pets by size preference', async () => {
      // Set user preference for large pets only
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog', 'cat'],
          ageRange: [1, 10],
          size: ['large'],
          gender: ['male', 'female'],
          distance: 50
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should only return large pets
      const smallPets = response.body.data.filter(pet => pet.size === 'small');
      expect(smallPets.length).toBe(0);
    });

    it('should filter pets by distance', async () => {
      // Set user preference for pets within 10 miles
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog', 'cat'],
          ageRange: [1, 10],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 10
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should only return pets within 10 miles
      response.body.data.forEach(pet => {
        expect(pet.distance).toBeLessThanOrEqual(10);
      });
    });

    it('should sort pets by compatibility score', async () => {
      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should be sorted by compatibility score (highest first)
      const scores = response.body.data.map(pet => pet.compatibilityScore || 0);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
      }
    });

    it('should exclude already swiped pets', async () => {
      // Swipe on pet 2
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Should not include pet 2
      const swipedPet = response.body.data.find(pet => pet._id === pet2Id);
      expect(swipedPet).toBeUndefined();
    });
  });

  describe('Swipe Processing', () => {
    it('should record a like swipe', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('swipeId');
      expect(response.body.data.action).toBe('like');
    });

    it('should record a pass swipe', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet3Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'pass' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('swipeId');
      expect(response.body.data.action).toBe('pass');
    });

    it('should record a super like swipe', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'superlike' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('swipeId');
      expect(response.body.data.action).toBe('superlike');
    });

    it('should not allow duplicate swipes', async () => {
      // First swipe
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(200);

      // Duplicate swipe should fail
      const response = await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already swiped');
    });

    it('should validate swipe action', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'invalid-action' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('action');
    });

    it('should not allow swiping on own pet', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('own pet');
    });
  });

  describe('Match Creation Algorithm', () => {
    it('should create a match when both users like each other', async () => {
      // User 1 likes User 2's pet
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });

      // User 2 likes User 1's pet
      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isMatch', true);
      expect(response.body.data).toHaveProperty('matchId');
    });

    it('should not create a match when only one user likes', async () => {
      // User 1 likes User 3's pet
      const response = await request(app)
        .post(`/api/pets/${pet3Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isMatch', false);
    });

    it('should create a match with super like', async () => {
      // User 1 super likes User 2's pet
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'superlike' });

      // User 2 likes User 1's pet (super like creates match even with regular like)
      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isMatch', true);
      expect(response.body.data).toHaveProperty('matchId');
    });

    it('should not create a match when one user passes', async () => {
      // User 1 passes on User 3's pet
      const response = await request(app)
        .post(`/api/pets/${pet3Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'pass' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isMatch', false);
    });

    it('should calculate match compatibility score', async () => {
      // Create a match
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });

      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('compatibilityScore');
      expect(response.body.data.compatibilityScore).toBeGreaterThan(0);
      expect(response.body.data.compatibilityScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Match Management', () => {
    let matchId;

    beforeEach(async () => {
      // Create a match
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });

      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'like' });

      matchId = response.body.data.matchId;
    });

    it('should get list of matches', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const match = response.body.data.find(m => m._id === matchId);
      expect(match).toBeDefined();
      expect(match).toHaveProperty('pet');
      expect(match).toHaveProperty('owner');
    });

    it('should get match details', async () => {
      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', matchId);
      expect(response.body.data).toHaveProperty('pet');
      expect(response.body.data).toHaveProperty('owner');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should not allow access to other users\' matches', async () => {
      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });

    it('should unmatch pets', async () => {
      const response = await request(app)
        .delete(`/api/matches/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('unmatched');

      // Verify match is removed
      const matchesResponse = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const match = matchesResponse.body.data.find(m => m._id === matchId);
      expect(match).toBeUndefined();
    });
  });

  describe('Compatibility Algorithm', () => {
    it('should calculate compatibility based on species preference', async () => {
      // Set user preference for dogs only
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog'],
          ageRange: [1, 10],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 50
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Dogs should have higher compatibility scores
      const dogs = response.body.data.filter(pet => pet.species === 'dog');
      const cats = response.body.data.filter(pet => pet.species === 'cat');
      
      if (dogs.length > 0 && cats.length > 0) {
        const avgDogScore = dogs.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / dogs.length;
        const avgCatScore = cats.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / cats.length;
        
        expect(avgDogScore).toBeGreaterThan(avgCatScore);
      }
    });

    it('should calculate compatibility based on age preference', async () => {
      // Set user preference for pets aged 2-3
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog', 'cat'],
          ageRange: [2, 3],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 50
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Pets aged 2-3 should have higher compatibility scores
      const preferredAge = response.body.data.filter(pet => pet.age >= 2 && pet.age <= 3);
      const otherAge = response.body.data.filter(pet => pet.age < 2 || pet.age > 3);
      
      if (preferredAge.length > 0 && otherAge.length > 0) {
        const avgPreferredScore = preferredAge.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / preferredAge.length;
        const avgOtherScore = otherAge.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / otherAge.length;
        
        expect(avgPreferredScore).toBeGreaterThan(avgOtherScore);
      }
    });

    it('should calculate compatibility based on temperament', async () => {
      // Set user preference for friendly pets
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          species: ['dog', 'cat'],
          ageRange: [1, 10],
          size: ['small', 'medium', 'large'],
          gender: ['male', 'female'],
          distance: 50,
          temperament: ['friendly', 'playful']
        });

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Pets with preferred temperament should have higher scores
      const friendlyPets = response.body.data.filter(pet => 
        pet.temperament && pet.temperament.some(t => ['friendly', 'playful'].includes(t))
      );
      const otherPets = response.body.data.filter(pet => 
        !pet.temperament || !pet.temperament.some(t => ['friendly', 'playful'].includes(t))
      );
      
      if (friendlyPets.length > 0 && otherPets.length > 0) {
        const avgFriendlyScore = friendlyPets.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / friendlyPets.length;
        const avgOtherScore = otherPets.reduce((sum, pet) => sum + (pet.compatibilityScore || 0), 0) / otherPets.length;
        
        expect(avgFriendlyScore).toBeGreaterThan(avgOtherScore);
      }
    });

    it('should calculate compatibility based on location', async () => {
      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Closer pets should have higher compatibility scores
      const sortedByDistance = [...response.body.data].sort((a, b) => a.distance - b.distance);
      const sortedByScore = [...response.body.data].sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

      const topDistanceIds = new Set(sortedByDistance.slice(0, Math.ceil(sortedByDistance.length / 3)).map(pet => pet._id));
      const topScoreIds = new Set(sortedByScore.slice(0, Math.ceil(sortedByScore.length / 3)).map(pet => pet._id));

      const overlap = [...topDistanceIds].filter(id => topScoreIds.has(id));
      expect(overlap.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle discovery requests efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/pets/discovery')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle swipe requests efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle match creation efficiently', async () => {
      const startTime = Date.now();

      // Create a match
      await request(app)
        .post(`/api/pets/${pet2Id}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' });

      const response = await request(app)
        .post(`/api/pets/${pet1Id}/swipe`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'like' })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(response.body.data.isMatch).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid pet ID in swipe', async () => {
      const response = await request(app)
        .post('/api/pets/invalid-id/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('pet');
    });

    it('should handle non-existent pet in swipe', async () => {
      const fakeObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/pets/${fakeObjectId}/swipe`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ action: 'like' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle invalid match ID', async () => {
      const response = await request(app)
        .get('/api/matches/invalid-id')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('match');
    });

    it('should handle non-existent match', async () => {
      const fakeObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/matches/${fakeObjectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});
