// Dummy test to prevent empty test suite error
describe('test-helpers', () => {
    it('should be defined', () => {
        expect(true).toBe(true);
    });
});
/**
 * Test Helpers and Utilities
 */
import {} from '@testing-library/react';
// Mock data creation utilities
export const _createMockPet = (overrides = {}) => ({
    _id: 'mock-pet-id',
    name: 'Buddy',
    owner: 'mock-user-id',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    weight: 70,
    description: 'Friendly and energetic dog',
    temperament: ['friendly', 'energetic', 'playful'],
    energy: 'high',
    training: 'intermediate',
    goodWithKids: true,
    goodWithPets: true,
    houseTrained: true,
    photos: ['https://example.com/photo1.jpg'],
    location: {
        latitude: 37.7749,
        longitude: -122.4194,
    },
    ...overrides,
});
export const _createMockUser = (overrides = {}) => ({
    _id: 'mock-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatar: 'https://example.com/avatar.jpg',
    premium: {
        isActive: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
    },
    preferences: {
        maxDistance: 25,
        ageRange: { min: 0, max: 15 },
        sizePreference: ['small', 'medium', 'large'],
        breedPreference: [],
        temperamentPreference: [],
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
    },
    ...overrides,
});
export const _createMockMatch = (overrides = {}) => ({
    _id: 'mock-match-id',
    petId1: 'mock-pet-id-1',
    petId2: 'mock-pet-id-2',
    petName1: 'Buddy',
    petName2: 'Max',
    petPhoto1: 'https://example.com/buddy.jpg',
    petPhoto2: 'https://example.com/max.jpg',
    owner1: 'mock-user-id-1',
    owner2: 'mock-user-id-2',
    ownerName1: 'John Doe',
    ownerName2: 'Jane Smith',
    matchedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true,
    isArchived: false,
    lastMessage: {
        content: 'Hello there!',
        senderId: 'mock-user-id-1',
        timestamp: new Date().toISOString(),
    },
    unreadCount: 0,
    ...overrides,
});
export const _createMockMessage = (overrides = {}) => ({
    _id: 'mock-message-id',
    matchId: 'mock-match-id',
    senderId: 'mock-user-id-1',
    content: 'Hello there!',
    timestamp: new Date().toISOString(),
    isRead: false,
    attachments: [],
    ...overrides,
});
export const _createMockSubscription = (overrides = {}) => ({
    _id: 'mock-subscription-id',
    userId: 'mock-user-id',
    isActive: true,
    plan: {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        interval: 'monthly',
        features: ['Unlimited swipes', 'See who liked you'],
        stripePriceId: 'price_premium_monthly',
    },
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    ...overrides,
});
// Test wrapper providers
export const AllProvidersWrapper = () => {
    // Use context providers as needed for tests
    return children;
};
export const _customRender = (ui, options = {}) => render(ui, { wrapper: AllProvidersWrapper, ...options });
//# sourceMappingURL=test-helpers.js.map