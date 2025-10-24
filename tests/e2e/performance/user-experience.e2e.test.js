/**
 * User Experience Performance E2E Tests
 * Testing user experience metrics, accessibility, and performance
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { performance } = require('perf_hooks');

let app;
let mongoServer;
let userToken;

describe('User Experience Performance E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'ux-test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    
    await mongoose.connect(mongoUri);
    app = require('../../../server/server');
    
    // Create test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `uxtest${Date.now()}@example.com`,
        password: 'UXTest123!@#',
        firstName: 'UX',
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

  describe('Page Load Performance', () => {
    it('should load authentication pages quickly', async () => {
      const authPages = [
        '/api/auth/me',
        '/api/auth/register',
        '/api/auth/login'
      ];

      for (const page of authPages) {
        const startTime = performance.now();
        
        let response;
        if (page === '/api/auth/me') {
          response = await request(app)
            .get(page)
            .set('Authorization', `Bearer ${userToken}`);
        } else {
          response = await request(app).get(page);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(500); // Should load within 500ms
        console.log(`Auth page ${page}: ${duration.toFixed(2)}ms`);
      }
    });

    it('should load pet discovery page quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${userToken}`);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should load within 1 second
      expect(response.status).toBe(200);
      console.log(`Pet discovery page: ${duration.toFixed(2)}ms`);
    });

    it('should load matches page quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${userToken}`);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(800); // Should load within 800ms
      expect(response.status).toBe(200);
      console.log(`Matches page: ${duration.toFixed(2)}ms`);
    });
  });

  describe('User Flow Performance', () => {
    it('should complete registration flow quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `flowtest${Date.now()}@example.com`,
          password: 'FlowTest123!@#',
          firstName: 'Flow',
          lastName: 'Test',
          dateOfBirth: '1990-01-01'
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(response.status).toBe(201);
      console.log(`Registration flow: ${duration.toFixed(2)}ms`);
    });

    it('should complete login flow quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: `uxtest${Date.now()}@example.com`,
          password: 'UXTest123!@#'
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1500); // Should complete within 1.5 seconds
      expect(response.status).toBe(200);
      console.log(`Login flow: ${duration.toFixed(2)}ms`);
    });

    it('should complete pet creation flow quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'UX Test Pet',
          species: 'dog',
          breed: 'Test Breed',
          age: 2,
          gender: 'male',
          size: 'medium',
          description: 'Test pet for UX testing',
          temperament: ['friendly'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(response.status).toBe(201);
      console.log(`Pet creation flow: ${duration.toFixed(2)}ms`);
    });

    it('should complete swipe flow quickly', async () => {
      // Create a test pet first
      const petResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Swipe Test Pet',
          species: 'cat',
          breed: 'Test Breed',
          age: 1,
          gender: 'female',
          size: 'small',
          description: 'Test pet for swipe testing',
          temperament: ['calm'],
          vaccinated: true,
          neutered: true,
          location: { city: 'Test City', state: 'TS', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
        });

      const startTime = performance.now();
      
      const response = await request(app)
        .post(`/api/pets/${petResponse.body.data._id}/swipe`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ action: 'like' });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(response.status).toBe(200);
      console.log(`Swipe flow: ${duration.toFixed(2)}ms`);
    });
  });

  describe('API Response Consistency', () => {
    it('should provide consistent response times for repeated requests', async () => {
      const requestCount = 10;
      const durations = [];
      
      for (let i = 0; i < requestCount; i++) {
        const startTime = performance.now();
        
        await request(app)
          .get('/api/pets/discover')
          .set('Authorization', `Bearer ${userToken}`);
        
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }
      
      const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      const variance = maxDuration - minDuration;
      
      expect(averageDuration).toBeLessThan(1000); // Average should be under 1 second
      expect(variance).toBeLessThan(500); // Variance should be less than 500ms
      
      console.log(`Response consistency - Average: ${averageDuration.toFixed(2)}ms, Variance: ${variance.toFixed(2)}ms`);
    });

    it('should handle pagination efficiently', async () => {
      const pageSizes = [10, 20, 50];
      
      for (const pageSize of pageSizes) {
        const startTime = performance.now();
        
        const response = await request(app)
          .get(`/api/pets/discover?limit=${pageSize}`)
          .set('Authorization', `Bearer ${userToken}`);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(1500); // Should complete within 1.5 seconds
        console.log(`Pagination (${pageSize} items): ${duration.toFixed(2)}ms`);
      }
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover from errors quickly', async () => {
      const errorScenarios = [
        { name: 'Invalid token', test: () => request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token') },
        { name: 'Missing data', test: () => request(app).post('/api/pets').set('Authorization', `Bearer ${userToken}`).send({}) },
        { name: 'Invalid endpoint', test: () => request(app).get('/api/invalid-endpoint').set('Authorization', `Bearer ${userToken}`) }
      ];
      
      for (const scenario of errorScenarios) {
        const startTime = performance.now();
        
        try {
          await scenario.test();
        } catch (error) {
          // Expected errors
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(300); // Should handle errors quickly
        console.log(`Error recovery (${scenario.name}): ${duration.toFixed(2)}ms`);
      }
    });

    it('should handle network timeouts gracefully', async () => {
      const startTime = performance.now();
      
      try {
        // Simulate a slow request by setting a timeout
        await Promise.race([
          request(app)
            .get('/api/pets/discover')
            .set('Authorization', `Bearer ${userToken}`)
            .timeout(100), // 100ms timeout
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
        ]);
      } catch (error) {
        // Expected timeout
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should timeout quickly
      console.log(`Network timeout handling: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Accessibility Performance', () => {
    it('should provide accessible API responses', async () => {
      const response = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      
      // Check response structure for accessibility
      if (response.body.data && Array.isArray(response.body.data)) {
        response.body.data.forEach(pet => {
          expect(pet).toHaveProperty('name');
          expect(pet).toHaveProperty('species');
          expect(pet).toHaveProperty('age');
          expect(pet).toHaveProperty('description');
        });
      }
      
      console.log('API response accessibility check passed');
    });

    it('should provide consistent error messages', async () => {
      const errorResponses = [
        await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token'),
        await request(app).post('/api/pets').set('Authorization', `Bearer ${userToken}`).send({}),
        await request(app).get('/api/invalid-endpoint').set('Authorization', `Bearer ${userToken}`)
      ];
      
      errorResponses.forEach(response => {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);
      });
      
      console.log('Error message consistency check passed');
    });
  });

  describe('Mobile Performance', () => {
    it('should handle mobile-specific requests efficiently', async () => {
      const mobileHeaders = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken}`
      };
      
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/pets/discover')
        .set(mobileHeaders);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1200); // Should be slightly slower but still efficient
      expect(response.status).toBe(200);
      console.log(`Mobile request: ${duration.toFixed(2)}ms`);
    });

    it('should handle mobile-specific data formats', async () => {
      const mobileHeaders = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken}`
      };
      
      const response = await request(app)
        .get('/api/pets/discover')
        .set(mobileHeaders);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      
      // Check if response is optimized for mobile
      if (response.body.data && Array.isArray(response.body.data)) {
        response.body.data.forEach(pet => {
          expect(pet).toHaveProperty('name');
          expect(pet).toHaveProperty('photos');
          expect(Array.isArray(pet.photos)).toBe(true);
        });
      }
      
      console.log('Mobile data format check passed');
    });
  });

  describe('Real-time Performance', () => {
    it('should handle real-time updates efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate real-time message sending
      const response = await request(app)
        .post('/api/matches/test-match-id/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Real-time test message',
          type: 'text'
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      console.log(`Real-time message: ${duration.toFixed(2)}ms`);
    });

    it('should handle concurrent real-time operations', async () => {
      const concurrentOperations = 5;
      const operations = [];
      
      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          request(app)
            .post('/api/matches/test-match-id/messages')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              content: `Concurrent message ${i}`,
              type: 'text'
            })
        );
      }
      
      const startTime = performance.now();
      const responses = await Promise.allSettled(operations);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const successfulOperations = responses.filter(r => r.status === 'fulfilled').length;
      
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(successfulOperations).toBeGreaterThan(0);
      
      console.log(`Concurrent real-time operations: ${successfulOperations}/${concurrentOperations} in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide performance metrics', async () => {
      const metrics = {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: Date.now()
      };
      
      expect(metrics.memoryUsage).toHaveProperty('heapUsed');
      expect(metrics.memoryUsage).toHaveProperty('heapTotal');
      expect(metrics.memoryUsage).toHaveProperty('rss');
      expect(metrics.uptime).toBeGreaterThan(0);
      expect(metrics.timestamp).toBeGreaterThan(0);
      
      console.log('Performance metrics:', {
        heapUsed: `${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        uptime: `${metrics.uptime.toFixed(2)}s`
      });
    });

    it('should track performance over time', async () => {
      const measurements = [];
      const measurementCount = 5;
      
      for (let i = 0; i < measurementCount; i++) {
        const startTime = performance.now();
        
        await request(app)
          .get('/api/pets/discover')
          .set('Authorization', `Bearer ${userToken}`);
        
        const endTime = performance.now();
        measurements.push({
          duration: endTime - startTime,
          timestamp: Date.now(),
          memoryUsage: process.memoryUsage().heapUsed
        });
        
        // Small delay between measurements
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const averageDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
      const durationVariance = Math.max(...measurements.map(m => m.duration)) - Math.min(...measurements.map(m => m.duration));
      
      expect(averageDuration).toBeLessThan(1000); // Average should be under 1 second
      expect(durationVariance).toBeLessThan(500); // Variance should be reasonable
      
      console.log(`Performance tracking - Average: ${averageDuration.toFixed(2)}ms, Variance: ${durationVariance.toFixed(2)}ms`);
    });
  });
});
