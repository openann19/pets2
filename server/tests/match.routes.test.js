const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');
const Match = require('../src/models/Match');

let user1, user2, pet1, pet2, match;
let token1;
let mongoServer;

describe('Match Routes API Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create users and pets
    user1 = new User({ email: 'matchuser1@example.com', password: 'password', firstName: 'Match', lastName: 'One', dateOfBirth: '1990-01-01' });
    user2 = new User({ email: 'matchuser2@example.com', password: 'password', firstName: 'Match', lastName: 'Two', dateOfBirth: '1990-01-01' });
    await user1.save();
    await user2.save();

    pet1 = new Pet({ owner: user1._id, name: 'MatchPet1', species: 'dog', breed: 'Corgi', age: 3, gender: 'male', size: 'small', intent: 'playdate', location: { coordinates: [0,0] } });
    pet2 = new Pet({ owner: user2._id, name: 'MatchPet2', species: 'dog', breed: 'Dachshund', age: 2, gender: 'female', size: 'small', intent: 'playdate', location: { coordinates: [0,0] } });
    await pet1.save();
    await pet2.save();

    // Log in user1 to get a token
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'matchuser1@example.com', password: 'password' });
    token1 = res.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  beforeEach(async () => {
    // Create a match before each test
    match = new Match({ pet1: pet1._id, pet2: pet2._id, user1: user1._id, user2: user2._id, matchType: 'playdate' });
    await match.save();
  });

  afterEach(async () => {
    await Match.deleteMany({});
  });

  describe('GET /api/matches', () => {
    it('should fetch all active matches for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matches.length).toBe(1);
      expect(res.body.data.matches[0]._id).toBe(match._id.toString());
    });
  });

  describe('POST /api/matches/:matchId/messages', () => {
    it('should send a message to a match', async () => {
      const res = await request(app)
        .post(`/api/matches/${match._id}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ content: 'Hello from the test!' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message.content).toBe('Hello from the test!');

      // Verify the message was saved
      const updatedMatch = await Match.findById(match._id);
      expect(updatedMatch.messages.length).toBe(1);
    });
  });

  describe('PATCH /api/matches/:matchId/archive', () => {
    it('should archive a match for the current user', async () => {
        const res = await request(app)
            .patch(`/api/matches/${match._id}/archive`)
            .set('Authorization', `Bearer ${token1}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.isArchived).toBe(true);

        // Verify the user can no longer see the match in the active list
        const activeMatchesRes = await request(app)
            .get('/api/matches')
            .set('Authorization', `Bearer ${token1}`);
        expect(activeMatchesRes.body.data.matches.length).toBe(0);
    });
  });
});
