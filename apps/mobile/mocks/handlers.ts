/**
 * MSW (Mock Service Worker) handlers for PawfectMatch Mobile
 *
 * Provides comprehensive API mocking for all test scenarios
 * as defined in the Test Plan v1.0
 */

import { http, HttpResponse } from 'msw';

// Base test data
const mockUsers = {
  testUser: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    verified: true,
  },
};

const mockPets = {
  buddy: {
    id: 'pet-456',
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    photos: ['https://example.com/buddy1.jpg', 'https://example.com/buddy2.jpg'],
    ownerId: 'user-123',
    vaccinated: true,
    neutered: true,
    description: 'Friendly Golden Retriever who loves walks and belly rubs!',
    createdAt: '2024-01-01T00:00:00Z',
  },
  luna: {
    id: 'pet-789',
    name: 'Luna',
    breed: 'Siamese Cat',
    age: 2,
    gender: 'female',
    size: 'small',
    photos: ['https://example.com/luna1.jpg'],
    ownerId: 'user-456',
    vaccinated: true,
    neutered: true,
    description: 'Playful Siamese cat who loves attention and treats!',
    createdAt: '2024-01-02T00:00:00Z',
  },
};

const mockUploads = {
  pending: {
    id: 'upload-123',
    petId: 'pet-456',
    status: 'pending',
    progress: 0,
    s3Key: 'uploads/test-key',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
  approved: {
    id: 'upload-456',
    petId: 'pet-456',
    status: 'approved',
    progress: 100,
    s3Key: 'uploads/test-key',
    moderationResult: {
      status: 'approved',
      confidence: 0.95,
      categories: [],
    },
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:05:00Z',
  },
  rejected: {
    id: 'upload-789',
    petId: 'pet-456',
    status: 'rejected',
    progress: 100,
    s3Key: 'uploads/test-key',
    moderationResult: {
      status: 'rejected',
      reason: 'unsafe_content',
      confidence: 0.98,
      categories: ['violence'],
    },
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:05:00Z',
  },
  duplicate: {
    id: 'upload-999',
    petId: 'pet-456',
    status: 'rejected',
    progress: 100,
    s3Key: 'uploads/test-key',
    moderationResult: {
      status: 'rejected',
      reason: 'duplicate',
      confidence: 0.99,
      duplicateOf: 'upload-456',
    },
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:05:00Z',
  },
};

const mockVerifications = {
  tier1_pending: {
    id: 'verification-123',
    userId: 'user-123',
    tier: 1,
    status: 'pending',
    sessionId: 'session-123',
    verificationUrl: 'https://verification-provider.com/session/123',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
  tier1_approved: {
    id: 'verification-456',
    userId: 'user-123',
    tier: 1,
    status: 'approved',
    sessionId: 'session-456',
    approvedAt: '2024-01-01T13:00:00Z',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T13:00:00Z',
  },
  tier2_requires_info: {
    id: 'verification-789',
    userId: 'user-123',
    tier: 2,
    status: 'requires_info',
    requiredDocuments: ['government_id', 'proof_of_address'],
    rejectionReason: 'Documents need to be clearer',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T14:00:00Z',
  },
};

// Authentication handlers
export const authHandlers = [
  http.post('*/auth/login', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUsers.testUser,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-jwt-token',
        refreshToken: 'refresh-token-123',
      },
    });
  }),

  http.post('*/auth/register', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: { ...mockUsers.testUser, email: 'newuser@example.com' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-user-jwt-token',
        refreshToken: 'new-refresh-token-123',
      },
    });
  }),

  http.post('*/auth/logout', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  http.post('*/auth/refresh', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshed-jwt-token',
        refreshToken: 'new-refresh-token-456',
      },
    });
  }),

  http.post('*/auth/forgot-password', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  }),
];

// Pet handlers
export const petHandlers = [
  http.get('*/pets', async ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '20';

    return HttpResponse.json({
      success: true,
      data: [mockPets.buddy, mockPets.luna],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2,
        pages: 1,
      },
    });
  }),

  http.post('*/pets', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPets.buddy,
        id: 'new-pet-id',
        name: 'New Pet',
      },
    });
  }),

  http.get('*/pets/:petId', async ({ params }) => {
    const { petId } = params as { petId: string };
    const pet = Object.values(mockPets).find((p: any) => p.id === petId);

    if (!pet) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Pet not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: pet,
    });
  }),

  http.put('*/pets/:petId', async ({ params }) => {
    const { petId } = params as { petId: string };

    return HttpResponse.json({
      success: true,
      data: {
        ...mockPets.buddy,
        id: petId,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.delete('*/pets/:petId', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Pet deleted successfully',
    });
  }),
];

// Upload handlers
export const uploadHandlers = [
  http.post('*/uploads/presign', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        uploadUrl: 'https://pawfectmatch-uploads.s3.amazonaws.com/test-upload',
        key: 'uploads/test-key-123',
        fields: {
          'Content-Type': 'image/jpeg',
          'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        },
      },
    });
  }),

  http.post('*/uploads', async () => {
    // Default to approved status
    return HttpResponse.json({
      success: true,
      data: mockUploads.approved,
    });
  }),

  http.get('*/uploads/:uploadId', async ({ params }) => {
    const { uploadId } = params as { uploadId: string };
    const upload = Object.values(mockUploads).find((u: any) => u.id === uploadId);

    if (!upload) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Upload not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: upload,
    });
  }),

  http.get('*/uploads', async () => {
    return HttpResponse.json({
      success: true,
      data: [mockUploads.approved, mockUploads.pending],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      },
    });
  }),
];

// Verification handlers
export const verificationHandlers = [
  http.post('*/verification/tier1', async () => {
    return HttpResponse.json({
      success: true,
      data: mockVerifications.tier1_pending,
    });
  }),

  http.post('*/verification/tier2', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockVerifications.tier2_requires_info,
        id: 'tier2-verification-123',
      },
    });
  }),

  http.get('*/verification/status', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        currentTier: 1,
        status: 'approved',
        badges: ['id_verified'],
        verifications: [mockVerifications.tier1_approved],
      },
    });
  }),

  http.post('*/verification/webhook', async () => {
    // Mock webhook for verification completion
    return HttpResponse.json({
      success: true,
      message: 'Verification completed',
    });
  }),
];

// Match handlers
export const matchHandlers = [
  http.get('*/matches', async () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'match-123',
          userId: 'user-123',
          petId: 'pet-789',
          compatibility: 85,
          createdAt: '2024-01-01T15:00:00Z',
          lastMessage: {
            text: 'Hi there!',
            senderId: 'user-456',
            timestamp: '2024-01-01T16:00:00Z',
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      },
    });
  }),

  http.post('*/matches/:matchId/like', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        liked: true,
        likes: 1,
      },
    });
  }),
];

// Chat handlers
export const chatHandlers = [
  http.get('*/chats/:chatId/messages', async ({ params }) => {
    const { chatId } = params as { chatId: string };
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'msg-1',
          chatId: chatId,
          senderId: 'user-456',
          text: 'Hi! I loved your pet\'s profile!',
          timestamp: '2024-01-01T16:00:00Z',
          read: true,
        },
        {
          id: 'msg-2',
          chatId: chatId,
          senderId: 'user-123',
          text: 'Thanks! Buddy would love to meet your cat!',
          timestamp: '2024-01-01T16:05:00Z',
          read: false,
        },
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 2,
        pages: 1,
      },
    });
  }),

  http.post('*/chats/:chatId/messages', async ({ params }) => {
    const { chatId } = params as { chatId: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'new-msg-id',
        chatId: chatId,
        senderId: 'user-123',
        text: 'Test message',
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  }),
];

// Map handlers
export const mapHandlers = [
  http.get('*/map/pins', async () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: 'pin-1',
          petId: 'pet-456',
          activity: 'walking',
          location: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128],
          },
          radius: 500,
          active: true,
          likes: [],
          createdAt: '2024-01-01T17:00:00Z',
        },
      ],
    });
  }),

  http.post('*/map/activity/start', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        _id: 'activity-123',
        petId: 'pet-456',
        activity: 'walking',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        active: true,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];

// Settings handlers
export const settingsHandlers = [
  http.get('*/settings', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        notifications: {
          matches: true,
          messages: true,
          likes: false,
        },
        privacy: {
          showOnlineStatus: true,
          allowMessages: 'matches_only',
        },
        preferences: {
          distanceUnit: 'km',
          theme: 'light',
        },
      },
    });
  }),

  http.put('*/settings', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  }),

  http.post('*/gdpr/export', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        exportId: 'export-123',
        status: 'processing',
        estimatedCompletion: '2024-01-01T18:00:00Z',
      },
    });
  }),

  http.delete('*/gdpr/delete-account', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        deletionId: 'deletion-123',
        scheduledFor: '2024-01-08T00:00:00Z', // 7 days from now
      },
    });
  }),
];

// Notification handlers
export const notificationHandlers = [
  http.post('*/notifications/register', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Device registered for notifications',
    });
  }),

  http.get('*/notifications', async () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'notif-1',
          type: 'match',
          title: 'New Match!',
          body: 'You matched with Luna!',
          data: { matchId: 'match-123' },
          read: false,
          createdAt: '2024-01-01T17:00:00Z',
        },
      ],
    });
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...petHandlers,
  ...uploadHandlers,
  ...verificationHandlers,
  ...matchHandlers,
  ...chatHandlers,
  ...mapHandlers,
  ...settingsHandlers,
  ...notificationHandlers,
];

// Export individual handler groups for scenario-specific mocking
export const createScenarioHandlers = (scenario: string) => {
  const scenarios: Record<string, any[]> = {
    upload_duplicate: [
      http.post('*/uploads', async () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'Duplicate image detected',
            data: {
              reason: 'exact_duplicate',
              confidence: 0.99,
              duplicateOf: 'upload-456',
            },
          },
          { status: 409 }
        );
      }),
    ],

    upload_unsafe: [
      http.post('*/uploads', async () => {
        return HttpResponse.json({
          success: true,
          data: mockUploads.rejected,
        });
      }),
    ],

    verification_requires_info: [
      http.post('*/verification/tier2', async () => {
        return HttpResponse.json({
          success: true,
          data: mockVerifications.tier2_requires_info,
        });
      }),
    ],

    network_error: [
      http.get('*', async () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal server error',
          },
          { status: 500 }
        );
      }),
    ],

    offline_mode: [
      http.get('*', async () => {
        return HttpResponse.error();
      }),
    ],
  };

  return scenarios[scenario] || [];
};
