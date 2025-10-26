/**
 * Mock Server for PawfectMatch Development
 * 
 * Provides MSW (Mock Service Worker) handlers for all missing backend endpoints
 * Used during development and testing when real backend is unavailable
 */

import { http, HttpResponse } from 'msw';
import * as fs from 'fs';
import * as path from 'path';

// Base URL for API
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Load fixture data from JSON files
 */
function loadFixture(fixturePath: string): any {
  const fullPath = path.join(process.cwd(), 'mocks', 'fixtures', fixturePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load fixture: ${fixturePath}`, error);
    return { success: false, error: 'FIXTURE_NOT_FOUND', message: `Fixture ${fixturePath} not found` };
  }
}

/**
 * Mock Service Worker handlers
 * All GDPR, Chat, AI, and Subscription endpoints
 */
export const handlers = [
  // ==================== GDPR Endpoints ====================
  
  /**
   * DELETE /api/users/delete-account
   * Request account deletion with 30-day grace period
   */
  http.delete(`${API_BASE}/api/users/delete-account`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { password?: string };
    
    // Simulate password validation
    if (body.password !== 'correctpassword') {
      return HttpResponse.json(loadFixture('gdpr/delete.invalid-password.json'), { status: 401 });
    }
    
    return HttpResponse.json(loadFixture('gdpr/delete.success.json'));
  }),
  
  /**
   * POST /api/users/cancel-deletion
   * Cancel pending account deletion
   */
  http.post(`${API_BASE}/api/users/cancel-deletion`, async () => {
    return HttpResponse.json({
      success: true,
      message: 'Account deletion cancelled successfully',
      gracePeriodEndsAt: null
    });
  }),
  
  /**
   * POST /api/users/confirm-deletion
   * Confirm and complete account deletion
   */
  http.post(`${API_BASE}/api/users/confirm-deletion`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { token?: string };
    
    if (!body.token) {
      return HttpResponse.json({ success: false, error: 'MISSING_TOKEN', message: 'Invalid or missing token' }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  }),
  
  /**
   * GET /api/users/export-data
   * Export all user data (GDPR Article 20)
   */
  http.get(`${API_BASE}/api/users/export-data`, () => {
    // Simulate export already in progress
    return HttpResponse.json(loadFixture('gdpr/export.success.json'));
  }),
  
  /**
   * POST /api/users/request-export
   * Initiate data export
   */
  http.post(`${API_BASE}/api/users/request-export`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { format?: 'json' | 'csv' };
    
    const format = body.format || 'json';
    
    return HttpResponse.json({
      success: true,
      message: 'Data export initiated',
      estimatedTime: '5-10 minutes',
      format,
      estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
  }),

  // ==================== Chat Endpoints ====================
  
  /**
   * POST /api/chat/reactions
   * Send a reaction to a message
   */
  http.post(`${API_BASE}/api/chat/reactions`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { matchId?: string; messageId?: string; reaction?: string };
    
    if (!body.matchId || !body.messageId || !body.reaction) {
      return HttpResponse.json({ success: false, error: 'MISSING_PARAMS', message: 'Missing required parameters' }, { status: 400 });
    }
    
    return HttpResponse.json(loadFixture('chat/reaction.success.json'));
  }),
  
  /**
   * POST /api/chat/attachments
   * Upload a file attachment
   */
  http.post(`${API_BASE}/api/chat/attachments`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json({ success: false, error: 'MISSING_FILE', message: 'No file provided' }, { status: 400 });
    }
    
    // Simulate file size check
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return HttpResponse.json(loadFixture('chat/attachment.error.json'), { status: 413 });
    }
    
    return HttpResponse.json(loadFixture('chat/attachment.success.json'));
  }),
  
  /**
   * POST /api/chat/voice
   * Upload a voice note
   */
  http.post(`${API_BASE}/api/chat/voice`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { matchId?: string; audioBlob?: Blob; duration?: number };
    
    if (!body.matchId || !body.duration) {
      return HttpResponse.json({ success: false, error: 'MISSING_PARAMS', message: 'Missing required parameters' }, { status: 400 });
    }
    
    // Simulate audio format check
    if (body.duration > 300) { // 5 minutes
      return HttpResponse.json({ success: false, error: 'DURATION_TOO_LONG', message: 'Voice note exceeds maximum duration' }, { status: 400 });
    }
    
    return HttpResponse.json(loadFixture('chat/voice.success.json'));
  }),

  // ==================== AI Endpoints ====================
  
  /**
   * POST /api/ai/compatibility
   * Analyze compatibility between two pets
   */
  http.post(`${API_BASE}/api/ai/compatibility`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { petAId?: string; petBId?: string };
    
    if (!body.petAId || !body.petBId) {
      return HttpResponse.json({ success: false, error: 'MISSING_PARAMS', message: 'Missing pet IDs' }, { status: 400 });
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json(loadFixture('ai/compatibility.success.json'));
  }),

  // ==================== Subscription Endpoints ====================
  
  /**
   * GET /api/subscription/plans
   * Get available subscription plans
   */
  http.get(`${API_BASE}/api/subscription/plans`, () => {
    return HttpResponse.json(loadFixture('subscription/plans.json'));
  }),
  
  /**
   * POST /api/subscription/checkout
   * Create Stripe checkout session
   */
  http.post(`${API_BASE}/api/subscription/checkout`, async ({ request }) => {
    const body = await request.json().catch(() => ({})) as { planId?: string; interval?: 'month' | 'year' };
    
    if (!body.planId || !body.interval) {
      return HttpResponse.json({ success: false, error: 'MISSING_PARAMS', message: 'Missing plan ID or interval' }, { status: 400 });
    }
    
    return HttpResponse.json(loadFixture('subscription/checkout.success.json'));
  }),
  
  /**
   * POST /api/subscription/webhook
   * Handle Stripe webhook events
   */
  http.post(`${API_BASE}/api/subscription/webhook`, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    
    // Simulate webhook processing
    return HttpResponse.json({
      success: true,
      message: 'Webhook received',
      eventType: body.type || 'unknown'
    });
  }),
];

/**
 * Setup function for MSW
 */
export function setupMockServer() {
  console.log('📦 Mock Server initialized');
  console.log('Available endpoints:');
  console.log('  - GDPR: DELETE /api/users/delete-account, GET /api/users/export-data');
  console.log('  - Chat: POST /api/chat/reactions, POST /api/chat/attachments, POST /api/chat/voice');
  console.log('  - AI: POST /api/ai/compatibility');
  console.log('  - Subscription: GET /api/subscription/plans, POST /api/subscription/checkout');
  console.log(`Using API base URL: ${API_BASE}`);
}

