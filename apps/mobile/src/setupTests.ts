import "@testing-library/jest-native/extend-expect";
import type { ReactNode } from "react";

// Declare global variables and types for tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAnimatedStyle: (style: object) => R;
      toBeReanimated: (value: number) => R;
    }
  }
}

// All mocks are consolidated in jest.setup.ts
// This file is reserved for @testing-library/jest-native extensions and custom matchers
// No global timer setup - each test manages its own timers

// @ts-expect-error - jest globals are defined by jest environment
beforeAll(() => {
  // Global setup if needed
});

// @ts-expect-error - jest globals are defined by jest environment
afterEach(() => {
  // @ts-expect-error - jest.clearAllMocks is defined by jest
  jest.clearAllMocks();
  // Note: Timer cleanup is handled in jest.setup.ts globally
});
