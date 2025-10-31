/**
 * ErrorBoundary Component Tests
 * Tests basic error boundary functionality
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { act } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

jest.mock('@pawfectmatch/core', () => ({
  logger: mockLogger,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize without errors', () => {
    expect(() => {
      const boundary = new ErrorBoundary({ children: React.createElement('div', {}, 'test') });
      expect(boundary).toBeDefined();
    }).not.toThrow();
  });

  it('should call logger when catching errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const boundary = new ErrorBoundary({ children: React.createElement('div', {}, 'test') });

    const error = new Error('Test error');
    const errorInfo = { componentStack: 'test stack' };

    // Simulate componentDidCatch
    boundary.componentDidCatch(error, errorInfo);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error caught by ErrorBoundary',
      expect.objectContaining({
        error,
        errorInfo,
        screenName: undefined,
      })
    );

    consoleError.mockRestore();
  });

  it('should handle logger errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const loggerError = jest.spyOn(mockLogger, 'error').mockImplementation(() => {
      throw new Error('Logger error');
    });

    const boundary = new ErrorBoundary({ children: React.createElement('div', {}, 'test') });
    const error = new Error('Test error');

    expect(() => {
      boundary.componentDidCatch(error, { componentStack: 'test' });
    }).not.toThrow();

    consoleError.mockRestore();
    loggerError.mockRestore();
  });

  it('should update state when error occurs', () => {
    const boundary = new ErrorBoundary({ children: React.createElement('div', {}, 'test') });

    const error = new Error('Test error');

    // Simulate getDerivedStateFromError
    const newState = ErrorBoundary.getDerivedStateFromError(error);

    expect(newState).toEqual({
      hasError: true,
      error,
    });
  });

  it('should initialize with no error state', () => {
    const boundary = new ErrorBoundary({ children: React.createElement('div', {}, 'test') });

    expect(boundary.state).toEqual({ hasError: false });
  });

  it('should accept screenName prop', () => {
    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      screenName: 'TestScreen'
    });

    expect(boundary.props.screenName).toBe('TestScreen');
  });

  it('should accept fallback prop', () => {
    const fallback = React.createElement('div', {}, 'Custom fallback');
    const boundary = new ErrorBoundary({
      children: React.createElement('div', {}, 'test'),
      fallback
    });

    expect(boundary.props.fallback).toBe(fallback);
  });
});
