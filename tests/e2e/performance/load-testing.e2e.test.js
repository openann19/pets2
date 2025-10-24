/**
 * Load Testing E2E Tests
 * Comprehensive performance testing for API endpoints and user flows
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { performance } = require('perf_hooks');

let app;
let mongoServer;
let userToken;

describe('Load Testing E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'load-test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    
    await mongoose.connect(mongoUri);
    app = require('../../../server/server');
    
    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `loadtest${Date.now()}@example.com`,
        password: 'LoadTest123!@#',
        firstName: 'Load',
        lastName: 'Test',
        dateOfBirth: '1990-01-01'
      });
    userToken = userResponse.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  describe('API Response Time Tests', () => {
    it('should respond to auth endpoints within acceptable time', async () => {
      const endpoints = [
        { method: 'POST', path: '/api/auth/login', data: { email: 'test@example.com', password: 'password' } },
        { method: 'POST', path: '/api/auth/register', data: { email: 'new@example.com', password: 'password', firstName: 'New', lastName: 'User', dateOfBirth: '1990-01-01' } },
        { method: 'GET', path: '/api/auth/me', headers: { Authorization: `Bearer ${userToken}` } }
      ];

      for (const endpoint of endpoints) {
        const startTime = performance.now();
        
        let response;
        if (endpoint.method === 'GET') {
          response = await request(app)
            .get(endpoint.path)
            .set(endpoint.headers || {});
        } else {
          response = await request(app)
            [endpoint.method.toLowerCase()](endpoint.path)
            .send(endpoint.data)
            .set(endpoint.headers || {});
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1000); // Should respond within 1 second
        console.log(`${endpoint.method} ${endpoint.path}: ${duration.toFixed(2)}ms`);
      }
    });

    it('should respond to pet endpoints within acceptable time', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/pets/discover', headers: { Authorization: `Bearer ${userToken}` } },
        { method: 'GET', path: '/api/pets/my-pets', headers: { Authorization: `Bearer ${userToken}` } },
        { method: 'POST', path: '/api/pets', headers: { Authorization: `Bearer ${userToken}` }, data: {
          name: 'Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        }}
      ];

      for (const endpoint of endpoints) {
        const startTime = performance.now();
        
        let response;
        if (endpoint.method === 'GET') {
          response = await request(app)
            .get(endpoint.path)
            .set(endpoint.headers || {});
        } else {
          response = await request(app)
            [endpoint.method.toLowerCase()](endpoint.path)
            .send(endpoint.data)
            .set(endpoint.headers || {});
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
        console.log(`${endpoint.method} ${endpoint.path}: ${duration.toFixed(2)}ms`);
      }
    });

    it('should respond to match endpoints within acceptable time', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/matches', headers: { Authorization: `Bearer ${userToken}` } },
        { method: 'GET', path: '/api/matches/match-1/messages', headers: { Authorization: `Bearer ${userToken}` } }
      ];

      for (const endpoint of endpoints) {
        const startTime = performance.now();
        
        const response = await request(app)
          .get(endpoint.path)
          .set(endpoint.headers || {});
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1500); // Should respond within 1.5 seconds
        console.log(`${endpoint.method} ${endpoint.path}: ${duration.toFixed(2)}ms`);
      }
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle multiple concurrent login requests', async () => {
      const concurrentRequests = 10;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `concurrent${i}@example.com`,
              password: 'Concurrent123!'
            })
        );
      }
      
      const startTime = performance.now();
      const responses = await Promise.allSettled(requests);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 'fulfilled').length;
      const failedRequests = responses.filter(r => r.status === 'rejected').length;
      
      expect(successfulRequests).toBeGreaterThan(0);
      expect(totalDuration).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`Concurrent login requests: ${successfulRequests} successful, ${failedRequests} failed in ${totalDuration.toFixed(2)}ms`);
    });

    it('should handle multiple concurrent pet discovery requests', async () => {
      const concurrentRequests = 20;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          request(app)
            .get('/api/pets/discover')
            .set('Authorization', `Bearer ${userToken}`)
        );
      }
      
      const startTime = performance.now();
      const responses = await Promise.allSettled(requests);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 'fulfilled').length;
      const failedRequests = responses.filter(r => r.status === 'rejected').length;
      
      expect(successfulRequests).toBeGreaterThan(0);
      expect(totalDuration).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`Concurrent pet discovery requests: ${successfulRequests} successful, ${failedRequests} failed in ${totalDuration.toFixed(2)}ms`);
    });

    it('should handle multiple concurrent swipe requests', async () => {
      // Create test pets first
      const pet1Response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Concurrent Pet 1',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        });

      const pet2Response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Concurrent Pet 2',
          species: 'cat',
          breed: 'Test Breed',
          age: 1,
          gender: 'female',
          size: 'small',
          description: 'Test pet',
          temperament: ['calm'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        });

      const concurrentRequests = 15;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        const petId = i % 2 === 0 ? pet1Response.body.data._id : pet2Response.body.data._id;
        requests.push(
          request(app)
            .post(`/api/pets/${petId}/swipe`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ action: 'like' })
        );
      }
      
      const startTime = performance.now();
      const responses = await Promise.allSettled(requests);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 'fulfilled').length;
      const failedRequests = responses.filter(r => r.status === 'rejected').length;
      
      expect(successfulRequests).toBeGreaterThan(0);
      expect(totalDuration).toBeLessThan(8000); // Should complete within 8 seconds
      
      console.log(`Concurrent swipe requests: ${successfulRequests} successful, ${failedRequests} failed in ${totalDuration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not exceed memory limits during heavy operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform heavy operations
      const heavyRequests = [];
      for (let i = 0; i < 50; i++) {
        heavyRequests.push(
          request(app)
            .get('/api/pets/discover')
            .set('Authorization', `Bearer ${userToken}`)
        );
      }
      
      await Promise.allSettled(heavyRequests);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    it('should handle large data sets efficiently', async () => {
      // Create multiple pets to test large data handling
      const petCreationRequests = [];
      for (let i = 0; i < 100; i++) {
        petCreationRequests.push(
          request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              name: `Large Dataset Pet ${i}`,
              species: i % 2 === 0 ? 'dog' : 'cat',
              breed: 'Test Breed',
              age: Math.floor(Math.random() * 10) + 1,
              gender: i % 2 === 0 ? 'male' : 'female',
              size: ['small', 'medium', 'large'][i % 3],
              description: `Test pet ${i}`,
              temperament: ['friendly'],
              vaccinated: true,
              neutered: true,
              location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
            })
        );
      }
      
      const startTime = performance.now();
      await Promise.allSettled(petCreationRequests);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      
      console.log(`Large dataset creation: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle database queries efficiently', async () => {
      const queryTests = [
        { name: 'User lookup', query: () => request(app).get('/api/auth/me').set('Authorization', `Bearer ${userToken}`) },
        { name: 'Pet discovery', query: () => request(app).get('/api/pets/discover').set('Authorization', `Bearer ${userToken}`) },
        { name: 'Match listing', query: () => request(app).get('/api/matches').set('Authorization', `Bearer ${userToken}`) }
      ];
      
      for (const test of queryTests) {
        const startTime = performance.now();
        await test.query();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1000); // Should complete within 1 second
        console.log(`${test.name}: ${duration.toFixed(2)}ms`);
      }
    });

    it('should handle database writes efficiently', async () => {
      const writeTests = [
        { name: 'Pet creation', write: () => request(app).post('/api/pets').set('Authorization', `Bearer ${userToken}`).send({
          name: 'Write Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        })},
        { name: 'Swipe recording', write: () => request(app).post('/api/pets/test-pet-id/swipe').set('Authorization', `Bearer ${userToken}`).send({ action: 'like' })}
      ];
      
      for (const test of writeTests) {
        const startTime = performance.now();
        try {
          await test.write();
        } catch (error) {
          // Expected for some tests due to missing data
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
        console.log(`${test.name}: ${duration.toFixed(2)}ms`);
      }
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently', async () => {
      const errorTests = [
        { name: 'Invalid auth', test: () => request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token') },
        { name: 'Invalid pet ID', test: () => request(app).get('/api/pets/invalid-id').set('Authorization', `Bearer ${userToken}`) },
        { name: 'Invalid match ID', test: () => request(app).get('/api/matches/invalid-id/messages').set('Authorization', `Bearer ${userToken}`) }
      ];
      
      for (const test of errorTests) {
        const startTime = performance.now();
        try {
          await test.test();
        } catch (error) {
          // Expected errors
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(500); // Should handle errors quickly
        console.log(`${test.name}: ${duration.toFixed(2)}ms`);
      }
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should handle rate limiting efficiently', async () => {
      const rateLimitRequests = [];
      for (let i = 0; i < 100; i++) {
        rateLimitRequests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `ratelimit${i}@example.com`,
              password: 'RateLimit123!'
            })
        );
      }
      
      const startTime = performance.now();
      const responses = await Promise.allSettled(rateLimitRequests);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const rateLimitedResponses = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      ).length;
      
      expect(rateLimitedResponses).toBeGreaterThan(0);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
      
      console.log(`Rate limiting test: ${rateLimitedResponses} rate limited responses in ${duration.toFixed(2)}ms`);
    });
  });
});
