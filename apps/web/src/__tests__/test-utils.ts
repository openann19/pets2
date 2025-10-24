// Dummy test to prevent empty test suite error
describe('test-utils', () => {
    it('should be defined', () => {
        expect(true).toBe(true);
    });
});
/**
 * Test Utilities & Mock Factories
 * Provides type-safe mock data for testing
 */
import {} from '@pawfectmatch/core';
/**
 * Creates a mock User with all required fields
 */
export function createMockUser(overrides) {
    const now = new Date().toISOString();
    return {
        _id: 'user-123',
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        age: 33,
        location: {
            type: 'Point',
            coordinates: [0, 0],
        },
        preferences: {
            maxDistance: 50,
            ageRange: { min: 18, max: 100 },
            species: [],
            intents: [],
            notifications: {
                email: true,
                push: true,
                matches: true,
                messages: true,
            },
        },
        premium: {
            isActive: false,
            plan: 'basic',
            features: {
                unlimitedLikes: false,
                boostProfile: false,
                seeWhoLiked: false,
                advancedFilters: false,
            },
        },
        pets: [],
        analytics: {
            totalSwipes: 0,
            totalLikes: 0,
            totalMatches: 0,
            profileViews: 0,
            lastActive: now,
        },
        isEmailVerified: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}
/**
 * Creates a mock Pet with all required fields
 */
export function createMockPet(overrides) {
    const now = new Date().toISOString();
    return {
        _id: 'pet-123',
        owner: 'user-123',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        photos: [
            {
                url: 'https://example.com/photo.jpg',
                isPrimary: true,
            },
        ],
        personalityTags: ['friendly', 'energetic'],
        intent: 'playdate',
        availability: {
            isAvailable: true,
        },
        healthInfo: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: true,
        },
        location: {
            type: 'Point',
            coordinates: [0, 0],
        },
        featured: {
            isFeatured: false,
            boostCount: 0,
        },
        analytics: {
            views: 0,
            likes: 0,
            matches: 0,
            messages: 0,
        },
        isActive: true,
        isVerified: false,
        status: 'active',
        listedAt: now,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}
/**
 * Creates a mock Match with all required fields
 */
export function createMockMatch(overrides) {
    const now = new Date().toISOString();
    const user1 = createMockUser({ _id: 'user-1', id: 'user-1' });
    const user2 = createMockUser({ _id: 'user-2', id: 'user-2' });
    const pet1 = createMockPet({ _id: 'pet-1', owner: user1 });
    const pet2 = createMockPet({ _id: 'pet-2', owner: user2 });
    return {
        _id: 'match-123',
        pet1,
        pet2,
        user1,
        user2,
        matchType: 'playdate',
        compatibilityScore: 85,
        status: 'active',
        messages: [],
        createdAt: now,
        lastMessageAt: now,
        ...overrides,
    };
}
/**
 * Creates multiple mock users
 */
export function createMockUsers(count, overrides) {
    return Array.from({ length: count }, (_, i) => createMockUser({
        _id: `user-${i}`,
        id: `user-${i}`,
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        ...overrides,
    }));
}
/**
 * Creates multiple mock pets
 */
export function createMockPets(count, overrides) {
    return Array.from({ length: count }, (_, i) => createMockPet({
        _id: `pet-${i}`,
        name: `Pet${i}`,
        ...overrides,
    }));
}
//# sourceMappingURL=test-utils.js.map