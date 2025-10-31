import { jest, beforeEach, afterEach } from '@jest/globals';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  FileSystemUploadType: {
    BINARY_CONTENT: 'BINARY_CONTENT',
    MULTIPART: 'MULTIPART',
  },
  createUploadTask: jest.fn(() => ({
    uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
    cancelAsync: jest.fn(),
    pauseAsync: jest.fn(),
    resumeAsync: jest.fn(),
  })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
  downloadAsync: jest.fn(() => Promise.resolve({ status: 200, uri: 'file://test' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1000, uri: 'file://test' })),
  readAsStringAsync: jest.fn(() => Promise.resolve('test content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve(['file1.jpg', 'file2.png'])),
  getContentUriAsync: jest.fn(() => Promise.resolve('content://test')),
  getFreeDiskStorageAsync: jest.fn(() => Promise.resolve(1000000)),
  getTotalDiskCapacityAsync: jest.fn(() => Promise.resolve(10000000)),
}));

// Mock the animation module directly
jest.mock('./src/animation', () => ({
  DUR: { fast: 150, normal: 250, slow: 400 },
  EASE: {
    standard: jest.fn(() => (t: number) => t),
    out: jest.fn(() => (t: number) => t),
    in: jest.fn(() => (t: number) => t),
  },
  SPRING: {
    stiff: { stiffness: 300, damping: 30, mass: 0.9 },
    soft: { stiffness: 180, damping: 22, mass: 1.0 },
  },
}), { virtual: false });

// React Native is already mocked in jest.setup.preact-native.ts
// No need to mock it again here

// Import native mocks AFTER react-native is mocked
import './jest.setup.mocks.native';

// Mock theme modules BEFORE any other imports
// Use relative path since jest.mock runs before path mapping resolution
jest.mock('./src/theme', () => {
  const React = require('react');
  // Helper function to convert hex to rgba with opacity
  const alpha = (color: string, opacity: number): string => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        const r = parseInt((hex[0] ?? '0') + (hex[0] ?? '0'), 16);
        const g = parseInt((hex[1] ?? '0') + (hex[1] ?? '0'), 16);
        const b = parseInt((hex[2] ?? '0') + (hex[2] ?? '0'), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2) || '00', 16);
        const g = parseInt(hex.slice(2, 4) || '00', 16);
        const b = parseInt(hex.slice(4, 6) || '00', 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${opacity})`);
    }
    return color;
  };

  // Create light theme object
  const createLightTheme = () => ({
    scheme: 'light' as const,
    isDark: false,
    colors: {
      bg: '#ffffff',
      bgElevated: '#F8FAFC',
      surface: '#F8FAFC',
      surfaceAlt: '#F1F5F9',
      text: '#111827',
      textMuted: '#64748B',
      textSecondary: '#64748B',
      onSurface: '#111827',
      onMuted: '#64748B',
      onPrimary: '#FFFFFF',
      primary: '#2563EB',
      primaryText: '#FFFFFF',
      border: '#E2E8F0',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      error: '#EF4444',
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
    palette: {
      neutral: {
        100: '#F8FAFC',
        600: '#475569',
        800: '#1E293B',
      },
      brand: {
        500: '#64748B',
      },
      gradients: {
        primary: ['#2563EB', '#1D4ED8'],
        success: ['#10B981', '#059669'],
        danger: ['#EF4444', '#DC2626'],
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 96,
    },
    radii: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    radius: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    typography: {
      body: {
        fontSize: 16,
        size: 16,
        lineHeight: 24,
        fontWeight: '400',
        weight: '400',
      },
      h1: {
        fontSize: 32,
        size: 32,
        lineHeight: 40,
        fontWeight: '700',
        weight: '700',
      },
      h2: {
        fontSize: 24,
        size: 24,
        lineHeight: 32,
        fontWeight: '600',
        weight: '600',
      },
      h3: {
        fontSize: 20,
        size: 20,
        lineHeight: 28,
        fontWeight: '600',
        weight: '600',
      },
      caption: {
        fontSize: 12,
        size: 12,
        lineHeight: 16,
        fontWeight: '400',
        weight: '400',
      },
      bodyLarge: {
        fontSize: 18,
        size: 18,
        lineHeight: 28,
        fontWeight: '400',
        weight: '400',
      },
      bodySmall: {
        fontSize: 14,
        size: 14,
        lineHeight: 20,
        fontWeight: '400',
        weight: '400',
      },
    },
    shadows: {
      sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    },
    blur: {
      sm: 4,
      md: 8,
      lg: 16,
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },
    motion: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
    },
    utils: {
      alpha,
    },
  });

  // Create dark theme object
  const createDarkTheme = () => ({
    scheme: 'dark' as const,
    isDark: true,
    colors: {
      bg: '#0a0a0a',
      bgElevated: '#1E293B',
      surface: '#1E293B',
      surfaceAlt: '#334155',
      text: '#ffffff',
      textMuted: '#94A3B8',
      textSecondary: '#94A3B8',
      onSurface: '#ffffff',
      onMuted: '#94A3B8',
      onPrimary: '#FFFFFF',
      primary: '#2563EB',
      primaryText: '#FFFFFF',
      border: '#475569',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      error: '#EF4444',
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
    palette: {
      neutral: {
        100: '#F8FAFC',
        600: '#475569',
        800: '#1E293B',
      },
      brand: {
        500: '#64748B',
      },
      gradients: {
        primary: ['#2563EB', '#1D4ED8'],
        success: ['#10B981', '#059669'],
        danger: ['#EF4444', '#DC2626'],
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 96,
    },
    radii: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    radius: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    typography: {
      body: {
        fontSize: 16,
        size: 16,
        lineHeight: 24,
        fontWeight: '400',
        weight: '400',
      },
      h1: {
        fontSize: 32,
        size: 32,
        lineHeight: 40,
        fontWeight: '700',
        weight: '700',
      },
      h2: {
        fontSize: 24,
        size: 24,
        lineHeight: 32,
        fontWeight: '600',
        weight: '600',
      },
      h3: {
        fontSize: 20,
        size: 20,
        lineHeight: 28,
        fontWeight: '600',
        weight: '600',
      },
      caption: {
        fontSize: 12,
        size: 12,
        lineHeight: 16,
        fontWeight: '400',
        weight: '400',
      },
      bodyLarge: {
        fontSize: 18,
        size: 18,
        lineHeight: 28,
        fontWeight: '400',
        weight: '400',
      },
      bodySmall: {
        fontSize: 14,
        size: 14,
        lineHeight: 20,
        fontWeight: '400',
        weight: '400',
      },
    },
    shadows: {
      sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    },
    blur: {
      sm: 4,
      md: 8,
      lg: 16,
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },
    motion: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
    },
    utils: {
      alpha,
    },
  });

  const lightTheme = createLightTheme();

  return {
    __esModule: true,
    // Minimal no-op ThemeProvider to satisfy component rendering in tests
    ThemeProvider: ({ children }: { children?: React.ReactNode; scheme?: 'light' | 'dark' }) =>
      React.createElement(React.Fragment, null, children ?? null),
    useTheme: jest.fn(() => lightTheme),
    createTheme: (scheme: 'light' | 'dark') => {
      return scheme === 'dark' ? createDarkTheme() : createLightTheme();
    },
    getLightTheme: () => createLightTheme(),
    getDarkTheme: () => createDarkTheme(),
    getExtendedColors: jest.fn(() => ({
      bg: '#FFFFFF',
      surface: '#F8FAFC',
      onSurface: '#0F172A',
      primary: '#2563EB',
      onPrimary: '#FFFFFF',
      border: '#E2E8F0',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      text: '#0F172A',
      textMuted: '#64748B',
      bgElevated: '#F8FAFC',
      card: '#FFFFFF',
      glassWhiteLight: 'rgba(255, 255, 255, 0.1)',
      glassWhiteDark: 'rgba(255, 255, 255, 0.2)',
    })),
  };
});

jest.mock('./src/theme/adapters', () => ({
  __esModule: true,
  getExtendedColors: jest.fn((theme: any) => {
    const themeColors = (theme && typeof theme === 'object' && theme.colors) ? theme.colors : {};
    return {
      bg: themeColors.bg ?? '#FFFFFF',
      surface: themeColors.surface ?? '#F8FAFC',
      onSurface: themeColors.onSurface ?? '#0F172A',
      primary: themeColors.primary ?? '#2563EB',
      onPrimary: themeColors.onPrimary ?? '#FFFFFF',
      border: themeColors.border ?? '#E2E8F0',
      success: themeColors.success ?? '#10B981',
      warning: themeColors.warning ?? '#F59E0B',
      danger: themeColors.danger ?? '#EF4444',
      text: themeColors.text ?? '#0F172A',
      textMuted: themeColors.textMuted ?? '#64748B',
      bgElevated: themeColors.bgElevated ?? '#F8FAFC',
      card: themeColors.card ?? '#FFFFFF',
      glassWhiteLight: 'rgba(255, 255, 255, 0.1)',
      glassWhiteDark: 'rgba(255, 255, 255, 0.2)',
    };
  }),
  getThemeColors: jest.fn((theme: any) => {
    const { getExtendedColors } = require('./src/theme/adapters');
    return getExtendedColors(theme);
  }),
  getIsDark: jest.fn((theme: any) => {
    return theme && typeof theme === 'object' && (theme.scheme === 'dark' || theme.isDark === true);
  }),
}));

// Mock design tokens
jest.mock('@pawfectmatch/design-tokens', () => ({
  __esModule: true,
  COLORS: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    success: {
      500: '#10b981',
    },
    warning: {
      500: '#f59e0b',
    },
    error: {
      500: '#ef4444',
    },
    info: {
      500: '#3b82f6',
    },
  },
  SPACING: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  RADIUS: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  createTheme: jest.fn(() => ({})),
}));

// Import services pre-setup to ensure mocks are loaded before modules
import './jest.setup.services.pre';

// Mock axios BEFORE any services import it
jest.mock('axios', () => {
  // Create interceptors with proper structure
  const requestInterceptors: Array<{ fulfilled?: (config: any) => any; rejected?: (error: any) => any }> = [];
  const responseInterceptors: Array<{ fulfilled?: (response: any) => any; rejected?: (error: any) => any }> = [];

  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    post: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    put: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    request: jest.fn(() => Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: {} })),
    interceptors: {
      request: {
        use: jest.fn((fulfilled?: any, rejected?: any) => {
          const id = requestInterceptors.length;
          requestInterceptors.push({ fulfilled, rejected });
          return id;
        }),
        eject: jest.fn((id: number) => {
          if (id < requestInterceptors.length) {
            requestInterceptors.splice(id, 1);
          }
        }),
        clear: jest.fn(() => {
          requestInterceptors.length = 0;
        }),
      },
      response: {
        use: jest.fn((fulfilled?: any, rejected?: any) => {
          const id = responseInterceptors.length;
          responseInterceptors.push({ fulfilled, rejected });
          return id;
        }),
        eject: jest.fn((id: number) => {
          if (id < responseInterceptors.length) {
            responseInterceptors.splice(id, 1);
          }
        }),
        clear: jest.fn(() => {
          responseInterceptors.length = 0;
        }),
      },
    },
    defaults: {
      headers: {
        common: {},
        get: {},
        post: {},
        put: {},
        patch: {},
        delete: {},
      },
    },
    // Expose interceptors for testing
    __requestInterceptors: requestInterceptors,
    __responseInterceptors: responseInterceptors,
  };

  // Mock AxiosHeaders class
  class MockAxiosHeaders {
    private headers: Record<string, string> = {};
    set(key: string, value: string) {
      this.headers[key] = value;
      return this;
    }
    get(key: string) {
      return this.headers[key];
    }
    has(key: string) {
      return key in this.headers;
    }
    delete(key: string) {
      delete this.headers[key];
      return this;
    }
  }

  const axios: any = jest.fn(() => mockAxiosInstance);
  axios.create = jest.fn(() => mockAxiosInstance);
  axios.default = axios;
  axios.Cancel = jest.fn();
  axios.CancelToken = {
    source: jest.fn(() => ({
      token: {},
      cancel: jest.fn(),
    })),
  };
  axios.isCancel = jest.fn(() => false);
  axios.all = jest.fn(Promise.all.bind(Promise));
  axios.spread = jest.fn((callback: any) => (arr: any[]) => callback(...arr));
  axios.AxiosHeaders = MockAxiosHeaders as any;
  axios.AxiosError = class AxiosError extends Error {
    constructor(message: string, code?: string, config?: any, request?: any, response?: any) {
      super(message);
      this.name = 'AxiosError';
      (this as any).code = code;
      (this as any).config = config;
      (this as any).request = request;
      (this as any).response = response;
    }
    isAxiosError = true;
  };
  
  return axios;
});

// Note: @react-native-community/accessibility doesn't exist as a package
// AccessibilityInfo is available from react-native, which is already mocked
// If tests need accessibility mocking, use react-native's AccessibilityInfo

// Mock React Native - already mocked in jest.setup.preact-native.ts
// Keep this comment for reference but don't mock again to avoid conflicts

// Silence noisy RN timers etc. when needed
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (objs: any) => objs.ios
}));

// Ensure React 18 act semantics
// This flag tells React 18 test renderer to wrap updates in act.
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Fetch for tests that call network
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder for Node environment
const { TextEncoder, TextDecoder } = require('util') as any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Deterministic time + timers
// Set timezone to UTC for deterministic tests
process.env.TZ = process.env.TZ || 'UTC';

// Use fake timers for deterministic test execution
// Only use fake timers if explicitly requested by tests
// This prevents issues with async operations and waitFor
// Individual tests can call jest.useFakeTimers() if needed
// jest.useFakeTimers({ legacyFakeTimers: false });
// jest.setSystemTime(new Date('2024-01-01T00:00:00Z') as unknown as number);

// Deterministic RNG using seeded random number generator
// This matches the seeded RNG pattern: Linear Congruential Generator
const seed = Number(process.env['TEST_SEED'] || 1337);
let s = seed;
Math.random = () => {
  // LCG: (a * seed + c) mod m
  // Using constants from Numerical Recipes
  s = (s * 16807) % 2147483647;
  return s / 2147483647;
};

// RN Reanimated comprehensive mock - SINGLE SOURCE OF TRUTH
// All test files should use this mock from jest.setup.ts
// Do not add Reanimated mocks in individual test files
jest.mock('react-native-reanimated', () => {
  
  // Create a complete mock without using the broken official mock
  const mockReanimated = {
    Value: jest.fn(() => ({ setValue: jest.fn(), _value: 0 })),
    event: jest.fn(() => jest.fn()),
    add: jest.fn(() => ({ _value: 0 })),
    sub: jest.fn(() => ({ _value: 0 })),
    multiply: jest.fn(() => ({ _value: 0 })),
    divide: jest.fn(() => ({ _value: 0 })),
    eq: jest.fn(() => ({ _value: 0 })),
    neq: jest.fn(() => ({ _value: 0 })),
    greaterThan: jest.fn(() => ({ _value: 0 })),
    greaterOrEq: jest.fn(() => ({ _value: 0 })),
    lessThan: jest.fn(() => ({ _value: 0 })),
    lessOrEq: jest.fn(() => ({ _value: 0 })),
    and: jest.fn(() => ({ _value: 0 })),
    or: jest.fn(() => ({ _value: 0 })),
    cond: jest.fn(() => ({ _value: 0 })),
    set: jest.fn(() => ({ _value: 0 })),
    call: jest.fn(() => ({ _value: 0 })),
    debug: jest.fn(() => ({ _value: 0 })),
    interpolate: jest.fn((value: any, inputRange?: any[], outputRange?: any[]) => {
      if (typeof value !== 'number' || !Array.isArray(inputRange) || !Array.isArray(outputRange)) {
        return value ?? 0;
      }
      if (inputRange.length < 2 || outputRange.length < 2 || inputRange[0] === inputRange[1]) {
        return outputRange[0] ?? value ?? 0;
      }
      const ratio = (value - inputRange[0]) / (inputRange[1] - inputRange[0]);
      return outputRange[0] + ratio * (outputRange[1] - outputRange[0]);
    }),
    concat: jest.fn(() => ({ _value: 0 })),
    useSharedValue: jest.fn((init: any) => ({ value: typeof init === 'number' ? init : (init?.value ?? 0), setValue: jest.fn() })),
    useAnimatedStyle: jest.fn((callback?: () => any) => {
      if (typeof callback === 'function') {
        try {
          return callback() || {};
        } catch {
          return {};
        }
      }
      return {};
    }),
    useAnimatedProps: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    createAnimatedComponent: jest.fn((component: any) => {
      const React = require('react');
      return React.forwardRef((props: any, ref: any) => {
        const { children, ...restProps } = props;
        return React.createElement(component, { ...restProps, ref }, children);
      });
    }),
    withSpring: jest.fn((value: any) => value),
    withTiming: jest.fn((value: any) => value),
    withDecay: jest.fn(() => ({ _value: 0 })),
    withRepeat: jest.fn(() => ({ _value: 0 })),
    withSequence: jest.fn(() => ({ _value: 0 })),
    withDelay: jest.fn(() => ({ _value: 0 })),
    runOnUI: jest.fn((fn) => fn),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
      linear: jest.fn((t: number) => t),
      ease: jest.fn((t: number) => t),
      quad: jest.fn((t: number) => t * t),
      cubic: jest.fn((t: number) => t * t * t),
      poly: jest.fn((n: number) => (t: number) => Math.pow(t, n)),
      sin: jest.fn((t: number) => 1 - Math.cos((t * Math.PI) / 2)),
      circle: jest.fn((t: number) => 1 - Math.sqrt(1 - t * t)),
      exp: jest.fn((t: number) => Math.pow(2, 10 * (t - 1))),
      elastic: jest.fn((bounciness: number) => {
        const p = bounciness * Math.PI;
        return (t: number) => 1 - Math.pow(Math.cos((t * Math.PI * 2) / p), 3);
      }),
      back: jest.fn((overshoot: number) => {
        return (t: number) => {
          const s = overshoot || 1.70158;
          return t * t * ((s + 1) * t - s);
        };
      }),
      bounce: jest.fn((t: number) => {
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      }),
      bezier: jest.fn((x1: number, y1: number, x2: number, y2: number) => {
        // Simple bezier mock - returns a function that approximates bezier curve
        return (t: number) => {
          // Cubic bezier approximation
          const cx = 3 * x1;
          const bx = 3 * (x2 - x1) - cx;
          const ax = 1 - cx - bx;
          const cy = 3 * y1;
          const by = 3 * (y2 - y1) - cy;
          const ay = 1 - cy - by;
          
          const x = ax * t * t * t + bx * t * t + cx * t;
          return ay * x * x * x + by * x * x + cy * x;
        };
      }),
      in: jest.fn((easing: (t: number) => number) => easing),
      out: jest.fn((easing: (t: number) => number) => {
        return (t: number) => 1 - easing(1 - t);
      }),
      inOut: jest.fn((easing: (t: number) => number) => {
        return (t: number) => {
          if (t < 0.5) {
            return easing(2 * t) / 2;
          } else {
            return 1 - easing(2 * (1 - t)) / 2;
          }
        };
      }),
    },
  };
  
  // Create Animated object with View component
  const React = require('react');
  // Use actual react-native View from the mock
  let RNView: any;
  let RNScrollView: any;
  try {
    const RN = require('react-native');
    RNView = RN.View || 'View';
    RNScrollView = RN.ScrollView || 'ScrollView';
  } catch {
    // Fallback if react-native isn't available
    RNView = 'View';
    RNScrollView = 'ScrollView';
  }
  
  // Create Animated.View as a proper component with displayName for test detection
  const AnimatedView = typeof RNView === 'string' 
    ? RNView // If View is a string, use it directly
    : React.forwardRef((props: any, ref: any) => {
        const { children, ...restProps } = props;
        return React.createElement(RNView, { ...restProps, ref }, children);
      });
  if (typeof AnimatedView !== 'string') {
    AnimatedView.displayName = 'Animated.View';
    // Also set a test-friendly name for UNSAFE_getByType
    if (AnimatedView.type) {
      AnimatedView.type.displayName = 'Animated.View';
    }
  }
  
  // Build Animated object - View must come AFTER spread to not be overwritten
  const Animated = {
    ...mockReanimated,
    // View, Text, etc. must come AFTER spread to ensure they're not overwritten
    View: AnimatedView,
    Text: RNView,
    ScrollView: RNScrollView,
    FlatList: RNView,
    Image: RNView,
    // Ensure createAnimatedComponent is available
    createAnimatedComponent: mockReanimated.createAnimatedComponent,
  };
  
  // Add all React Native components that reanimated exports
  // Export interpolate, withTiming, etc. both as named exports and on Animated
  return {
    ...mockReanimated,
    View: AnimatedView,
    Text: 'Text',
    ScrollView: Animated.ScrollView,
    FlatList: 'FlatList',
    Image: 'Image',
    // Named exports for direct imports
    interpolate: mockReanimated.interpolate,
    withTiming: mockReanimated.withTiming,
    withSpring: mockReanimated.withSpring,
    useSharedValue: mockReanimated.useSharedValue,
    useAnimatedStyle: mockReanimated.useAnimatedStyle,
    // Default export with all properties (Animated.View should be available here)
    default: Animated,
  };
});

// Silence useNativeDriver warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Gesture Handler mock with GestureHandlerRootView (per specification)
jest.mock('react-native-gesture-handler', () => {
  const RN = require('react-native');
  return {
    ...RN,
    GestureHandlerRootView: ({ children }: any) => children,
  };
});

// Expo Haptics: no-op (assert calls via mocks)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock UI Config service - match the relative import path used in Provider.tsx
jest.mock('./src/services/uiConfig', () => {
  const { getLightTheme } = require('./src/theme/resolve');
  return {
    useUIConfig: jest.fn(() => ({
      config: null,
      isLoading: false,
      error: null,
      refresh: jest.fn(async () => {}),
      version: '1.0.0',
      status: 'ready',
    })),
    configToTheme: jest.fn((_config, _scheme) => {
      // Return theme from resolve module
      return getLightTheme();
    }),
  };
});

// Common native/Expo modules
// react-native-safe-area-context mock (per specification)
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: { 
      frame: { x: 0, y: 0, width: 0, height: 0 }, 
      insets: { top: 0, bottom: 0, left: 0, right: 0 } 
    }
  };
});

// Expo modules mock (prevent NativeUnimoduleProxy errors)
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  EventEmitter: class MockEventEmitter {
    addListener() {}
    removeListener() {}
    removeAllListeners() {}
  },
  requireNativeViewManager: jest.fn(() => ({})),
  requireNativeModule: jest.fn(() => ({})),
  createPermissionHook: jest.fn(() => () => [{ status: 'granted' }, jest.fn()]),
}));

// Mock expo-font to prevent font loading issues
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(async () => undefined),
  isLoaded: jest.fn(() => true),
  FontSource: {
    GoogleSans: {},
  },
}));

// Mock @react-native-async-storage/async-storage with deterministic behavior
// Create a shared storage state that persists across mock calls but resets per test
const createAsyncStorageMock = () => {
  const storage: Record<string, string> = {};
  
  const mock = {
    getItem: jest.fn((key: string) => {
      return Promise.resolve(storage[key] || null);
    }),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(storage));
    }),
    multiGet: jest.fn((keys: string[]) => {
      return Promise.resolve(keys.map(key => [key, storage[key] || null]));
    }),
    multiSet: jest.fn((entries: Array<[string, string]>) => {
      entries.forEach(([key, value]) => {
        storage[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete storage[key]);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
      return Promise.resolve();
    }),
    // Expose storage and cleanup for test management
    __storage: storage,
    __clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
  };
  
  return mock;
};

// Rename to mockAsyncStorage (with "mock" prefix) so Jest allows it in jest.mock() factory
const mockAsyncStorage = createAsyncStorageMock();

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  const mockNetInfoState = {
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true,
    details: null,
  };

  return {
    __esModule: true,
    default: {
      fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      configure: jest.fn(),
      getCurrentState: jest.fn(() => Promise.resolve(mockNetInfoState)),
    },
    NetInfoStateType: {
      unknown: 'unknown',
      none: 'none',
      cellular: 'cellular',
      wifi: 'wifi',
      bluetooth: 'bluetooth',
      ethernet: 'ethernet',
      wimax: 'wimax',
      vpn: 'vpn',
      other: 'other',
    },
  };
});

// Expo modules are mocked in jest.setup.mocks.expo.ts (loaded earlier)

jest.mock('expo-linear-gradient', () => 'LinearGradient');

// Mock @expo/vector-icons BEFORE any component imports it
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const RN = require('react-native');
  
  // Prevent native module access by mocking the ensure-native-module-available
  // This prevents RNVectorIconsManager errors
  const createIconComponent = (name: string) => {
    return React.forwardRef((props: any, ref: any) => {
      const { name: iconName, size, color, testID, ...restProps } = props;
      return React.createElement(
        RN.View,
        {
          testID: testID || `icon-${name}-${iconName}`,
          accessibilityLabel: iconName,
          'data-name': iconName,
          'data-size': size,
          'data-color': color,
          ref: ref,
          ...restProps,
        }
      );
    });
  };
  
  return {
    Ionicons: createIconComponent('Ionicons'),
    MaterialIcons: createIconComponent('MaterialIcons'),
    MaterialCommunityIcons: createIconComponent('MaterialCommunityIcons'),
    FontAwesome: createIconComponent('FontAwesome'),
    FontAwesome5: createIconComponent('FontAwesome5'),
    Feather: createIconComponent('Feather'),
    AntDesign: createIconComponent('AntDesign'),
    Entypo: createIconComponent('Entypo'),
    EvilIcons: createIconComponent('EvilIcons'),
    Fontisto: createIconComponent('Fontisto'),
    Foundation: createIconComponent('Foundation'),
    Octicons: createIconComponent('Octicons'),
    SimpleLineIcons: createIconComponent('SimpleLineIcons'),
    Zocial: createIconComponent('Zocial'),
  };
});

// Mock expo-blur to avoid Native module errors in tests
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children ?? null,
}));

jest.mock('expo-av', () => ({
  Audio: {},
  Video: {},
}));

jest.mock('expo-camera', () => ({
  Camera: {},
  CameraType: {},
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
  MediaTypeOptions: {
    Images: 'images',
    Videos: 'videos',
    All: 'all',
  },
  ImagePickerOptions: {},
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: null,
      accuracy: 10,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve(null)),
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationActivityType: {
    Other: 1,
    AutomotiveNavigation: 2,
    Fitness: 3,
    OtherNavigation: 4,
    Airborne: 5,
  },
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturerName: 'Apple',
  modelName: 'iPhone',
  modelId: 'iPhone13,2',
  designName: 'iPhone',
  productName: 'iPhone',
  deviceYearClass: 2021,
  totalMemory: 4096,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '15.0',
  osBuildId: '19A346',
  osInternalBuildId: '19A346',
  osBuildFingerprint: '',
  platformApiLevel: null,
  deviceName: 'iPhone',
  deviceType: 1,
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'expo-push-token' })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  NotificationPermissionsStatus: {
    UNDETERMINED: 'undetermined',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  AndroidImportance: {
    DEFAULT: 'default',
    HIGH: 'high',
    MAX: 'max',
    LOW: 'low',
    MIN: 'min',
    NONE: 'none',
    UNSPECIFIED: 'unspecified',
  },
}));

// Mock react-native-device-info
// Removed - package not installed

// Mock Metro bundler
jest.mock('metro-react-native-babel-preset');

// Mock Sentry to prevent ES module issues
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  addIntegration: jest.fn(),
  captureException: jest.fn(),
  captureEvent: jest.fn(),
  captureFeedback: jest.fn(),
  captureMessage: jest.fn(),
  Scope: jest.fn(),
  setContext: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setUser: jest.fn(),
  startInactiveSpan: jest.fn(),
  startSpan: jest.fn(),
  startSpanManual: jest.fn(),
  getActiveSpan: jest.fn(),
  getRootSpan: jest.fn(),
  withActiveSpan: jest.fn(),
  suppressTracing: jest.fn(),
  spanToJSON: jest.fn(),
  spanIsSampled: jest.fn(),
  setMeasurement: jest.fn(),
  getCurrentScope: jest.fn(),
  getGlobalScope: jest.fn(),
  getIsolationScope: jest.fn(),
  getClient: jest.fn(),
  setCurrentClient: jest.fn(),
  addEventProcessor: jest.fn(),
  lastEventId: jest.fn(),
}));

// Mock expo-secure-store - must be before other mocks that use it
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  whenAvailable: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
    ALWAYS: 'ALWAYS',
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  FileSystemUploadType: {
    BINARY_CONTENT: 'BINARY_CONTENT',
    MULTIPART: 'MULTIPART',
  },
  createUploadTask: jest.fn(() => ({
    uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
    cancelAsync: jest.fn(),
    pauseAsync: jest.fn(),
    resumeAsync: jest.fn(),
  })),
  uploadAsync: jest.fn(() => Promise.resolve({ status: 200, body: '{"key": "test-key"}' })),
  downloadAsync: jest.fn(() => Promise.resolve({ status: 200, uri: 'file://test' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1000, uri: 'file://test' })),
  readAsStringAsync: jest.fn(() => Promise.resolve('test content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve(['file1.jpg', 'file2.png'])),
  getContentUriAsync: jest.fn(() => Promise.resolve('content://test')),
  getFreeDiskStorageAsync: jest.fn(() => Promise.resolve(1000000)),
  getTotalDiskCapacityAsync: jest.fn(() => Promise.resolve(10000000)),
}));
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({
    exists: true,
    isDirectory: false,
    size: 1024,
    uri: 'file://mocked-uri',
  })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve(['file1.jpg', 'file2.png'])),
  documentDirectory: 'file://mocked/documents/',
  cacheDirectory: 'file://mocked/cache/',
}));

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(() => Promise.resolve({
    uri: 'mocked-image-uri',
    width: 100,
    height: 100,
  })),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// ✅ Biometric mock (covers all calls your tests use)
jest.mock('expo-local-authentication', () => {
  const AuthenticationType = {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  } as const;

  const SecurityLevel = {
    NONE: 0,
    SECRET: 1,
    BIOMETRIC: 2,
  } as const;

  // Mutable state so each test can tweak behavior
  const __state = {
    hasHardware: true,
    enrolled: true,
    types: [AuthenticationType.FACIAL_RECOGNITION],
    level: SecurityLevel.BIOMETRIC,
    authResult: { success: true },
  };

  return {
    AuthenticationType,
    SecurityLevel,
    hasHardwareAsync: jest.fn(() => Promise.resolve(__state.hasHardware)),
    isEnrolledAsync: jest.fn(() => Promise.resolve(__state.enrolled)),
    supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve(__state.types)),
    getEnrolledLevelAsync: jest.fn(() => Promise.resolve(__state.level)),
    authenticateAsync: jest.fn(() => Promise.resolve(__state.authResult)),
    cancelAuthenticate: jest.fn(() => Promise.resolve()),

    // test-only helpers (cast to any in tests if TS complains)
    __setState: (patch: Partial<typeof __state>) => Object.assign(__state, patch),
    __getState: () => ({ ...__state }),
  };
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  setInternetCredentials: jest.fn(() => Promise.resolve(true)),
  getInternetCredentials: jest.fn(() => Promise.resolve(false)),
  resetInternetCredentials: jest.fn(() => Promise.resolve(true)),
  canImplyAuthentication: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  ACCESS_CONTROL: {},
  ACCESSIBLE: {},
  SECURITY_LEVEL: {},
  AUTHENTICATION_TYPE: {},
  BIOMETRY_TYPE: {},
}));

// Mock react-native-aes-crypto
jest.mock('react-native-aes-crypto', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  generateKey: jest.fn(),
  hash: jest.fn(),
}));

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock @react-native-masked-view/masked-view (required by react-navigation)
jest.mock('@react-native-masked-view/masked-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    default: React.forwardRef((props: any, ref: any) => React.createElement(View, { ...props, ref })) as any,
  };
});

// Mock react-navigation/elements native view manager
jest.mock('@react-navigation/elements', () => {
  const { View } = require('react-native');
  return {
    ...((jest as any).requireActual('@react-navigation/elements') || {}),
    MaskedView: View,
    MaskedViewNative: {
      getViewManagerConfig: jest.fn(() => ({})),
    },
  };
});

// Navigation helpers - use jest.fn() so tests can call mockReturnValue
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native') as typeof import('@react-navigation/native');
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockDispatch = jest.fn();
  const mockReset = jest.fn();
  const mockSetOptions = jest.fn();
  const mockAddListener = jest.fn(() => () => {});
  const mockRemoveListener = jest.fn();
  const mockUseIsFocused = jest.fn(() => true);
  const mockUseNavigationState = jest.fn(() => null);
  
  // Create a navigation ref for testing
  const navigationRef = {
    current: {
      navigate: mockNavigate,
      goBack: mockGoBack,
      dispatch: mockDispatch,
      reset: mockReset,
      setOptions: mockSetOptions,
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
      canGoBack: jest.fn(() => true),
      getParent: jest.fn(),
      getState: jest.fn(() => ({})),
      isFocused: jest.fn(() => true),
      getId: jest.fn(() => 'test-navigation-id'),
      getRootState: jest.fn(() => ({})),
    },
  };
  
  return {
    ...actual,
    useNavigation: jest.fn(() => navigationRef.current),
    useNavigationState: mockUseNavigationState,
    useIsFocused: mockUseIsFocused,
    useRoute: jest.fn(() => ({
      name: 'TestScreen',
      key: 'test-key',
      params: {},
      path: '/test',
    })),
    useFocusEffect: jest.fn((callback: any) => {
      // Execute callback immediately and on focus
      if (typeof callback === 'function') {
        callback();
      }
      return () => {}; // Return cleanup function
    }),
    NavigationContainer: ({ children }: any) => children,
    useNavigationContainerRef: jest.fn(() => navigationRef),
    createNavigationContainerRef: jest.fn(() => navigationRef),
    // Expose mocks for test customization
    __mockNavigate: mockNavigate,
    __mockGoBack: mockGoBack,
    __mockDispatch: mockDispatch,
    __mockReset: mockReset,
  } as unknown as typeof import('@react-navigation/native');
});

// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  return {
    createStackNavigator: jest.fn(() => ({
      Navigator: ({ children }: any) => React.createElement(React.Fragment, null, children),
      Screen: ({ children }: any) => children || null,
    })),
    CardStyleInterpolators: {
      forHorizontalIOS: jest.fn(),
      forVerticalIOS: jest.fn(),
      forModalPresentationIOS: jest.fn(),
    },
    TransitionPresets: {
      SlideFromRightIOS: {},
      ModalSlideFromBottomIOS: {},
      ModalPresentationIOS: {},
    },
    HeaderStyleInterpolators: {
      forUIKit: jest.fn(),
    },
  };
});

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: jest.fn(() => ({
      Navigator: ({ children }: any) => React.createElement(React.Fragment, null, children),
      Screen: ({ children }: any) => children || null,
    })),
  };
});

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: jest.fn(() => ({
      Navigator: ({ children }: any) => React.createElement(React.Fragment, null, children),
      Screen: ({ children }: any) => children || null,
    })),
  };
});

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBarStyle: jest.fn(),
  setHidden: jest.fn(),
  setBackgroundColor: jest.fn(),
  setTranslucent: jest.fn(),
  setNetworkActivityIndicatorVisible: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn((dimension: string) => {
    if (dimension === 'window') {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    if (dimension === 'screen') {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    return {};
  }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: jest.fn((callback) => {
    if (typeof callback === 'function') {
      callback();
    }
    return { then: jest.fn() };
  }),
  createInteractionHandle: jest.fn(() => 1),
  clearInteractionHandle: jest.fn(),
  setDeadline: jest.fn(),
}));

// Mock useReducedMotion hook - exports useReduceMotion (without 'd')
jest.mock('./src/hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
  useReducedMotion: jest.fn(() => false), // Also export for backward compatibility
}));

// Mock @pawfectmatch/core
jest.mock('@pawfectmatch/core', () => {
  const buildSuccess = <T = unknown>(data: T): Promise<{ success: true; data: T }> =>
    Promise.resolve({ success: true, data });

  const apiClient = {
    get: jest.fn((..._args: unknown[]) => buildSuccess({})),
    post: jest.fn((..._args: unknown[]) => buildSuccess({})),
    put: jest.fn((..._args: unknown[]) => buildSuccess({})),
    patch: jest.fn((..._args: unknown[]) => buildSuccess({})),
    delete: jest.fn((..._args: unknown[]) => buildSuccess({})),
  };

  return {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
    useAuthStore: jest.fn(() => ({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    })),
    apiClient,
  };
});

// Do not globally mock services/api so unit tests exercise real implementations.

// Mock stores/useAuthStore
jest.mock('./src/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: {
      _id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  })),
}));

// Mock Animated.js
jest.mock('./__mocks__/Animated.js', () => ({
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    decay: jest.fn(() => ({ start: jest.fn() })),
  },
}), { virtual: true });

// Mock performance-validation
jest.mock('./src/foundation/performance-validation.ts', () => ({
  PerformanceMetricsCollector: jest.fn(),
  validateBundleSize: jest.fn(),
  validateMemoryUsage: jest.fn(),
  validateAnimationDuration: jest.fn(),
  usePerformanceMonitor: jest.fn(() => ({
    metrics: {},
    isMonitoring: false,
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
  })),
}));

// Global test utilities
(global as any).__DEV__ = true;

// Silence console warnings in tests unless debugging
if (!process.env['DEBUG_TESTS']) {
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Mock fetch for API calls
(global as any).fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  } as Response)
) as any;

// Mock socket.io-client with a basic mock that tests can override
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
    id: 'test-socket-id',
    connected: true,
    disconnected: false,
    auth: {},
    io: {
      uri: 'http://localhost:3001',
    },
  };
  
  const io = jest.fn(() => mockSocket);
  
  return {
    io,
    Socket: jest.fn(),
  };
});

// Setup test environment
beforeEach(() => {
  (jest as any).clearAllMocks();
  // Reset AsyncStorage mock state to ensure clean state per test
  const asyncStorageMock = require('@react-native-async-storage/async-storage');
  if (asyncStorageMock && asyncStorageMock.__clear) {
    asyncStorageMock.__clear();
  }
});

// Ensure async operations complete before tests finish
afterEach(() => {
  // Clear any pending timers if fake timers are in use
  if (jest.isMockFunction(setTimeout)) {
    jest.clearAllTimers();
  }
  // Note: Async cleanup should be handled in individual tests if needed
});

// Extend expect with React Native matchers after all mocks are set up
import '@testing-library/jest-native/extend-expect';
