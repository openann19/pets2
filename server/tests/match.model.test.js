const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Pet = require('../src/models/Pet');
const Match = require('../src/models/Match');

let mongoServer;
let user1, user2, pet1, pet2;

describe('Match Model Test', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create users and pets for testing
    user1 = new User({ email: 'user1@example.com', password: 'password', firstName: 'User', lastName: 'One', dateOfBirth: '1990-01-01' });
    user2 = new User({ email: 'user2@example.com', password: 'password', firstName: 'User', lastName: 'Two', dateOfBirth: '1990-01-01' });
    await user1.save();
    await user2.save();

    pet1 = new Pet({ owner: user1._id, name: 'PetOne', species: 'dog', breed: 'Labrador', age: 3, gender: 'male', size: 'large', intent: 'playdate', location: { coordinates: [0,0] } });
    pet2 = new Pet({ owner: user2._id, name: 'PetTwo', species: 'dog', breed: 'Poodle', age: 2, gender: 'female', size: 'small', intent: 'playdate', location: { coordinates: [0,0] } });
    await pet1.save();
    await pet2.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Match.deleteMany({});
  });

  it('should create & save a match successfully', async () => {
    const matchData = {
      pet1: pet1._id,
      pet2: pet2._id,
      user1: user1._id,
      user2: user2._id,
      matchType: 'playdate',
    };
    const validMatch = new Match(matchData);
    const savedMatch = await validMatch.save();

    expect(savedMatch._id).toBeDefined();
    expect(savedMatch.pet1).toEqual(pet1._id);
    expect(savedMatch.user2).toEqual(user2._id);
    expect(savedMatch.status).toBe('active');
  });

  it('should add a message to a match', async () => {
    const match = new Match({ pet1: pet1._id, pet2: pet2._id, user1: user1._id, user2: user2._id, matchType: 'playdate' });
    await match.save();

    await match.addMessage(user1._id, 'Hello there!');
    const updatedMatch = await Match.findById(match._id);

    expect(updatedMatch.messages.length).toBe(1);
    expect(updatedMatch.messages[0].content).toBe('Hello there!');
    expect(updatedMatch.messages[0].sender).toEqual(user1._id);
    expect(updatedMatch.lastMessageAt).toBeDefined();
  });

  it('should mark messages as read', async () => {
    const match = new Match({ pet1: pet1._id, pet2: pet2._id, user1: user1._id, user2: user2._id, matchType: 'playdate' });
    await match.addMessage(user1._id, 'This is a test message.');
    
    // User2 reads the message
    await match.markMessagesAsRead(user2._id);
    const updatedMatch = await Match.findById(match._id);

    expect(updatedMatch.messages[0].readBy.length).toBe(1);
    expect(updatedMatch.messages[0].readBy[0].user).toEqual(user2._id);
  });

  it('should toggle archive status for a user', async () => {
    const match = new Match({ pet1: pet1._id, pet2: pet2._id, user1: user1._id, user2: user2._id, matchType: 'playdate' });
    await match.save();

    expect(match.userActions.user1.isArchived).toBe(false);
    await match.toggleArchive(user1._id);
    const updatedMatch = await Match.findById(match._id);
    expect(updatedMatch.userActions.user1.isArchived).toBe(true);
  });
});
