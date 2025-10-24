const request = require('supertest');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('Input Validation Security Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    testUser = new User({
      email: 'security-input@example.com',
      password: 'password123',
      firstName: 'Input',
      lastName: 'Validation',
      dateOfBirth: '1990-01-01',
    });
    await testUser.save();
    
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'security-input@example.com',
        password: 'password123'
      });
    
    authToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  describe('XSS Attack Prevention Tests', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<body onload="alert(\'XSS\')">',
      '<svg/onload=alert("XSS")>',
      '\'\');alert(\'XSS\')//'
    ];
    
    it('should sanitize XSS attempts in user profile updates', async () => {
      for (const xssPayload of xssPayloads) {
        const response = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: xssPayload,
            lastName: 'Test',
            bio: `Biography with ${xssPayload} injection`
          });
        
        // Even if the update is successful, the XSS payload should be sanitized
        if (response.status === 200) {
          const updatedUser = await User.findById(testUser._id);
          
          // Check that raw script tags are not stored in the database
          expect(updatedUser.firstName).not.toContain('<script>');
          expect(updatedUser.bio).not.toContain('<script>');
          
          // JavaScript protocol should be removed
          expect(updatedUser.firstName).not.toContain('javascript:');
          expect(updatedUser.bio).not.toContain('javascript:');
          
          // Event handlers should be stripped
          expect(updatedUser.firstName).not.toContain('onerror=');
          expect(updatedUser.bio).not.toContain('onerror=');
          expect(updatedUser.firstName).not.toContain('onload=');
          expect(updatedUser.bio).not.toContain('onload=');
        }
      }
    });
    
    it('should sanitize XSS attempts in pet profiles', async () => {
      // Create a pet first
      const createPetResponse = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Pet',
          species: 'Dog',
          breed: 'Mixed',
          age: 3,
          bio: 'Clean bio'
        });
      
      const petId = createPetResponse.body.data._id;
      
      for (const xssPayload of xssPayloads) {
        await request(app)
          .put(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Pet ${xssPayload} Name`,
            bio: `Bio with ${xssPayload}`
          });
        
        // Check that the database doesn't contain raw XSS payloads
        const pet = await Pet.findById(petId);
        
        // Raw script tags should not be stored
        expect(pet.name).not.toContain('<script>');
        expect(pet.bio).not.toContain('<script>');
        
        // JavaScript protocol should be removed
        expect(pet.name).not.toContain('javascript:');
        expect(pet.bio).not.toContain('javascript:');
      }
    });
    
    it('should sanitize XSS attempts in chat messages', async () => {
      // Sending chat messages with XSS payloads
      for (const xssPayload of xssPayloads) {
        const response = await request(app)
          .post('/api/chat/matches/123/messages') // Match ID doesn't matter for this test
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: `Message with ${xssPayload}`
          });
        
        // If API rejects the input, that's good
        // If it accepts, make sure it sanitized the content
        if (response.status === 201 || response.status === 200) {
          expect(response.body.data.content).not.toContain('<script>');
          expect(response.body.data.content).not.toContain('javascript:');
          expect(response.body.data.content).not.toContain('onerror=');
          expect(response.body.data.content).not.toContain('onload=');
        }
      }
    });
  });

  describe('SQL Injection Prevention Tests', () => {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'); --",
      "1; SELECT * FROM information_schema.tables"
    ];
    
    it('should prevent SQL injection in login form', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: payload
          });
        
        // Should not allow SQL injection to succeed
        expect(response.status).not.toBe(200);
      }
    });
    
    it('should prevent SQL injection in user search', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get(`/api/users/search?q=${payload}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        // Should not error in a way that indicates SQL vulnerability
        expect(response.status).not.toBe(500);
        
        // If response is successful, result should be empty or sanitized
        if (response.status === 200) {
          // Check that we didn't accidentally return all users (which would happen with successful injection)
          if (response.body.data && Array.isArray(response.body.data)) {
            // Should not return users unless there's an actual match on the sanitized input
            expect(response.body.data.length).toBeLessThan(10); // Arbitrary limit
          }
        }
      }
    });
    
    it('should prevent NoSQL injection in ID parameters', async () => {
      const nosqlInjectionIds = [
        '{"$gt": ""}', // MongoDB query that would match all documents
        '{"$ne": null}', // Not equal to null would match all non-null IDs
        '{"$where": "this.password == this.username"}' // Arbitrary JavaScript execution
      ];
      
      for (const payload of nosqlInjectionIds) {
        const response = await request(app)
          .get(`/api/users/${payload}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        // Should not return success or server error
        expect(response.status).toBe(400).or(expect(response.status).toBe(404));
      }
    });
  });

  describe('Unicode & Character Encoding Tests', () => {
    it('should handle complex Unicode inputs correctly', async () => {
      const complexInputs = [
        'نص عربي', // Arabic (right-to-left)
        'אָלֶף־בֵּית עִבְרִי', // Hebrew (right-to-left)
        '日本語テスト', // Japanese
        '🐶🐱🐰🐢', // Emoji
        'Z̷̧̲̠̖͔̞̱͖̋̀̅̈́̈́̊̓̕͠a̸͖̠̞̖̐̀̋͆͐̒̚͠l̷̛̤̝̯͕̱̮͑̃̆͊̿ĝ̴̢̬̫̖̃̓̏̉o̷̪̜̮̭̔̇͑̔ͅ ̸̻̗̃̂́̈́̈̓̚ţ̶̹̯͍͔͎͇̹͚͍̀̏̑e̸̛̫̺̱̋͂̎̾x̴̢̺͇̠̦̱͙͒̀̋̊͊̓̇͗̕t̶̡̧̯̯͚͉̙͖̿̆̔̍̾͜͝', // Zalgo text with combining characters
        '𠜎𠜱𠝹𠱓𠱸𠲖𠳏', // Rare Chinese characters
        '\u200B\u200C\u200D\u200E\u200F', // Zero-width characters
        '\\n\\r\\t\\b\\f' // Escape sequences
      ];
      
      for (const input of complexInputs) {
        // Test user profile update
        const profileResponse = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: input,
            bio: `Bio with ${input} complex characters`
          });
        
        // Should handle the input without crashing
        expect(profileResponse.status).not.toBe(500);
        
        // Test pet name update (create a pet first)
        const createPetResponse = await request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Pet',
            species: 'Dog',
            breed: 'Mixed',
            age: 3,
            bio: 'Clean bio'
          });
        
        const petId = createPetResponse.body.data._id;
        
        const petUpdateResponse = await request(app)
          .put(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: input,
            bio: `Pet bio with ${input}`
          });
        
        // Should handle the input without crashing
        expect(petUpdateResponse.status).not.toBe(500);
        
        // Test chat message with complex characters
        const chatResponse = await request(app)
          .post('/api/chat/matches/123/messages')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: `Message with ${input}`
          });
        
        // Should handle the input without crashing
        expect(chatResponse.status).not.toBe(500);
      }
    });
  });
});
