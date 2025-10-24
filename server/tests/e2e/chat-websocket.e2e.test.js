/**
 * E2E Tests for Chat APIs and WebSocket Functionality
 * Comprehensive testing of real-time messaging and WebSocket features
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const WebSocket = require('ws');

let app;
let mongoServer;
let user1Token;
let user2Token;
let matchId;

describe('Chat APIs and WebSocket E2E Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests-only-minimum-32-characters-long';
    process.env.CLIENT_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';
    process.env.WEBSOCKET_PORT = '8080';
    process.env.MESSAGE_RATE_LIMIT = '10';
    process.env.MESSAGE_RATE_WINDOW = '60000';
    
    await mongoose.connect(mongoUri);
    app = require('../../server');
    
    // Create test users and match
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

    // Create pets for both users
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
        description: 'Friendly dog',
        temperament: ['friendly'],
        vaccinated: true,
        neutered: true,
        location: {
          city: 'New York',
          state: 'NY',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        }
      });

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
        description: 'Sweet dog',
        temperament: ['gentle'],
        vaccinated: true,
        neutered: true,
        location: {
          city: 'Brooklyn',
          state: 'NY',
          coordinates: { latitude: 40.6782, longitude: -73.9442 }
        }
      });

    // Create a match
    await request(app)
      .post(`/api/pets/${pet2Response.body.data._id}/swipe`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ action: 'like' });

    const matchResponse = await request(app)
      .post(`/api/pets/${pet1Response.body.data._id}/swipe`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ action: 'like' });

    matchId = matchResponse.body.data.matchId;
  }

  describe('Chat Message APIs', () => {
    it('should send a text message', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Hello! How are you?'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('type', 'text');
      expect(response.body.data).toHaveProperty('content', 'Hello! How are you?');
      expect(response.body.data).toHaveProperty('sender');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should send an image message', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'image',
          content: 'https://example.com/image.jpg',
          metadata: {
            filename: 'pet-photo.jpg',
            size: 1024000,
            mimeType: 'image/jpeg'
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'image');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('metadata');
    });

    it('should send a location message', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'location',
          content: 'Central Park, New York',
          metadata: {
            latitude: 40.7829,
            longitude: -73.9654,
            address: 'Central Park, New York, NY'
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'location');
      expect(response.body.data).toHaveProperty('metadata');
      expect(response.body.data.metadata).toHaveProperty('latitude');
      expect(response.body.data.metadata).toHaveProperty('longitude');
    });

    it('should get chat messages', async () => {
      // Send a message first
      await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Test message'
        });

      const response = await request(app)
        .get(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const message = response.body.data[0];
      expect(message).toHaveProperty('_id');
      expect(message).toHaveProperty('type');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('sender');
      expect(message).toHaveProperty('timestamp');
    });

    it('should paginate chat messages', async () => {
      const response = await request(app)
        .get(`/api/chat/matches/${matchId}/messages?page=1&limit=10`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('messages');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('pages');
    });

    it('should not allow sending messages to non-existent match', async () => {
      const fakeObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/chat/matches/${fakeObjectId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Hello!'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should not allow sending messages to match you are not part of', async () => {
      // Create another user and try to send message to existing match
      const user3Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user3${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'User',
          lastName: 'Three',
          dateOfBirth: '1992-08-20'
        });

      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user3Response.body.data.accessToken}`)
        .send({
          type: 'text',
          content: 'Hello!'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });

    it('should validate message content', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('content');
    });

    it('should validate message type', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'invalid-type',
          content: 'Hello!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('type');
    });
  });

  describe('Message Status and Read Receipts', () => {
    let messageId;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Test message for status'
        });
      
      messageId = response.body.data._id;
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .put(`/api/chat/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'read');
      expect(response.body.data).toHaveProperty('readAt');
    });

    it('should mark message as delivered', async () => {
      const response = await request(app)
        .put(`/api/chat/messages/${messageId}/delivered`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'delivered');
      expect(response.body.data).toHaveProperty('deliveredAt');
    });

    it('should get message status', async () => {
      const response = await request(app)
        .get(`/api/chat/messages/${messageId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('sentAt');
    });

    it('should not allow marking own message as read', async () => {
      const response = await request(app)
        .put(`/api/chat/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('own message');
    });
  });

  describe('WebSocket Real-time Communication', () => {
    let ws1;
    let ws2;

    beforeEach(async () => {
      // Create WebSocket connections for both users
      ws1 = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        }
      });

      ws2 = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': `Bearer ${user2Token}`
        }
      });

      // Wait for connections to be established
      await new Promise((resolve) => {
        let connected = 0;
        const checkConnection = () => {
          connected++;
          if (connected === 2) resolve();
        };
        ws1.on('open', checkConnection);
        ws2.on('open', checkConnection);
      });
    });

    afterEach(() => {
      if (ws1) ws1.close();
      if (ws2) ws2.close();
    });

    it('should establish WebSocket connection with valid token', async () => {
      expect(ws1.readyState).toBe(WebSocket.OPEN);
      expect(ws2.readyState).toBe(WebSocket.OPEN);
    });

    it('should send real-time message via WebSocket', async () => {
      const messagePromise = new Promise((resolve) => {
        ws2.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'message') {
            resolve(message);
          }
        });
      });

      // Send message via WebSocket
      ws1.send(JSON.stringify({
        type: 'send_message',
        matchId: matchId,
        content: 'Hello via WebSocket!',
        messageType: 'text'
      }));

      const receivedMessage = await messagePromise;
      expect(receivedMessage.data.content).toBe('Hello via WebSocket!');
      expect(receivedMessage.data.type).toBe('text');
    });

    it('should send typing indicator via WebSocket', async () => {
      const typingPromise = new Promise((resolve) => {
        ws2.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'typing') {
            resolve(message);
          }
        });
      });

      // Send typing indicator
      ws1.send(JSON.stringify({
        type: 'typing',
        matchId: matchId,
        isTyping: true
      }));

      const typingMessage = await typingPromise;
      expect(typingMessage.data.isTyping).toBe(true);
      expect(typingMessage.data.userId).toBeDefined();
    });

    it('should send read receipt via WebSocket', async () => {
      // First send a message
      const messageResponse = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Message for read receipt'
        });

      const readReceiptPromise = new Promise((resolve) => {
        ws1.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'read_receipt') {
            resolve(message);
          }
        });
      });

      // Mark message as read via WebSocket
      ws2.send(JSON.stringify({
        type: 'mark_read',
        messageId: messageResponse.body.data._id
      }));

      const readReceipt = await readReceiptPromise;
      expect(readReceipt.data.messageId).toBe(messageResponse.body.data._id);
      expect(readReceipt.data.status).toBe('read');
    });

    it('should handle WebSocket connection errors', async () => {
      const invalidWs = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const errorPromise = new Promise((resolve) => {
        invalidWs.on('error', resolve);
      });

      await errorPromise;
      expect(invalidWs.readyState).toBe(WebSocket.CLOSED);
    });

    it('should handle WebSocket message validation', async () => {
      const errorPromise = new Promise((resolve) => {
        ws1.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'error') {
            resolve(message);
          }
        });
      });

      // Send invalid message
      ws1.send(JSON.stringify({
        type: 'invalid_type',
        data: 'invalid data'
      }));

      const errorMessage = await errorPromise;
      expect(errorMessage.error).toBeDefined();
    });

    it('should handle WebSocket reconnection', async () => {
      // Close first connection
      ws1.close();

      // Create new connection
      const newWs1 = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        }
      });

      const connectionPromise = new Promise((resolve) => {
        newWs1.on('open', resolve);
      });

      await connectionPromise;
      expect(newWs1.readyState).toBe(WebSocket.OPEN);

      newWs1.close();
    });
  });

  describe('Chat Room Management', () => {
    it('should join chat room', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/join`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('roomId');
      expect(response.body.data).toHaveProperty('participants');
    });

    it('should leave chat room', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/leave`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('left');
    });

    it('should get chat room participants', async () => {
      const response = await request(app)
        .get(`/api/chat/matches/${matchId}/participants`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should not allow joining chat room you are not part of', async () => {
      // Create another user
      const user3Response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user3${Date.now()}@example.com`,
          password: 'Test123!@#',
          firstName: 'User',
          lastName: 'Three',
          dateOfBirth: '1992-08-20'
        });

      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/join`)
        .set('Authorization', `Bearer ${user3Response.body.data.accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });
  });

  describe('Message Moderation and Safety', () => {
    it('should filter inappropriate content', async () => {
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'This is inappropriate content with bad words'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inappropriate');
    });

    it('should report inappropriate message', async () => {
      // First send a message
      const messageResponse = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Normal message'
        });

      const response = await request(app)
        .post(`/api/chat/messages/${messageResponse.body.data._id}/report`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          reason: 'inappropriate_content',
          description: 'This message contains inappropriate content'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reported');
    });

    it('should block user from sending messages after multiple reports', async () => {
      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        const messageResponse = await request(app)
          .post(`/api/chat/matches/${matchId}/messages`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            type: 'text',
            content: `Message ${i}`
          });

        // Report each message
        await request(app)
          .post(`/api/chat/messages/${messageResponse.body.data._id}/report`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            reason: 'spam',
            description: 'Spam message'
          });
      }

      // Try to send another message
      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Blocked message'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('blocked');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit message sending', async () => {
      // Send messages rapidly
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post(`/api/chat/matches/${matchId}/messages`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send({
              type: 'text',
              content: `Message ${i}`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some responses should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should rate limit WebSocket messages', async () => {
      const ws1 = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': `Bearer ${user1Token}`
        }
      });

      await new Promise((resolve) => {
        ws1.on('open', resolve);
      });

      const errorPromise = new Promise((resolve) => {
        ws1.on('message', (data) => {
          const message = JSON.parse(data);
          if (message.type === 'error' && message.error.includes('rate limit')) {
            resolve(message);
          }
        });
      });

      // Send messages rapidly
      for (let i = 0; i < 15; i++) {
        ws1.send(JSON.stringify({
          type: 'send_message',
          matchId: matchId,
          content: `Message ${i}`,
          messageType: 'text'
        }));
      }

      const errorMessage = await errorPromise;
      expect(errorMessage.error).toContain('rate limit');

      ws1.close();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle message sending efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post(`/api/chat/matches/${matchId}/messages`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Performance test message'
        })
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle message retrieval efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/chat/matches/${matchId}/messages?limit=50`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent WebSocket connections', async () => {
      const connections = [];
      const connectionPromises = [];

      // Create multiple WebSocket connections
      for (let i = 0; i < 10; i++) {
        const ws = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
          headers: {
            'Authorization': `Bearer ${user1Token}`
          }
        });
        
        connections.push(ws);
        connectionPromises.push(
          new Promise((resolve) => {
            ws.on('open', resolve);
          })
        );
      }

      await Promise.all(connectionPromises);

      // All connections should be open
      connections.forEach(ws => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      // Close all connections
      connections.forEach(ws => ws.close());
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid match ID in message sending', async () => {
      const response = await request(app)
        .post('/api/chat/matches/invalid-id/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'text',
          content: 'Hello!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('match');
    });

    it('should handle invalid message ID in status update', async () => {
      const response = await request(app)
        .put('/api/chat/messages/invalid-id/read')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('message');
    });

    it('should handle WebSocket connection timeout', async () => {
      const ws = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT || 8080}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('timeout'), 5000);
      });

      const errorPromise = new Promise((resolve) => {
        ws.on('error', resolve);
      });

      const result = await Promise.race([timeoutPromise, errorPromise]);
      
      if (result === 'timeout') {
        expect(ws.readyState).toBe(WebSocket.CLOSED);
      } else {
        expect(result).toBeDefined();
      }

      ws.close();
    });
  });
});
