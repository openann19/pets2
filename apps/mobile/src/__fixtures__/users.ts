/**
 * User test fixtures
 */

export const testUsers = {
  basic: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar1.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    verified: true,
  },

  premium: {
    id: 'user-premium',
    email: 'premium@example.com',
    name: 'Premium User',
    avatar: 'https://example.com/avatar-premium.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    verified: true,
    isPremium: true,
    premiumUntil: '2025-12-31T23:59:59Z',
  },

  unverified: {
    id: 'user-unverified',
    email: 'unverified@example.com',
    name: 'Unverified User',
    avatar: null,
    createdAt: '2024-06-01T00:00:00Z',
    verified: false,
  },

  blocked: {
    id: 'user-blocked',
    email: 'blocked@example.com',
    name: 'Blocked User',
    avatar: 'https://example.com/avatar-blocked.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    verified: true,
    blocked: true,
  },
};

export const testUserProfiles = {
  complete: {
    userId: 'user-1',
    bio: 'I love dogs and outdoor activities!',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
    },
    preferences: {
      ageMin: 1,
      ageMax: 10,
      distance: 25,
      breeds: ['Golden Retriever', 'Labrador'],
    },
  },

  incomplete: {
    userId: 'user-unverified',
    bio: null,
    location: null,
    preferences: null,
  },
};
