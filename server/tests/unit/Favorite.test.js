/**
 * Unit Tests - Favorite Model
 * 
 * Tests Mongoose model methods, validation, indexes, and instance methods.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Favorite = require('../../src/models/Favorite');
const Pet = require('../../src/models/Pet');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await Favorite.deleteMany({});
    await Pet.deleteMany({});
    await User.deleteMany({});
});

describe('Favorite Model', () => {
    let testUser;
    let testPet;

    beforeEach(async () => {
        // Create test user
        testUser = await User.create({
            email: 'test@example.com',
            password: 'hashedpassword123',
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: new Date('1990-01-01'),
            role: 'user',
        });

        // Create test pet (align with current schema requirements)
        testPet = await Pet.create({
            owner: testUser._id,
            name: 'Buddy',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            gender: 'male',
            size: 'medium',
            description: 'Friendly dog',
            photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
            intent: 'adoption',
            location: { type: 'Point', coordinates: [0, 0] },
            status: 'active',
        });
    });

    describe('Model Validation', () => {
        it('should create favorite with valid userId and petId', async () => {
            const favorite = await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            expect(favorite._id).toBeDefined();
            expect(favorite.userId.toString()).toBe(testUser._id.toString());
            expect(favorite.petId.toString()).toBe(testPet._id.toString());
            expect(favorite.createdAt).toBeInstanceOf(Date);
        });

        it('should require userId field', async () => {
            const favoriteWithoutUser = new Favorite({
                petId: testPet._id,
            });

            await expect(favoriteWithoutUser.save()).rejects.toThrow();
        });

        it('should require petId field', async () => {
            const favoriteWithoutPet = new Favorite({
                userId: testUser._id,
            });

            await expect(favoriteWithoutPet.save()).rejects.toThrow();
        });
    });

    describe('Unique Index', () => {
        it('should prevent duplicate favorites (same user + pet)', async () => {
            // Create first favorite
            await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            // Attempt to create duplicate
            await expect(
                Favorite.create({
                    userId: testUser._id,
                    petId: testPet._id,
                })
            ).rejects.toThrow(/duplicate key/);
        });

        it('should allow same user to favorite different pets', async () => {
            const pet2 = await Pet.create({
                owner: testUser._id,
                name: 'Max',
                species: 'cat',
                breed: 'Siamese',
                age: 2,
                gender: 'male',
                size: 'small',
                description: 'Playful cat',
                photos: [{ url: 'https://example.com/photo2.jpg', isPrimary: true }],
                intent: 'adoption',
                location: { type: 'Point', coordinates: [0, 0] },
                status: 'active',
            });

            const favorite1 = await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const favorite2 = await Favorite.create({
                userId: testUser._id,
                petId: pet2._id,
            });

            expect(favorite1._id).toBeDefined();
            expect(favorite2._id).toBeDefined();
            expect(favorite1._id.toString()).not.toBe(favorite2._id.toString());
        });

        it('should allow different users to favorite same pet', async () => {
            const user2 = await User.create({
                email: 'user2@example.com',
                password: 'hashedpassword456',
                firstName: 'User',
                lastName: 'Two',
                dateOfBirth: new Date('1992-02-02'),
                role: 'user',
            });

            const favorite1 = await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const favorite2 = await Favorite.create({
                userId: user2._id,
                petId: testPet._id,
            });

            expect(favorite1._id).toBeDefined();
            expect(favorite2._id).toBeDefined();
        });
    });

    describe('Static Methods', () => {
        it('getUserFavorites should return paginated favorites with pet data', async () => {
            // Create multiple favorites
            const pets = await Pet.insertMany([
                {
                    owner: testUser._id,
                    name: 'Dog1',
                    species: 'dog',
                    breed: 'Labrador',
                    age: 2,
                    gender: 'male',
                    size: 'medium',
                    description: 'Test dog 1',
                    photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
                {
                    owner: testUser._id,
                    name: 'Dog2',
                    species: 'dog',
                    breed: 'Beagle',
                    age: 3,
                    gender: 'female',
                    size: 'small',
                    description: 'Test dog 2',
                    photos: [{ url: 'https://example.com/photo2.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
            ]);

            await Favorite.insertMany([
                { userId: testUser._id, petId: pets[0]._id },
                { userId: testUser._id, petId: pets[1]._id },
            ]);

            const result = await Favorite.getUserFavorites(testUser._id, 1, 10);

            expect(result.favorites).toHaveLength(2);
            expect(result.totalFavorites).toBe(2);
            expect(result.totalPages).toBe(1);
            expect(result.currentPage).toBe(1);
            expect(result.favorites[0].petId.name).toBe('Dog2'); // Most recent first
            expect(result.favorites[1].petId.name).toBe('Dog1');
        });

        it('getUserFavorites should handle pagination correctly', async () => {
            // Create 15 favorites
            const pets = [];
            for (let i = 0; i < 15; i++) {
                const pet = await Pet.create({
                    owner: testUser._id,
                    name: `Pet${i}`,
                    species: 'dog',
                    breed: 'Mixed',
                    age: 2,
                    gender: 'male',
                    size: 'medium',
                    description: `Test pet ${i}`,
                    photos: [{ url: 'https://example.com/photo.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                });
                pets.push(pet);
                await Favorite.create({ userId: testUser._id, petId: pet._id });
            }

            // Get page 1 (limit 10)
            const page1 = await Favorite.getUserFavorites(testUser._id, 1, 10);
            expect(page1.favorites).toHaveLength(10);
            expect(page1.totalFavorites).toBe(15);
            expect(page1.totalPages).toBe(2);
            expect(page1.hasNextPage).toBe(true);

            // Get page 2 (remaining 5)
            const page2 = await Favorite.getUserFavorites(testUser._id, 2, 10);
            expect(page2.favorites).toHaveLength(5);
            expect(page2.totalFavorites).toBe(15);
            expect(page2.hasNextPage).toBe(false);
        });

        it('isFavorited should return true if pet is favorited', async () => {
            await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const isFav = await Favorite.isFavorited(testUser._id, testPet._id);
            expect(isFav).toBe(true);
        });

        it('isFavorited should return false if pet is not favorited', async () => {
            const isFav = await Favorite.isFavorited(testUser._id, testPet._id);
            expect(isFav).toBe(false);
        });

        it('getPetFavoriteCount should return correct count', async () => {
            const users = await User.insertMany([
                {
                    email: 'user1@example.com',
                    password: 'password1',
                    firstName: 'User',
                    lastName: 'One',
                    dateOfBirth: new Date('1991-01-01'),
                    role: 'user',
                },
                {
                    email: 'user2@example.com',
                    password: 'password2',
                    firstName: 'User',
                    lastName: 'Two',
                    dateOfBirth: new Date('1992-02-02'),
                    role: 'user',
                },
                {
                    email: 'user3@example.com',
                    password: 'password3',
                    firstName: 'User',
                    lastName: 'Three',
                    dateOfBirth: new Date('1993-03-03'),
                    role: 'user',
                },
            ]);

            // Three users favorite the same pet
            await Favorite.insertMany([
                { userId: users[0]._id, petId: testPet._id },
                { userId: users[1]._id, petId: testPet._id },
                { userId: users[2]._id, petId: testPet._id },
            ]);

            const count = await Favorite.getPetFavoriteCount(testPet._id);
            expect(count).toBe(3);
        });

        it('getUserFavoriteCount should return correct count', async () => {
            const pets = await Pet.insertMany([
                {
                    owner: testUser._id,
                    name: 'Pet1',
                    species: 'dog',
                    breed: 'Mixed',
                    age: 2,
                    gender: 'male',
                    size: 'medium',
                    description: 'Pet 1',
                    photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
                {
                    owner: testUser._id,
                    name: 'Pet2',
                    species: 'cat',
                    breed: 'Mixed',
                    age: 3,
                    gender: 'female',
                    size: 'small',
                    description: 'Pet 2',
                    photos: [{ url: 'https://example.com/photo2.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
            ]);

            await Favorite.insertMany([
                { userId: testUser._id, petId: pets[0]._id },
                { userId: testUser._id, petId: pets[1]._id },
            ]);

            const count = await Favorite.getUserFavoriteCount(testUser._id);
            expect(count).toBe(2);
        });
    });

    describe('Population', () => {
        it('should populate petId with full pet data', async () => {
            const favorite = await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const populated = await Favorite.findById(favorite._id).populate('petId');

            expect(populated.petId.name).toBe('Buddy');
            expect(populated.petId.species).toBe('dog');
            expect(populated.petId.breed).toBe('Golden Retriever');
        });

        it('should populate userId with user data', async () => {
            const favorite = await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const populated = await Favorite.findById(favorite._id).populate('userId');

            expect(populated.userId.email).toBe('test@example.com');
        });
    });

    describe('Deletion', () => {
        it('should delete favorite by userId and petId', async () => {
            await Favorite.create({
                userId: testUser._id,
                petId: testPet._id,
            });

            const result = await Favorite.deleteOne({
                userId: testUser._id,
                petId: testPet._id,
            });

            expect(result.deletedCount).toBe(1);

            const remaining = await Favorite.find({ userId: testUser._id });
            expect(remaining).toHaveLength(0);
        });

        it('should delete all user favorites', async () => {
            const pets = await Pet.insertMany([
                {
                    owner: testUser._id,
                    name: 'Pet1',
                    species: 'dog',
                    breed: 'Mixed',
                    age: 2,
                    gender: 'male',
                    size: 'medium',
                    description: 'Pet 1',
                    photos: [{ url: 'https://example.com/photo1.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
                {
                    owner: testUser._id,
                    name: 'Pet2',
                    species: 'cat',
                    breed: 'Mixed',
                    age: 3,
                    gender: 'female',
                    size: 'small',
                    description: 'Pet 2',
                    photos: [{ url: 'https://example.com/photo2.jpg', isPrimary: true }],
                    intent: 'adoption',
                    location: { type: 'Point', coordinates: [0, 0] },
                    status: 'active',
                },
            ]);

            await Favorite.insertMany([
                { userId: testUser._id, petId: pets[0]._id },
                { userId: testUser._id, petId: pets[1]._id },
            ]);

            const result = await Favorite.deleteMany({ userId: testUser._id });
            expect(result.deletedCount).toBe(2);

            const remaining = await Favorite.find({ userId: testUser._id });
            expect(remaining).toHaveLength(0);
        });
    });
});
