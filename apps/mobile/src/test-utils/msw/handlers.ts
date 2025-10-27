/**
 * MSW (Mock Service Worker) request handlers
 * Used for intercepting HTTP requests in unit/integration tests
 */

import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../config/environment';

// Define handlers for API endpoints
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: '123',
        email: 'new@example.com',
        name: 'New User',
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/refresh-token`, async () => {
    return HttpResponse.json({
      token: 'refreshed-mock-jwt-token',
    });
  }),

  // Users endpoints
  http.get(`${API_BASE_URL}/users/me`, async () => {
    return HttpResponse.json({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      pets: [],
      subscription: null,
    });
  }),

  http.get(`${API_BASE_URL}/users/export-data`, async () => {
    return HttpResponse.json({
      data: {
        profile: { email: 'test@example.com', name: 'Test User' },
        pets: [],
        matches: [],
        messages: [],
      },
    });
  }),

  http.delete(`${API_BASE_URL}/users/delete-account`, async () => {
    return HttpResponse.json({
      success: true,
      message: 'Account deletion initiated',
      gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // Pets endpoints
  http.get(`${API_BASE_URL}/pets`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    
    return HttpResponse.json({
      pets: [
        {
          _id: '1',
          name: 'Fluffy',
          type: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          photos: ['https://example.com/photo.jpg'],
        },
      ],
      pagination: {
        page,
        totalPages: 1,
        totalItems: 1,
      },
    });
  }),

  http.get(`${API_BASE_URL}/pets/:id`, async ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      _id: id,
      name: 'Fluffy',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      photos: ['https://example.com/photo.jpg'],
    });
  }),

  http.post(`${API_BASE_URL}/pets`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      _id: 'new-pet-id',
      ...(body as Record<string, unknown>),
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/pets/:id`, async ({ request, params }) => {
    const body = await request.json();
    const { id } = params;
    return HttpResponse.json({
      _id: id,
      ...(body as Record<string, unknown>),
    });
  }),

  http.delete(`${API_BASE_URL}/pets/:id`, async () => {
    return HttpResponse.json({ success: true });
  }),

  // Matches endpoints
  http.get(`${API_BASE_URL}/matches`, async () => {
    return HttpResponse.json({
      matches: [
        {
          _id: 'match1',
          petId: '1',
          matchedPetId: '2',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ],
    });
  }),

  http.post(`${API_BASE_URL}/matches/like`, async ({ request }) => {
    const body = await request.json() as { petId: string; likedPetId: string };
    const isMatch = Math.random() > 0.5; // 50% chance of match
    
    return HttpResponse.json({
      liked: true,
      matched: isMatch,
      matchId: isMatch ? 'match-id' : undefined,
    });
  }),

  // AI endpoints
  http.post(`${API_BASE_URL}/ai/generate-bio`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      bio: 'A playful and friendly companion who loves adventure!',
      keywords: ['friendly', 'playful', 'loves adventure'],
      sentiment: { score: 0.8, label: 'positive' },
      matchScore: 0.85,
    });
  }),

  http.post(`${API_BASE_URL}/ai/analyze-photos`, async () => {
    return HttpResponse.json({
      breed_analysis: {
        primary_breed: 'Golden Retriever',
        confidence: 0.92,
      },
      health_assessment: {
        age_estimate: 3,
        health_score: 0.9,
        recommendations: ['Maintain regular exercise'],
      },
      photo_quality: {
        overall_score: 0.85,
        lighting_score: 0.8,
        composition_score: 0.9,
        clarity_score: 0.85,
      },
      matchability_score: 0.88,
      ai_insights: ['Great lighting', 'Good composition'],
    });
  }),

  // Default catch-all handler
  http.all('*', async ({ request }) => {
    console.warn(`Unhandled MSW request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { error: 'No handler defined for this request' },
      { status: 500 }
    );
  }),
];

