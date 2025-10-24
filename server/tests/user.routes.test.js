const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../server');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');

let authToken;
let userId;
let mongoServer;

describe('User Routes API Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create and log in a user
    const user = new User({
        email: 'userroutes@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Routes',
        dateOfBirth: '1990-01-01',
    });
    await user.save();
    userId = user._id;

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'userroutes@example.com', password: 'password123' });
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
    await User.deleteMany({ email: { $ne: 'userroutes@example.com' } });
  });

  describe('GET /api/users/profile', () => {
    it('should fetch the profile of the authenticated user', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user._id).toBe(userId.toString());
      expect(res.body.data.user.email).toBe('userroutes@example.com');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update the profile of the authenticated user', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          bio: 'This is my new bio.',
          preferences: { maxDistance: 100 }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.firstName).toBe('Updated');
      expect(res.body.data.user.bio).toBe('This is my new bio.');
      expect(res.body.data.user.preferences.maxDistance).toBe(100);

      // Verify the update in the database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.firstName).toBe('Updated');
    });

    it('should not allow updating the email or password via the profile route', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ email: 'newemail@example.com', password: 'newpassword' });

        expect(res.statusCode).toEqual(200);
        
        const updatedUser = await User.findById(userId);
        expect(updatedUser.email).not.toBe('newemail@example.com');
    });
  });
});
