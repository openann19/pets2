/**
 * GDPR Deletion E2E Tests
 * Tests the complete flow of account deletion with 30-day grace period
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../src/models/User';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';

let app: any;
let server: Server;
let authToken: string;
let userId: string;

describe('GDPR Deletion E2E Tests', () => {
  beforeEach(async () => {
    // Import the app
    const serverModule = await import('../../server');
    app = serverModule.app;
    server = serverModule.httpServer;

    // Create a test user for each test
    const user = new User({
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User'
    });
    await user.save();
    userId = user._id.toString();

    // Generate auth token
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    authToken = jwt.sign({ userId, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test.*@example.com/ });
  });

  describe('POST /api/account/delete', () => {
    it('should initiate account deletion with 30-day grace period', async () => {
      const response = await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'Test123!@#'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('deletionId');
      expect(response.body).toHaveProperty('gracePeriodEndsAt');
      expect(response.body).toHaveProperty('canCancel', true);

      // Verify user has deletion request
      const user = await User.findById(userId);
      expect(user?.deletionRequestedAt).toBeTruthy();
      expect(user?.deletionRequestId).toBeTruthy();
      expect(user?.deletionGracePeriodEndsAt).toBeTruthy();
    });

    it('should require password for deletion', async () => {
      const response = await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'wrong-password'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'INVALID_PASSWORD');
    });

    it('should accept reason and feedback', async () => {
      const response = await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'Test123!@#',
          reason: 'no-longer-needed',
          feedback: 'Great app but not using it'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      const user = await User.findById(userId);
      expect(user?.deletionReason).toBe('no-longer-needed');
      expect(user?.deletionFeedback).toBe('Great app but not using it');
    });

    it('should prevent duplicate deletion requests', async () => {
      // First request
      await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Test123!@#' })
        .expect(200);

      // Second request should fail
      const response = await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Test123!@#' })
        .expect(400);

      expect(response.body.error).toBe('ALREADY_DELETING');
    });
  });

  describe('GET /api/account/status', () => {
    it('should return deletion status with days remaining', async () => {
      // Initiate deletion first
      await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Test123!@#' })
        .expect(200);

      // Check status
      const response = await request(app)
        .get('/api/account/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('daysRemaining');
      expect(response.body).toHaveProperty('scheduledDeletionDate');
      expect(typeof response.body.daysRemaining).toBe('number');
      expect(response.body.daysRemaining).toBeGreaterThan(0);
      expect(response.body.daysRemaining).toBeLessThanOrEqual(30);
    });

    it('should return not-found when no deletion requested', async () => {
      const response = await request(app)
        .get('/api/account/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'not-found');
    });
  });

  describe('POST /api/account/cancel-deletion', () => {
    it('should cancel deletion within grace period', async () => {
      // Initiate deletion
      await request(app)
        .post('/api/account/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'Test123!@#' })
        .expect(200);

      // Cancel deletion
      const response = await request(app)
        .post('/api/account/cancel-deletion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');

      // Verify deletion was cancelled
      const user = await User.findById(userId);
      expect(user?.deletionRequestedAt).toBeFalsy();
      expect(user?.deletionRequestId).toBeFalsy();
    });

    it('should fail if no deletion was requested', async () => {
      const response = await request(app)
        .post('/api/account/cancel-deletion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/account/export-data', () => {
    it('should export user data in JSON format', async () => {
      const response = await request(app)
        .post('/api/account/export-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'json',
          includeMessages: true,
          includeMatches: true,
          includeProfileData: true,
          includePreferences: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('exportId');
      expect(response.body).toHaveProperty('estimatedTime');
      expect(response.body).toHaveProperty('exportData');
      
      const data = response.body.exportData;
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('exportRequestedAt');
      expect(data).toHaveProperty('format', 'json');
    });

    it('should export user data in CSV format', async () => {
      const response = await request(app)
        .post('/api/account/export-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ format: 'csv' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('csv');
      expect(typeof response.body.csv).toBe('string');
      expect(response.body.csv).toContain('Data Type,Field,Value');
    });

    it('should allow selective data export', async () => {
      const response = await request(app)
        .post('/api/account/export-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'json',
          includeMessages: false,
          includeMatches: false,
          includeProfileData: true,
          includePreferences: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const data = response.body.exportData;
      expect(data.includes).toHaveProperty('messages', false);
      expect(data.includes).toHaveProperty('matches', false);
    });
  });
});

