/**
 * Factory for creating User test data with sensible defaults
 * Provides full type safety and easy overrides for testing
 */

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    verified: boolean;
    role: 'user' | 'admin' | 'moderator';
    subscription?: {
        plan: 'free' | 'premium' | 'platinum';
        status: 'active' | 'canceled' | 'expired';
        expiresAt?: string;
    };
    preferences?: {
        maxDistance: number;
        ageRange: { min: number; max: number };
        sizePreference: ('small' | 'medium' | 'large')[];
        breedPreference: string[];
        temperamentPreference: string[];
        notificationsEnabled: boolean;
        emailNotifications: boolean;
        pushNotifications: boolean;
    };
    stats?: {
        totalSwipes: number;
        totalLikes: number;
        totalMatches: number;
        totalSuperLikes: number;
        matchRate: number;
        responseRate: number;
        averageResponseTime: number;
    };
}

/**
 * Creates a User with sensible defaults for testing
 */
export function createUser(overrides: Partial<User> = {}): User {
    const baseUser: User = {
        id: `user-${Math.random().toString(36).substring(2, 11)}`,
        email: `test-${Math.random().toString(36).substring(2, 7)}@example.com`,
        name: `Test User ${Math.random().toString(36).substring(2, 5)}`,
        avatar: `https://example.com/avatar-${Math.random().toString(36).substring(2, 7)}.jpg`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verified: true,
        role: 'user',
        subscription: {
            plan: 'free',
            status: 'active',
        },
        preferences: {
            maxDistance: 50,
            ageRange: { min: 1, max: 10 },
            sizePreference: ['medium'],
            breedPreference: [],
            temperamentPreference: ['friendly', 'playful'],
            notificationsEnabled: true,
            emailNotifications: true,
            pushNotifications: true,
        },
        stats: {
            totalSwipes: 0,
            totalLikes: 0,
            totalMatches: 0,
            totalSuperLikes: 0,
            matchRate: 0,
            responseRate: 0,
            averageResponseTime: 0,
        },
    };

    return { ...baseUser, ...overrides };
}

/**
 * Creates a premium user with enhanced features
 */
export function createPremiumUser(overrides: Partial<User> = {}): User {
    return createUser({
        subscription: {
            plan: 'premium',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
        verified: true,
        stats: {
            totalSwipes: 250,
            totalLikes: 180,
            totalMatches: 45,
            totalSuperLikes: 15,
            matchRate: 0.18,
            responseRate: 0.85,
            averageResponseTime: 3600, // 1 hour in seconds
        },
        ...overrides,
    });
}

/**
 * Creates an admin user for testing admin functionality
 */
export function createAdminUser(overrides: Partial<User> = {}): User {
    return createUser({
        role: 'admin',
        verified: true,
        name: 'Admin User',
        email: 'admin@pawfectmatch.com',
        subscription: {
            plan: 'platinum',
            status: 'active',
        },
        ...overrides,
    });
}

/**
 * Creates a batch of users for testing lists and pagination
 */
export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
        createUser({
            name: `Test User ${(index + 1).toString()}`,
            email: `test-user-${(index + 1).toString()}@example.com`,
            ...overrides,
        })
    );
}

/**
 * Creates a user with specific preferences for matching tests
 */
export function createUserWithPreferences(preferences: Partial<User['preferences']>, overrides: Partial<User> = {}): User {
    return createUser({
        preferences: {
            maxDistance: 50,
            ageRange: { min: 1, max: 10 },
            sizePreference: ['medium'],
            breedPreference: [],
            temperamentPreference: ['friendly', 'playful'],
            notificationsEnabled: true,
            emailNotifications: true,
            pushNotifications: true,
            ...preferences,
        },
        ...overrides,
    });
}