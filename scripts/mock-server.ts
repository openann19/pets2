/**
 * Mock Server for PawfectMatch Mobile Development
 * 
 * Provides mock API endpoints for testing and development
 * when backend is unavailable or for E2E testing
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Data
const users = JSON.parse(
  readFileSync(join(__dirname, '../mocks/fixtures/users.json'), 'utf-8')
);
const pets = JSON.parse(
  readFileSync(join(__dirname, '../mocks/fixtures/pets.json'), 'utf-8')
);
const matches = JSON.parse(
  readFileSync(join(__dirname, '../mocks/fixtures/matches.json'), 'utf-8')
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u: any) => u.email === email);
  
  if (user && user.password === password) {
    res.json({
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'new-user-id', ...req.body }
  });
});

// GDPR endpoints
app.delete('/api/users/delete-account', (req, res) => {
  const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  res.json({
    success: true,
    message: 'Account deletion scheduled',
    requestId: `req-${Date.now()}`,
    gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
    canCancel: true,
    exportUrl: `/api/users/export-data`
  });
});

app.post('/api/users/confirm-deletion', (req, res) => {
  const { token } = req.body;
  
  if (token === 'valid-token') {
    res.json({
      success: true,
      deletedAt: new Date().toISOString()
    });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});

app.get('/api/users/export-data', (req, res) => {
  res.json({
    url: 'https://example.com/export.json',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    format: 'json'
  });
});

app.post('/api/users/cancel-deletion', (req, res) => {
  res.json({
    success: true,
    cancelledAt: new Date().toISOString()
  });
});

// Matches endpoints
app.get('/api/matches', (req, res) => {
  res.json(matches);
});

app.get('/api/matches/:id', (req, res) => {
  const match = matches.find((m: any) => m.id === req.params.id);
  if (match) {
    res.json(match);
  } else {
    res.status(404).json({ error: 'Match not found' });
  }
});

app.post('/api/matches', (req, res) => {
  const newMatch = {
    id: `match-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.json(newMatch);
});

// Chat endpoints
app.get('/api/chat/:conversationId/messages', (req, res) => {
  res.json({
    messages: [
      {
        id: 'msg-1',
        text: 'Hello!',
        senderId: 'user-1',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/chat/:conversationId/message', (req, res) => {
  res.json({
    id: `msg-${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat/:conversationId/reaction', (req, res) => {
  res.json({
    success: true,
    updatedMessage: {
      ...req.body,
      reactions: [{ type: req.body.reactionType, count: 1 }]
    }
  });
});

app.post('/api/chat/:conversationId/attachment', (req, res) => {
  res.json({
    success: true,
    messageId: `msg-${Date.now()}`,
    attachmentId: `att-${Date.now()}`,
    url: 'https://example.com/attachment.jpg',
    type: req.body.type,
    fileSize: 1024 * 1024 // 1MB
  });
});

app.post('/api/chat/:conversationId/voice', (req, res) => {
  res.json({
    success: true,
    messageId: `msg-${Date.now()}`,
    audioUrl: 'https://example.com/voice.mp3',
    duration: req.body.duration
  });
});

// Pets endpoints
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find((p: any) => p.id === req.params.id);
  if (pet) {
    res.json(pet);
  } else {
    res.status(404).json({ error: 'Pet not found' });
  }
});

// Premium endpoints
app.get('/api/premium/status', (req, res) => {
  res.json({
    hasActiveSubscription: false,
    tier: 'free',
    expiresAt: null
  });
});

app.post('/api/premium/subscribe', (req, res) => {
  res.json({
    sessionId: `session-${Date.now()}`,
    url: 'https://checkout.example.com'
  });
});

// AI endpoints
app.post('/api/ai/generate-bio', (req, res) => {
  res.json({
    bio: 'This is a generated bio',
    keywords: ['friendly', 'active'],
    sentiment: { score: 0.9, label: 'positive' },
    matchScore: 85
  });
});

app.post('/api/ai/analyze-photos', (req, res) => {
  res.json({
    breed_analysis: {
      primary_breed: 'Golden Retriever',
      confidence: 0.95
    },
    health_assessment: {
      age_estimate: 3,
      health_score: 90,
      recommendations: []
    },
    photo_quality: {
      overall_score: 0.9,
      lighting_score: 0.9,
      composition_score: 0.85,
      clarity_score: 0.9
    },
    matchability_score: 85,
    ai_insights: ['Well-groomed', 'Good lighting']
  });
});

app.post('/api/ai/enhanced-compatibility', (req, res) => {
  res.json({
    compatibility_score: 85,
    ai_analysis: 'These pets are highly compatible',
    breakdown: {
      personality_compatibility: 90,
      lifestyle_compatibility: 85,
      activity_compatibility: 80,
      social_compatibility: 90,
      environment_compatibility: 80
    },
    recommendations: {
      meeting_suggestions: ['Dog park', 'Indoor play'],
      activity_recommendations: ['Fetch', 'Tug of war'],
      supervision_requirements: ['Close supervision initially'],
      success_probability: 0.85
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log('📝 Available endpoints:');
  console.log('  - POST /api/auth/login');
  console.log('  - DELETE /api/users/delete-account');
  console.log('  - GET /api/matches');
  console.log('  - GET /api/pets');
  console.log('  - POST /api/chat/:id/reaction');
  console.log('  - POST /api/chat/:id/attachment');
  console.log('  - POST /api/ai/generate-bio');
});

export default app;