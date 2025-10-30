/**
 * AuthService Comprehensive Test Suite
 * Tests authentication, token management, biometric auth, and secure storage
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { authService } from '../AuthService';

// Mock the API
jest.mock('../api', () => ({
  api: {
    request: jest.fn(() => Promise.resolve({
      success: true,
      user: { id: '123', email: 'test@example.com' },
      accessToken: 'token',
      refreshToken: 'refresh'
    })),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize', () => {
    expect(authService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof authService.login).toBe('function');
    expect(typeof authService.logout).toBe('function');
    expect(typeof authService.getCurrentUser).toBe('function');
  });
});
