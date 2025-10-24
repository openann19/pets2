const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');

let mongoServer;

describe('User Model Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create & save a user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.dateOfBirth).toEqual(userData.dateOfBirth);
  });

  it('should fail to create a user without required fields', async () => {
    const userWithoutRequiredField = new User({ firstName: 'Test' });
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should hash the password before saving', async () => {
    const userData = {
      email: 'test2@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
    };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.password).toBeDefined();
    expect(savedUser.password).not.toBe(userData.password);
  });

  it('should correctly compare a valid password', async () => {
    const userData = {
      email: 'test3@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
    };
    const user = new User(userData);
    await user.save();

    // Need to fetch the user again to get the password field
    const userWithPassword = await User.findOne({ email: userData.email }).select('+password');
    const isMatch = await userWithPassword.comparePassword('password123');
    expect(isMatch).toBe(true);
  });

  it('should return false for an invalid password', async () => {
    const userData = {
      email: 'test4@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
    };
    const user = new User(userData);
    await user.save();

    const userWithPassword = await User.findOne({ email: userData.email }).select('+password');
    const isMatch = await userWithPassword.comparePassword('wrongpassword');
    expect(isMatch).toBe(false);
  });

  it('should calculate the correct age from date of birth', async () => {
    const birthYear = new Date().getFullYear() - 30;
    const userData = {
      email: 'age_test@example.com',
      password: 'password123',
      firstName: 'Age',
      lastName: 'Test',
      dateOfBirth: new Date(`${birthYear}-01-01`),
    };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.age).toBe(30);
  });
});
