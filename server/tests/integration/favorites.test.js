/**
 * Integration Tests - Favorites API
 * 
 * Tests all favorites API endpoints with authentication, authorization, and error cases.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../server');
const Favorite = require('../../src/models/Favorite');
const Pet = require('../../src/models/Pet');
const User = require('../../src/models/User');
const { generateTokens } = require('../../src/middleware/auth');

let mongoServer;
let authToken;
let testUser;
let testPet;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Create test user (include required fields per User schema)
    testUser = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        isEmailVerified: true,
        role: 'user',
    });

    authToken = generateTokens(testUser._id).accessToken;

    // Create test pet (include required fields per Pet schema)
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

afterEach(async () => {
    await Favorite.deleteMany({});
    await Pet.deleteMany({});
    await User.deleteMany({});
});

describe('POST /api/favorites', () => {
    it('should add pet to favorites', async () => {
        const response = await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petId: testPet._id.toString() })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Pet added to favorites');

        // Verify in database
        const favorite = await Favorite.findOne({
            userId: testUser._id,
            petId: testPet._id,
        });
        expect(favorite).toBeDefined();
    });

    it('should return 409 for duplicate favorite', async () => {
        // Add favorite first time
        await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petId: testPet._id.toString() })
            .expect(201);

        // Try to add again
        const response = await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petId: testPet._id.toString() })
            .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already favorited');
    });

    it('should return 400 for invalid petId', async () => {
        const response = await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petId: 'invalid-id' })
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent pet', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petId: fakeId.toString() })
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Pet not found');
    });

    it('should return 401 without authentication', async () => {
        await request(app)
            .post('/api/favorites')
            .send({ petId: testPet._id.toString() })
            .expect(401);
    });

    it('should return 400 without petId', async () => {
        const response = await request(app)
            .post('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('petId is required');
    });
});

describe('DELETE /api/favorites/:petId', () => {
    beforeEach(async () => {
        // Create favorite for testing deletion
        await Favorite.create({
            userId: testUser._id,
            petId: testPet._id,
        });
    });

    it('should remove pet from favorites', async () => {
        const response = await request(app)
            .delete(`/api/favorites/${testPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Pet removed from favorites');

        // Verify deletion
        const favorite = await Favorite.findOne({
            userId: testUser._id,
            petId: testPet._id,
        });
        expect(favorite).toBeNull();
    });

    it('should return 404 if favorite does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/favorites/${fakeId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not found in favorites');
    });

    it('should return 400 for invalid petId', async () => {
        const response = await request(app)
            .delete('/api/favorites/invalid-id')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
        await request(app)
            .delete(`/api/favorites/${testPet._id}`)
            .expect(401);
    });

    it('should not allow user to delete another user\'s favorite', async () => {
        // Ensure the authenticated user does NOT have a favorite for this pet
        await Favorite.deleteMany({ userId: testUser._id, petId: testPet._id });

        // Create another user
        const user2 = await User.create({
            email: 'user2@example.com',
            password: 'password123',
            firstName: 'User',
            lastName: 'Two',
            dateOfBirth: new Date('1992-02-02'),
            isEmailVerified: true,
            role: 'user',
        });

        // Create favorite for user2
        await Favorite.create({
            userId: user2._id,
            petId: testPet._id,
        });

        // Try to delete using testUser's token
        await request(app)
            .delete(`/api/favorites/${testPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);

        // Verify user2's favorite still exists
        const favorite = await Favorite.findOne({
            userId: user2._id,
            petId: testPet._id,
        });
        expect(favorite).toBeDefined();
    });
});

describe('GET /api/favorites', () => {
    beforeEach(async () => {
        // Create multiple pets and favorites
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
            {
                owner: testUser._id,
                name: 'Cat1',
                species: 'cat',
                breed: 'Siamese',
                age: 1,
                gender: 'female',
                size: 'small',
                description: 'Test cat 1',
                photos: [{ url: 'https://example.com/photo3.jpg', isPrimary: true }],
                intent: 'adoption',
                location: { type: 'Point', coordinates: [0, 0] },
                status: 'active',
            },
        ]);

        await Favorite.insertMany([
            { userId: testUser._id, petId: pets[0]._id },
            { userId: testUser._id, petId: pets[1]._id },
            { userId: testUser._id, petId: pets[2]._id },
        ]);
    });

    it('should return paginated user favorites', async () => {
        const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.favorites).toHaveLength(3);
        expect(response.body.totalFavorites).toBe(3);
        expect(response.body.totalPages).toBe(1);
        expect(response.body.currentPage).toBe(1);
    });

    it('should handle pagination correctly', async () => {
        // Get page 1 with limit 2
        const page1 = await request(app)
            .get('/api/favorites?page=1&limit=2')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(page1.body.favorites).toHaveLength(2);
        expect(page1.body.totalFavorites).toBe(3);
        expect(page1.body.totalPages).toBe(2);
        expect(page1.body.hasNextPage).toBe(true);

        // Get page 2
        const page2 = await request(app)
            .get('/api/favorites?page=2&limit=2')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(page2.body.favorites).toHaveLength(1);
        expect(page2.body.hasNextPage).toBe(false);
    });

    it('should return empty array for user with no favorites', async () => {
        // Delete all favorites
        await Favorite.deleteMany({ userId: testUser._id });

        const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.favorites).toHaveLength(0);
        expect(response.body.totalFavorites).toBe(0);
    });

    it('should populate pet data in favorites', async () => {
        const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        const favorite = response.body.favorites[0];
        expect(favorite.petId).toBeDefined();
        expect(favorite.petId.name).toBeDefined();
        expect(favorite.petId.species).toBeDefined();
        expect(favorite.petId.breed).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
        await request(app)
            .get('/api/favorites')
            .expect(401);
    });

    it('should only return authenticated user\'s favorites', async () => {
        // Create another user with different favorites
        const user2 = await User.create({
            email: 'user2@example.com',
            password: 'password123',
            firstName: 'User',
            lastName: 'Two',
            dateOfBirth: new Date('1992-02-02'),
            isEmailVerified: true,
            role: 'user',
        });

        const pet2 = await Pet.create({
            owner: user2._id,
            name: 'OtherPet',
            species: 'cat',
            breed: 'Persian',
            age: 2,
            gender: 'male',
            size: 'small',
            description: 'Other user pet',
            photos: [{ url: 'https://example.com/photo.jpg', isPrimary: true }],
            intent: 'adoption',
            location: { type: 'Point', coordinates: [0, 0] },
            status: 'active',
        });

        await Favorite.create({
            userId: user2._id,
            petId: pet2._id,
        });

        // Request with testUser's token
        const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        // Should only return testUser's 3 favorites, not user2's
        expect(response.body.totalFavorites).toBe(3);
        const petNames = response.body.favorites.map((fav) => fav.petId.name);
        expect(petNames).not.toContain('OtherPet');
    });
});

describe('GET /api/favorites/check/:petId', () => {
    it('should return true if pet is favorited', async () => {
        await Favorite.create({
            userId: testUser._id,
            petId: testPet._id,
        });

        const response = await request(app)
            .get(`/api/favorites/check/${testPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.isFavorited).toBe(true);
    });

    it('should return false if pet is not favorited', async () => {
        const response = await request(app)
            .get(`/api/favorites/check/${testPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.isFavorited).toBe(false);
    });

    it('should return 400 for invalid petId', async () => {
        const response = await request(app)
            .get('/api/favorites/check/invalid-id')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
        await request(app)
            .get(`/api/favorites/check/${testPet._id}`)
            .expect(401);
    });
});

describe('GET /api/favorites/count/:petId', () => {
    it('should return favorite count for pet', async () => {
        // Create multiple users favoriting the same pet
        const users = await User.insertMany([
            {
                email: 'user1@example.com',
                password: 'password123',
                firstName: 'User',
                lastName: 'One',
                dateOfBirth: new Date('1991-01-01'),
                isEmailVerified: true,
                role: 'user',
            },
            {
                email: 'user2@example.com',
                password: 'password123',
                firstName: 'User',
                lastName: 'Two',
                dateOfBirth: new Date('1992-02-02'),
                isEmailVerified: true,
                role: 'user',
            },
        ]);

        await Favorite.insertMany([
            { userId: testUser._id, petId: testPet._id },
            { userId: users[0]._id, petId: testPet._id },
            { userId: users[1]._id, petId: testPet._id },
        ]);

        const response = await request(app)
            .get(`/api/favorites/count/${testPet._id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(3);
    });

    it('should return 0 for pet with no favorites', async () => {
        const response = await request(app)
            .get(`/api/favorites/count/${testPet._id}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(0);
    });

    it('should return 400 for invalid petId', async () => {
        const response = await request(app)
            .get('/api/favorites/count/invalid-id')
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should not require authentication (public endpoint)', async () => {
        await Favorite.create({
            userId: testUser._id,
            petId: testPet._id,
        });

        const response = await request(app)
            .get(`/api/favorites/count/${testPet._id}`)
            .expect(200);

        expect(response.body.count).toBe(1);
    });
});

describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
        // Close mongoose connection to simulate database error
        await mongoose.disconnect();

        const response = await request(app)
            .get('/api/favorites')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(500);

        expect(response.body.success).toBe(false);

        // Reconnect for other tests
        await mongoose.connect(mongoServer.getUri());
    });

    it('should validate query parameters', async () => {
        const response = await request(app)
            .get('/api/favorites?page=invalid&limit=abc')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    it('should handle malformed authorization token', async () => {
        await request(app)
            .get('/api/favorites')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });
});
