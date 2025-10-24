const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');
const path = require('path');

let authToken;
let userId;
let mongoServer;

describe('Pet Routes API Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a user and log in to get a token
    const user = new User({
        email: 'petowner@example.com',
        password: 'password123',
        firstName: 'Pet',
        lastName: 'Owner',
        dateOfBirth: '1990-01-01',
    });
    await user.save();
    userId = user._id;

    const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'petowner@example.com',
            password: 'password123',
        });
    authToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  afterEach(async () => {
    await Pet.deleteMany({});
    await User.deleteMany({ email: { $ne: 'petowner@example.com' } });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet for the authenticated user', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Buddy')
        .field('species', 'dog')
        .field('breed', 'Golden Retriever')
        .field('age', '3')
        .field('gender', 'male')
        .field('size', 'large')
        .field('intent', 'playdate')
        .attach('photos', path.resolve(__dirname, 'test-image.jpg')); // Mock file

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pet.name).toBe('Buddy');
      expect(res.body.data.pet.owner._id).toBe(userId.toString());
    });
  });

  describe('GET /api/pets/discover', () => {
    beforeEach(async () => {
        // Create some pets to discover
        const otherUser = new User({ email: 'other@example.com', password: 'password123', firstName: 'Other', lastName: 'User', dateOfBirth: '1990-01-01' });
        await otherUser.save();

        const pet1 = new Pet({ owner: otherUser._id, name: 'Lucy', species: 'dog', breed: 'Poodle', age: 2, gender: 'female', size: 'small', intent: 'playdate', location: { type: 'Point', coordinates: [0,0] } });
        const pet2 = new Pet({ owner: otherUser._id, name: 'Max', species: 'cat', breed: 'Siamese', age: 5, gender: 'male', size: 'medium', intent: 'adoption', location: { type: 'Point', coordinates: [0,0] } });
        await pet1.save();
        await pet2.save();
    });

    it('should discover pets that do not belong to the current user', async () => {
      const res = await request(app)
        .get('/api/pets/discover')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pets.length).toBe(2);
      expect(res.body.data.pets[0].owner.toString()).not.toBe(userId.toString());
    });

    it('should filter pets by species', async () => {
        const res = await request(app)
            .get('/api/pets/discover?species=cat')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.pets.length).toBe(1);
        expect(res.body.data.pets[0].name).toBe('Max');
    });
  });
});
