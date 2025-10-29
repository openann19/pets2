import '@testing-library/jest-native/extend-expect';
import type { ReactNode } from 'react';

// Jest globals are available in test environment
declare const beforeAll: (fn: () => void) => void;
declare const afterEach: (fn: () => void) => void;

// All mocks are consolidated in jest.setup.ts
// This file is reserved for @testing-library/jest-native extensions and custom matchers
// No global timer setup - each test manages its own timers

beforeAll(() => {
  // Global setup if needed
});

afterEach(() => {
  // Note: Timer cleanup is handled in jest.setup.ts globally
  // clearAllMocks is available in jest.setup.ts where jest is properly typed
});
