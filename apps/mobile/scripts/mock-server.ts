/**
 * Mock API Server for Local Development & Testing
 * Provides contract-compliant endpoints for all mobile app features
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';

const app = new Hono();

// Enable CORS for development
app.use('/*', cors());

// Health Check
app.get('/health', (c: Context) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTH ====================
app.post('/auth/login', async (c: Context) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    token: 'mock_jwt_token',
    user: { id: '1', email: body.email, name: 'Test User' },
  });
});

app.post('/auth/logout', (c: Context) => {
  return c.json({ success: true, message: 'Logged out' });
});

app.post('/auth/register', async (c: Context) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    token: 'mock_jwt_token',
    user: { id: '1', email: body.email, name: body.name },
  });
});

// ==================== GDPR - CRITICAL ====================
app.delete('/users/delete-account', (c: Context) => {
  return c.json({
    success: true,
    message: 'Deletion scheduled (30 days).',
    gracePeriodEndsAt: new Date(Date.now() + 30 * 864e5).toISOString(),
  });
});

app.get('/users/export-data', (c: Context) => {
  return c.json({
    success: true,
    data: {
      user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      pets: [],
      matches: [],
      messages: [],
      preferences: {},
    },
  });
});

app.post('/users/confirm-deletion', (c: Context) => {
  return c.json({ success: true, message: 'Account deleted' });
});

// ==================== PETS ====================
app.get('/pets', (c: Context) => {
  return c.json({
    success: true,
    pets: [
      { id: '1', name: 'Fluffy', species: 'dog', age: 3, photos: [] },
      { id: '2', name: 'Whiskers', species: 'cat', age: 2, photos: [] },
    ],
  });
});

app.post('/pets', async (c: Context) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    pet: { id: '123', ...body, createdAt: new Date().toISOString() },
  });
});

// ==================== SWIPE ====================
app.post('/swipe/:petId/like', (c: Context) => {
  return c.json({ success: true, isMatch: Math.random() > 0.7 });
});

app.post('/swipe/:petId/pass', (c: Context) => {
  return c.json({ success: true });
});

app.post('/swipe/:petId/report', async (c: Context) => {
  const body = await c.req.json();
  return c.json({ success: true, reportId: 'report_123', reason: body.reason });
});

// ==================== MATCHES ====================
app.get('/matches', (c: Context) => {
  return c.json({
    success: true,
    matches: [
      {
        id: 'match1',
        pet: { id: '1', name: 'Buddy', photos: [] },
        matchedAt: new Date().toISOString(),
      },
    ],
  });
});

// ==================== CHAT ====================
app.get('/chat/conversations', (c: Context) => {
  return c.json({
    success: true,
    conversations: [],
  });
});

app.get('/chat/conversations/:conversationId/messages', (c: Context) => {
  return c.json({
    success: true,
    messages: [
      { id: '1', text: 'Hello!', sentAt: new Date().toISOString(), senderId: 'user1' },
    ],
  });
});

app.post('/chat/conversations/:conversationId/messages', async (c: Context) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    message: { id: 'new_msg', text: body.text, sentAt: new Date().toISOString() },
  });
});

app.post('/chat/messages/:messageId/reactions', async (c: Context) => {
  const body = await c.req.json();
  return c.json({ success: true, reaction: body.emoji });
});

app.post('/chat/messages/:messageId/attachments', async (c: Context) => {
  return c.json({ success: true, attachmentId: 'attach_123' });
});

// ==================== PREMIUM/SUBSCRIPTION ====================
app.get('/subscription/status', (c: Context) => {
  return c.json({
    success: true,
    isPremium: false,
    expiresAt: null,
    plan: 'free',
  });
});

app.post('/subscription/subscribe', async (c: Context) => {
  return c.json({ success: true, subscriptionId: 'sub_123' });
});

app.post('/subscription/cancel', (c: Context) => {
  return c.json({ success: true, message: 'Subscription cancelled' });
});

// ==================== REPORTING ====================
app.post('/reports', async (c: Context) => {
  const body = await c.req.json();
  return c.json({ success: true, reportId: 'report_123', ...body });
});

// ==================== NOTIFICATIONS ====================
app.get('/notifications', (c: Context) => {
  return c.json({
    success: true,
    notifications: [
      {
        id: 'notif1',
        type: 'match',
        message: 'New match!',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
  });
});

app.put('/notifications/:id/read', (c: Context) => {
  return c.json({ success: true });
});

// Start server
const port = parseInt(process.env.PORT || '7337', 10);

export default app;

console.log(`🚀 Mock API Server ready on http://localhost:${port}`);
console.log('   Use: pnpm mobile:mock');

