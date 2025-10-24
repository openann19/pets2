const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');

let mongoServer;
let testUser;

describe('Pet Model Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a user to be the owner of the pets
    testUser = new User({
        email: 'pet_model_test@example.com',
        password: 'password123',
        firstName: 'Pet',
        lastName: 'Model',
        dateOfBirth: '1990-01-01',
    });
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Pet.deleteMany({});
  });

  it('should create & save a pet successfully', async () => {
    const petData = {
      owner: testUser._id,
      name: 'Charlie',
      species: 'dog',
      breed: 'Beagle',
      age: 4,
      gender: 'male',
      size: 'medium',
      intent: 'playdate',
      location: { coordinates: [-74.0060, 40.7128] }, // NYC
      photos: [{ url: 'http://example.com/charlie.jpg' }]
    };
    const validPet = new Pet(petData);
    const savedPet = await validPet.save();

    expect(savedPet._id).toBeDefined();
    expect(savedPet.name).toBe(petData.name);
    expect(savedPet.owner).toEqual(testUser._id);
    expect(savedPet.photos[0].isPrimary).toBe(true); // Check pre-save hook
  });

  it('should fail to create a pet without required fields', async () => {
    const petWithoutRequiredFields = new Pet({ name: 'Incomplete' });
    let err;
    try {
      await petWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.owner).toBeDefined();
    expect(err.errors.species).toBeDefined();
    expect(err.errors.breed).toBeDefined();
  });

  it('should enforce enum values for fields like species and gender', async () => {
    const invalidPetData = {
        owner: testUser._id,
        name: 'Invalid',
        species: 'lizard', // Not in enum
        breed: 'Gecko',
        age: 1,
        gender: 'unknown', // Not in enum
        size: 'medium',
        intent: 'playdate',
        location: { coordinates: [0, 0] },
    };
    const invalidPet = new Pet(invalidPetData);
    let err;
    try {
        await invalidPet.save();
    } catch (error) {
        err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.species).toBeDefined();
    expect(err.errors.gender).toBeDefined();
  });

  it('should correctly update analytics when instance method is called', async () => {
    const petData = { owner: testUser._id, name: 'Analytics', species: 'cat', breed: 'Tabby', age: 2, gender: 'female', size: 'small', intent: 'adoption', location: { coordinates: [0, 0] } };
    const pet = new Pet(petData);
    await pet.save();

    expect(pet.analytics.views).toBe(0);
    await pet.updateAnalytics('view');
    expect(pet.analytics.views).toBe(1);

    expect(pet.analytics.likes).toBe(0);
    await pet.updateAnalytics('like');
    expect(pet.analytics.likes).toBe(1);
  });
});
