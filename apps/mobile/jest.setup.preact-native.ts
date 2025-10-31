/**
 * Pre-setup for React Native mocks
 * This file runs BEFORE jest.setup.ts to ensure react-native is mocked
 * before any modules are imported
 */

// Mock React Native FIRST - Jest will automatically use __mocks__/react-native.js
// This ensures StyleSheet and Dimensions are available when modules are evaluated
jest.mock('react-native');

