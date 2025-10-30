// Jest setup file to prevent React Native setup from being loaded
// This avoids Flow syntax errors in @react-native/js-polyfills

// Mock React Native modules that might cause issues
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
}));

// Silence warnings
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
