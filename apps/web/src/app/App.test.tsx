import React from 'react';
import { render } from '@testing-library/react';

// Mock all the complex dependencies
jest.mock('../services/feedbackService', () => ({
  feedbackService: {
    initialize: jest.fn(),
    playSound: jest.fn(),
    vibrate: jest.fn(),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({ user: null, loading: false }),
}));

jest.mock('../contexts/SocketContext', () => ({
  SocketProvider: ({ children }: any) => <div data-testid="socket-provider">{children}</div>,
}));

test('App component exists', () => {
  // Simple test to verify the App component can be imported
  const App = require('./App').default;
  expect(App).toBeDefined();
});
