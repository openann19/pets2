/**
 * Mock Server for PawfectMatch Mobile Development
 * 
 * Provides mock API endpoints for testing and development
 * when backend is unavailable or for E2E testing
 * 
 * Includes Zod validation for GDPR and Chat endpoints
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  DeleteAccountRequestSchema,
  DeleteAccountResponseSchema,
  AccountStatusResponseSchema,
  DataExportRequestSchema,
  DataExportResponseSchema,
  ConfirmDeletionRequestSchema,
  ConfirmDeletionResponseSchema,
  SendReactionRequestSchema,
  SendReactionResponseSchema,
  SendAttachmentRequestSchema,
  SendAttachmentResponseSchema,
  SendVoiceNoteRequestSchema,
  SendVoiceNoteResponseSchema,
} from '../apps/mobile/src/schemas/api';

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

// GDPR endpoints with Zod validation
app.delete('/api/users/delete-account', (req, res) => {
  try {
    const validated = DeleteAccountRequestSchema.parse(req.body || {});
    
    // Check for invalid password scenario
    if (validated.password === 'wrong') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Password is incorrect'
      });
    }
    
    const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const response = {
      success: true,
      message: 'Account deletion scheduled',
      requestId: `req-${Date.now()}`,
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
      canCancel: true,
    };
    
    // Validate response
    const validatedResponse = DeleteAccountResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
});

app.post('/api/users/confirm-deletion', (req, res) => {
  try {
    const validated = ConfirmDeletionRequestSchema.parse(req.body);
    
    if (!validated.token || validated.token === 'invalid-token') {
      return res.status(400).json({ 
        success: false,
        error: 'TOKEN_INVALID',
        message: 'Invalid or expired token' 
      });
    }
    
    const response = {
      success: true,
      deletedAt: new Date().toISOString()
    };
    
    const validatedResponse = ConfirmDeletionResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
});

app.get('/api/users/export-data', (req, res) => {
  const { exportId } = req.query;
  
  if (exportId === 'error') {
    return res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Data export failed, please try again'
    });
  }
  
  res.json({
    success: true,
    url: `https://example.com/export-${exportId || Date.now()}.json`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    format: 'json',
    exportId: exportId || `export-${Date.now()}`
  });
});

app.post('/api/users/request-export', (req, res) => {
  try {
    const validated = DataExportRequestSchema.parse(req.body);
    
    // Simulate export processing
    const exportId = `export-${Date.now()}`;
    const response = {
      success: true,
      exportId,
      url: `https://example.com/export-${exportId}.json`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      format: validated.format || 'json',
      estimatedTime: '5 minutes',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      exportData: {
        profile: { id: 'user-1', email: 'user@example.com', name: 'Test User' },
        pets: [],
        matches: [],
        messages: validated.includeMessages !== false ? [] : undefined,
        preferences: validated.includePreferences !== false ? {} : undefined
      }
    };
    
    const validatedResponse = DataExportResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
});

app.post('/api/users/cancel-deletion', (req, res) => {
  res.json({
    success: true,
    cancelledAt: new Date().toISOString(),
    message: 'Account deletion cancelled successfully'
  });
});

app.get('/api/account/status', (req, res) => {
  try {
    // Mock: Return pending status for testing
    const response = {
      success: true,
      status: 'pending' as const,
      scheduledDeletionDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 25,
      canCancel: true,
      requestId: 'req-1234567890'
    };
    
    const validatedResponse = AccountStatusResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
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

// Chat endpoints with Zod validation
app.post('/api/chat/:conversationId/reaction', (req, res) => {
  try {
    const validated = SendReactionRequestSchema.parse({
      messageId: req.body.messageId,
      reactionType: req.body.reactionType
    });
    
    const response = {
      success: true,
      updatedMessage: {
        _id: validated.messageId,
        matchId: req.params.conversationId,
        author: 'user-1',
        content: 'Original message',
        createdAt: new Date().toISOString(),
        reactions: [{ type: validated.reactionType, userId: 'user-1', createdAt: new Date().toISOString() }]
      }
    };
    
    const validatedResponse = SendReactionResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
});

app.post('/api/chat/:conversationId/attachment', (req, res) => {
  try {
    const validated = SendAttachmentRequestSchema.parse({
      ...req.body,
      conversationId: req.params.conversationId
    });
    
    const response = {
      success: true,
      messageId: `msg-${Date.now()}`,
      attachmentId: `att-${Date.now()}`,
      url: validated.attachmentUrl || 'https://example.com/attachment.jpg',
      type: validated.type,
      fileSize: validated.fileSize || 1024 * 1024
    };
    
    const validatedResponse = SendAttachmentResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
});

app.post('/api/chat/:conversationId/voice', (req, res) => {
  try {
    const validated = SendVoiceNoteRequestSchema.parse({
      ...req.body,
      conversationId: req.params.conversationId
    });
    
    const response = {
      success: true,
      messageId: `msg-${Date.now()}`,
      audioUrl: validated.audioUrl || 'https://example.com/voice.mp3',
      duration: validated.duration,
      transcription: validated.transcription
    };
    
    const validatedResponse = SendVoiceNoteResponseSchema.parse(response);
    res.json(validatedResponse);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request format',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
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