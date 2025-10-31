/**
 * Jest mocks for hooks used in component tests
 * Fixes hook dependencies for isolated component testing
 */

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getParent: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    colors: {
      bg: '#ffffff',
      bgElevated: '#f5f5f5',
      text: '#000000',
      textMuted: '#666666',
      primary: '#007AFF',
      primaryText: '#ffffff',
      border: '#e0e0e0',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      onPrimary: '#ffffff',
      onSurface: '#000000',
      onMuted: '#666666',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 80,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    motion: {
      springs: {
        bouncy: { damping: 8, stiffness: 300, mass: 1 },
      },
      timings: {
        fast: 200,
        normal: 300,
        slow: 500,
      },
    },
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Feature Gate
jest.mock('../../hooks/domains/premium/useFeatureGate', () => ({
  useFeatureGate: jest.fn(() => ({
    checkAccess: jest.fn().mockResolvedValue(true),
    requestAccess: jest.fn().mockResolvedValue(undefined),
    canUse: true,
    isLoading: false,
    remaining: 5, // Mock remaining Super Likes
  })),
}));
