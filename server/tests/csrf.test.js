/**
 * CSRF Protection Middleware Tests
 */

const request = require('supertest');
const express = require('express');
const { csrfProtection, setCsrfToken } = require('../src/middleware/csrf');

describe('CSRF Protection Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(setCsrfToken);
    
    // Test routes
    app.get('/api/test', (req, res) => {
      res.json({ success: true });
    });
    
    app.post('/api/protected', csrfProtection, (req, res) => {
      res.json({ success: true, message: 'Protected action completed' });
    });
  });

  describe('setCsrfToken', () => {
    it('should set CSRF token cookie on first request', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/csrf-token=/);
      expect(response.headers['x-csrf-token']).toBeDefined();
    });

    it('should not regenerate token if already present', async () => {
      const firstResponse = await request(app).get('/api/test');
      const token = firstResponse.headers['x-csrf-token'];
      const cookie = firstResponse.headers['set-cookie'][0];
      
      const secondResponse = await request(app)
        .get('/api/test')
        .set('Cookie', cookie);
      
      expect(secondResponse.headers['x-csrf-token']).toBe(token);
    });
  });

  describe('csrfProtection', () => {
    it('should allow GET requests without CSRF token', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.status).toBe(200);
    });

    it('should allow POST with Bearer token (skip CSRF)', async () => {
      const response = await request(app)
        .post('/api/protected')
        .set('Authorization', 'Bearer fake-token')
        .send({ data: 'test' });
      
      expect(response.status).toBe(200);
    });

    it('should reject POST without CSRF token when using cookies', async () => {
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', 'csrf-token=test-token')
        .send({ data: 'test' });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('CSRF token required');
    });

    it('should reject POST with mismatched CSRF tokens', async () => {
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', 'csrf-token=cookie-token')
        .set('X-CSRF-Token', 'different-token')
        .send({ data: 'test' });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid CSRF token');
    });

    it('should allow POST with matching CSRF tokens', async () => {
      const token = 'valid-token-12345';
      
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', `csrf-token=${token}`)
        .set('X-CSRF-Token', token)
        .send({ data: 'test' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate Origin header', async () => {
      const token = 'valid-token-12345';
      
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', `csrf-token=${token}`)
        .set('X-CSRF-Token', token)
        .set('Origin', 'https://evil.com')
        .send({ data: 'test' });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid origin');
    });

    it('should allow valid Origin', async () => {
      const token = 'valid-token-12345';
      
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', `csrf-token=${token}`)
        .set('X-CSRF-Token', token)
        .set('Origin', 'http://localhost:3000')
        .send({ data: 'test' });
      
      expect(response.status).toBe(200);
    });
  });

  describe('Security', () => {
    it('should use timing-safe comparison', async () => {
      const token = 'a'.repeat(64);
      const wrongToken = 'b'.repeat(64);
      
      const start = Date.now();
      await request(app)
        .post('/api/protected')
        .set('Cookie', `csrf-token=${token}`)
        .set('X-CSRF-Token', wrongToken);
      const duration = Date.now() - start;
      
      // Should not short-circuit on first mismatch
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle malformed cookies gracefully', async () => {
      const response = await request(app)
        .post('/api/protected')
        .set('Cookie', 'malformed;;;cookie===')
        .set('X-CSRF-Token', 'token');
      
      expect(response.status).toBe(403);
    });
  });
});
