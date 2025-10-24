/**
 * Factory for creating Match test data with sensible defaults
 * Provides full type safety and easy overrides for testing
 */

interface Match {
    id: string;
    users: {
        user1: {
            id: string;
            name: string;
            avatar?: string;
        };
        user2: {
            id: string;
            name: string;
            avatar?: string;
        };
    };
    pets: {
        pet1: {
            id: string;
            name: string;
            photos: string[];
            species: string;
            breed: string;
        };
        pet2: {
            id: string;
            name: string;
            photos: string[];
            species: string;
            breed: string;
        };
    };
    compatibility: {
        score: number;
        factors: {
            size: number;
            temperament: number;
            energy: number;
            age: number;
            location: number;
        };
        reasons: string[];
    };
    status: 'pending' | 'active' | 'ended' | 'blocked';
    createdAt: string;
    lastActivity?: string;
    messages: {
        count: number;
        lastMessage?: {
            id: string;
            senderId: string;
            content: string;
            timestamp: string;
            read: boolean;
        };
    };
    meetup?: {
        proposed: boolean;
        status: 'proposed' | 'accepted' | 'declined' | 'completed';
        date?: string;
        location?: string;
    };
}

/**
 * Creates a Match with sensible defaults for testing
 */
export function createMatch(overrides: Partial<Match> = {}): Match {
    const baseMatch: Match = {
        id: `match-${Math.random().toString(36).substring(2, 11)}`,
        users: {
            user1: {
                id: `user-${Math.random().toString(36).substring(2, 11)}`,
                name: `User ${Math.random().toString(36).substring(2, 5)}`,
                avatar: `https://example.com/avatar-1-${Math.random().toString(36).substring(2, 7)}.jpg`,
            },
            user2: {
                id: `user-${Math.random().toString(36).substring(2, 11)}`,
                name: `User ${Math.random().toString(36).substring(2, 5)}`,
                avatar: `https://example.com/avatar-2-${Math.random().toString(36).substring(2, 7)}.jpg`,
            },
        },
        pets: {
            pet1: {
                id: `pet-${Math.random().toString(36).substring(2, 11)}`,
                name: `Pet ${Math.random().toString(36).substring(2, 5)}`,
                photos: [`https://example.com/pet-1-${Math.random().toString(36).substring(2, 7)}.jpg`],
                species: 'dog',
                breed: 'Golden Retriever',
            },
            pet2: {
                id: `pet-${Math.random().toString(36).substring(2, 11)}`,
                name: `Pet ${Math.random().toString(36).substring(2, 5)}`,
                photos: [`https://example.com/pet-2-${Math.random().toString(36).substring(2, 7)}.jpg`],
                species: 'dog',
                breed: 'Labrador',
            },
        },
        compatibility: {
            score: Math.floor(Math.random() * 40) + 60, // 60-100 for good matches
            factors: {
                size: Math.random(),
                temperament: Math.random(),
                energy: Math.random(),
                age: Math.random(),
                location: Math.random(),
            },
            reasons: [
                'Similar energy levels',
                'Good size compatibility',
                'Both are friendly and social',
            ],
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messages: {
            count: Math.floor(Math.random() * 20),
            lastMessage: {
                id: `msg-${Math.random().toString(36).substring(2, 11)}`,
                senderId: `user-${Math.random().toString(36).substring(2, 11)}`,
                content: 'Hey! Our pets look like they would get along great!',
                timestamp: new Date().toISOString(),
                read: Math.random() > 0.5,
            },
        },
    };

    return { ...baseMatch, ...overrides };
}

/**
 * Creates a fresh match with no messages yet
 */
export function createNewMatch(overrides: Partial<Match> = {}): Match {
    const newMatch = createMatch({
        status: 'pending',
        messages: {
            count: 0,
        },
        ...overrides,
    });

    // Remove lastActivity for new matches
    delete newMatch.lastActivity;
    return newMatch;
}

/**
 * Creates an active match with recent conversation
 */
export function createActiveMatch(overrides: Partial<Match> = {}): Match {
    return createMatch({
        status: 'active',
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Within last 24 hours
        messages: {
            count: Math.floor(Math.random() * 50) + 5, // 5-55 messages
            lastMessage: {
                id: `msg-${Math.random().toString(36).substring(2, 11)}`,
                senderId: `user-${Math.random().toString(36).substring(2, 11)}`,
                content: 'Would you like to set up a playdate this weekend?',
                timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(), // Within last 6 hours
                read: false,
            },
        },
        ...overrides,
    });
}

/**
 * Creates a match with a proposed meetup
 */
export function createMatchWithMeetup(overrides: Partial<Match> = {}): Match {
    return createMatch({
        status: 'active',
        meetup: {
            proposed: true,
            status: 'proposed',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            location: 'Central Park Dog Run',
        },
        messages: {
            count: 15,
            lastMessage: {
                id: `msg-${Math.random().toString(36).substring(2, 11)}`,
                senderId: `user-${Math.random().toString(36).substring(2, 11)}`,
                content: 'I proposed a meetup for this Saturday at Central Park!',
                timestamp: new Date().toISOString(),
                read: false,
            },
        },
        ...overrides,
    });
}

/**
 * Creates a match with high compatibility score
 */
export function createHighCompatibilityMatch(overrides: Partial<Match> = {}): Match {
    return createMatch({
        compatibility: {
            score: Math.floor(Math.random() * 10) + 90, // 90-100 score
            factors: {
                size: 0.95,
                temperament: 0.92,
                energy: 0.88,
                age: 0.85,
                location: 0.95,
            },
            reasons: [
                'Perfect size match',
                'Excellent temperament compatibility',
                'Similar energy levels',
                'Close age range',
                'Very close location',
            ],
        },
        ...overrides,
    });
}

/**
 * Creates a batch of matches for testing lists and pagination
 */
export function createMatches(count: number, overrides: Partial<Match> = {}): Match[] {
    return Array.from({ length: count }, (_, index) =>
        createMatch({
            createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(), // Spread over days
            ...overrides,
        })
    );
}

/**
 * Creates matches with different statuses for testing filters
 */
export function createMatchesByStatus(): Record<Match['status'], Match[]> {
    return {
        pending: createMatches(3, { status: 'pending' }),
        active: createMatches(5, { status: 'active' }),
        ended: createMatches(2, { status: 'ended' }),
        blocked: createMatches(1, { status: 'blocked' }),
    };
}

/**
 * Creates a match that's about to expire (for testing notifications)
 */
export function createExpiringMatch(overrides: Partial<Match> = {}): Match {
    const expiringMatch = createMatch({
        status: 'pending',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago (assuming 24h expiry)
        messages: {
            count: 0,
        },
        ...overrides,
    });

    // Remove lastActivity for expiring matches
    delete expiringMatch.lastActivity;
    return expiringMatch;
}