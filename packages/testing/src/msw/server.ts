/**
 * Real MSW Server for PawfectMatch Testing
 * Comprehensive API mocking and request interception
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API responses
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/150',
    preferences: {
      species: ['dog', 'cat'],
      ageRange: [1, 5],
      activityLevel: [3, 7]
    },
    premium: {
      isActive: true,
      plan: 'premium',
      expiresAt: '2024-12-31T23:59:59Z'
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://via.placeholder.com/150',
    preferences: {
      species: ['cat'],
      ageRange: [2, 8],
      activityLevel: [2, 6]
    },
    premium: {
      isActive: false,
      plan: 'free',
      expiresAt: null
    }
  }
];

const mockPets = [
  {
    id: '1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    photos: ['https://via.placeholder.com/400x300'],
    description: 'Friendly and energetic dog looking for a loving home.',
    temperament: ['friendly', 'energetic', 'good-with-kids'],
    health: {
      vaccinated: true,
      spayed: false,
      medicalIssues: []
    },
    location: {
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    shelter: {
      id: '1',
      name: 'SF Animal Care & Control',
      contact: '415-554-6364'
    }
  },
  {
    id: '2',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Maine Coon',
    age: 2,
    gender: 'female',
    size: 'medium',
    photos: ['https://via.placeholder.com/400x300'],
    description: 'Gentle and affectionate cat who loves to cuddle.',
    temperament: ['gentle', 'affectionate', 'calm'],
    health: {
      vaccinated: true,
      spayed: true,
      medicalIssues: []
    },
    location: {
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103'
    },
    shelter: {
      id: '2',
      name: 'SPCA San Francisco',
      contact: '415-554-3000'
    }
  }
];

const mockMatches = [
  {
    id: '1',
    pet: mockPets[0],
    user: mockUsers[0],
    compatibilityScore: 85,
    matchedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hi! I\'m interested in adopting Buddy.',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        senderId: '2',
        content: 'Great! Buddy is a wonderful dog. When would you like to meet him?',
        timestamp: '2024-01-15T10:35:00Z'
      }
    ]
  }
];

// API handlers
const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        token: 'mock-jwt-token',
        user: mockUsers[0]
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        token: 'mock-jwt-token',
        user: mockUsers[0]
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully'
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: mockUsers[0]
      })
    );
  }),

  // Pet endpoints
  rest.get('/api/pets', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '10';
    const species = req.url.searchParams.get('species');
    const breed = req.url.searchParams.get('breed');
    const ageMin = req.url.searchParams.get('ageMin');
    const ageMax = req.url.searchParams.get('ageMax');

    let filteredPets = [...mockPets];

    if (species) {
      filteredPets = filteredPets.filter(pet => pet.species === species);
    }

    if (breed) {
      filteredPets = filteredPets.filter(pet => pet.breed === breed);
    }

    if (ageMin) {
      filteredPets = filteredPets.filter(pet => pet.age >= parseInt(ageMin));
    }

    if (ageMax) {
      filteredPets = filteredPets.filter(pet => pet.age <= parseInt(ageMax));
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPets = filteredPets.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        pets: paginatedPets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPets.length,
          totalPages: Math.ceil(filteredPets.length / parseInt(limit))
        }
      })
    );
  }),

  rest.get('/api/pets/:id', (req, res, ctx) => {
    const { id } = req.params;
    const pet = mockPets.find(p => p.id === id);

    if (!pet) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Pet not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        pet
      })
    );
  }),

  // Swipe endpoints
  rest.post('/api/swipes', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Swipe recorded',
        isMatch: Math.random() > 0.7 // 30% chance of match
      })
    );
  }),

  // Match endpoints
  rest.get('/api/matches', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        matches: mockMatches
      })
    );
  }),

  rest.get('/api/matches/:id', (req, res, ctx) => {
    const { id } = req.params;
    const match = mockMatches.find(m => m.id === id);

    if (!match) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Match not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        match
      })
    );
  }),

  // Message endpoints
  rest.get('/api/matches/:id/messages', (req, res, ctx) => {
    const { id } = req.params;
    const match = mockMatches.find(m => m.id === id);

    if (!match) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Match not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        messages: match.messages
      })
    );
  }),

  rest.post('/api/matches/:id/messages', (req, res, ctx) => {
    const { id } = req.params;
    const match = mockMatches.find(m => m.id === id);

    if (!match) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'Match not found'
        })
      );
    }

    const newMessage = {
      id: Date.now().toString(),
      senderId: '1',
      content: 'Test message',
      timestamp: new Date().toISOString()
    };

    match.messages.push(newMessage);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: newMessage
      })
    );
  }),

  // User endpoints
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'User not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user
      })
    );
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'User not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: { ...user, ...req.body }
      })
    );
  }),

  // Subscription endpoints
  rest.get('/api/subscriptions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        subscription: {
          id: 'sub_123',
          status: 'active',
          plan: 'premium',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-02-01T00:00:00Z',
          cancelAtPeriodEnd: false
        }
      })
    );
  }),

  rest.post('/api/subscriptions', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        subscription: {
          id: 'sub_123',
          status: 'active',
          plan: 'premium',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-02-01T00:00:00Z',
          cancelAtPeriodEnd: false
        }
      })
    );
  }),

  rest.delete('/api/subscriptions/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Subscription cancelled'
      })
    );
  }),

  // Payment endpoints
  rest.post('/api/payments/create-intent', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        clientSecret: 'pi_mock_client_secret'
      })
    );
  }),

  rest.post('/api/payments/confirm', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        payment: {
          id: 'pi_mock_payment',
          status: 'succeeded',
          amount: 999
        }
      })
    );
  }),

  // AI endpoints
  rest.post('/api/ai/analyze-photo', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        analysis: {
          species: 'dog',
          breed: 'Golden Retriever',
          confidence: 0.95,
          age: 3,
          health: {
            overall: 'good',
            issues: []
          },
          characteristics: {
            size: 'large',
            color: 'golden',
            temperament: ['friendly', 'energetic']
          }
        }
      })
    );
  }),

  rest.post('/api/ai/match', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        matches: mockPets.slice(0, 3).map(pet => ({
          pet,
          compatibilityScore: Math.floor(Math.random() * 40) + 60,
          reasons: [
            'Similar activity level preferences',
            'Compatible temperament',
            'Age range matches your preferences'
          ]
        }))
      })
    );
  }),

  // Admin endpoints
  rest.get('/api/admin/analytics/subscription', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        analytics: {
          totalUsers: 1000,
          totalPremiumUsers: 250,
          mrr: 12500,
          arr: 150000,
          churnRate: 5.2,
          conversionRate: 25.0,
          userGrowth: 15.5,
          usage: {
            totalSwipesUsed: 50000,
            totalSuperLikesUsed: 5000,
            totalBoostsUsed: 1000,
            totalMessagesSent: 25000,
            totalProfileViews: 100000
          }
        }
      })
    );
  }),

  rest.get('/api/admin/payments/retry-stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        stats: {
          totalRetries: 150,
          successfulRetries: 120,
          failedRetries: 30,
          averageRetryAttempts: 2.1,
          retrySuccessRate: 80.0
        }
      })
    );
  }),

  // Error handlers
  rest.get('/api/error/500', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: 'Internal server error'
      })
    );
  }),

  rest.get('/api/error/404', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'Not found'
      })
    );
  }),

  rest.get('/api/error/401', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Unauthorized'
      })
    );
  }),

  rest.get('/api/error/403', (req, res, ctx) => {
    return res(
      ctx.status(403),
      ctx.json({
        success: false,
        message: 'Forbidden'
      })
    );
  }),

  // Fallback handler
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: 'Endpoint not found'
      })
    );
  })
];

export const server = setupServer(...handlers);
