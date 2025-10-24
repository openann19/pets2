const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../server');
const User = require('../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

describe('Auth Routes API Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (httpServer.listening) {
      httpServer.close();
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'register@example.com',
          password: 'password123',
          firstName: 'Register',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('register@example.com');
    });

    it('should fail if user already exists', async () => {
        // First, create a user
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'duplicate@example.com',
                password: 'password123',
                firstName: 'Duplicate',
                lastName: 'User',
                dateOfBirth: '1990-01-01',
            });

        // Then, try to create the same user again
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'duplicate@example.com',
                password: 'password123',
                firstName: 'Duplicate',
                lastName: 'User',
                dateOfBirth: '1990-01-01',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        // Create a user to log in with
        const user = new User({
            email: 'login@example.com',
            password: 'password123',
            firstName: 'Login',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
        });
        await user.save();
    });

    it('should log in an existing user and return tokens', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nouser@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
