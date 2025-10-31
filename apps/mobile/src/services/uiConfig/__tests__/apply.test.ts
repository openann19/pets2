/**
 * 🎛️ UI Config - Apply Tests
 * Tests for config application and safety guards
 */

import {
  configToTheme,
  getMotionConfig,
  shouldRespectReducedMotion,
  getLowEndDevicePolicy,
  applyMicroInteractionGuards,
} from '../apply';
import { getDefaultUIConfig, type UIConfig } from '@pawfectmatch/core';
import { useReduceMotion } from '../../../hooks/useReducedMotion';
import { isLowEndDevice } from '../utils/motionGuards';

jest.mock('@pawfectmatch/core', () => ({
  getDefaultUIConfig: jest.fn(() => ({
    version: '2025.01.27',
    status: 'prod',
    audience: { env: 'prod', pct: 100 },
    tokens: {
      colors: {
        bg: '#FFFFFF',
        surface: '#F2F2F7',
        overlay: '#00000080',
        border: '#C6C6C8',
        onBg: '#000000',
        onSurface: '#000000',
        onMuted: '#8E8E93',
        primary: '#007AFF',
        onPrimary: '#FFFFFF',
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        info: '#007AFF',
      },
      palette: {
        gradients: {
          primary: ['#007AFF', '#5856D6'],
          success: ['#34C759', '#30D158'],
          danger: ['#FF3B30', '#FF453A'],
          warning: ['#FF9500', '#FF9F0A'],
          info: ['#007AFF', '#64D2FF'],
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
        '4xl': 80,
      },
      radii: {
        none: 0,
        xs: 2,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 20,
        pill: 9999,
        full: 9999,
      },
      typography: {
        scale: {
          caption: { size: 12, lineHeight: 16, weight: '400' },
          body: { size: 16, lineHeight: 24, weight: '400' },
          h4: { size: 18, lineHeight: 28, weight: '600' },
          h3: { size: 20, lineHeight: 32, weight: '600' },
          h2: { size: 24, lineHeight: 36, weight: '700' },
          h1: { size: 32, lineHeight: 48, weight: '700' },
        },
      },
      motion: {
        duration: {
          xfast: 100,
          fast: 200,
          base: 300,
          slow: 500,
          xslow: 700,
        },
        easing: {
          standard: [0.25, 0.46, 0.45, 0.94],
          emphasized: [0.05, 0.7, 0.1, 1.0],
          decel: [0.0, 0.0, 0.2, 1.0],
          accel: [0.3, 0.0, 1.0, 1.0],
        },
        scale: {
          pressed: 0.95,
          lift: 1.05,
        },
        opacity: {
          pressed: 0.7,
          disabled: 0.5,
          shimmer: 0.8,
        },
      },
      shadow: {
        '1': { radius: 2, offset: [0, 1], opacity: 0.1 },
        '2': { radius: 4, offset: [0, 2], opacity: 0.15 },
        '3': { radius: 8, offset: [0, 4], opacity: 0.2 },
        '4': { radius: 16, offset: [0, 8], opacity: 0.25 },
      },
    },
    microInteractions: {
      pressFeedback: { enabled: true, scale: 0.95, durationMs: 100 },
      successMorph: { enabled: true, durationMs: 300 },
      elasticPullToRefresh: { enabled: true, maxStretch: 1.2 },
      sharedElement: { enabled: true, durationMs: 300 },
      confettiLite: { enabled: true, maxParticles: 50 },
      shimmer: { enabled: true, sweepMs: 1500 },
      guards: {
        respectReducedMotion: true,
        lowEndDevicePolicy: 'simplify',
      },
    },
    components: {
      button: { variant: 'primary', radius: 'md', elevation: '1' },
      card: { radius: 'lg', elevation: '2', imageFade: 'none' },
      chip: { filled: true },
      toast: { position: 'bottom', durationMs: 3000 },
    },
    screens: {},
    featureFlags: {},
    meta: {
      changelog: 'Initial config',
      createdBy: 'test',
      createdAt: '2025-01-27T00:00:00Z',
    },
  })),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  useAuthStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('../../../hooks/useReducedMotion');
jest.mock('../utils/motionGuards');

const mockUseReduceMotion = useReduceMotion as jest.MockedFunction<typeof useReduceMotion>;
const mockIsLowEndDevice = isLowEndDevice as jest.MockedFunction<typeof isLowEndDevice>;

describe('UI Config Apply', () => {
  let config: UIConfig;

  beforeEach(() => {
    config = getDefaultUIConfig();
    mockUseReduceMotion.mockReturnValue(false);
    mockIsLowEndDevice.mockReturnValue(false);
  });

  describe('configToTheme', () => {
    it('should convert UIConfig to AppTheme', () => {
      const theme = configToTheme(config, 'light');

      expect(theme.scheme).toBe('light');
      expect(theme.isDark).toBe(false);
      expect(theme.colors.primary).toBe(config.tokens.colors['primary']);
      expect(theme.spacing.md).toBe(config.tokens.spacing.md);
    });

    it('should use dark theme when scheme is dark', () => {
      const theme = configToTheme(config, 'dark');

      expect(theme.scheme).toBe('dark');
      expect(theme.isDark).toBe(true);
    });

    it('should fallback to base theme for missing values', () => {
      const partialConfig: UIConfig = {
        ...config,
        tokens: {
          ...config.tokens,
          colors: {
            ...config.tokens.colors,
            primary: undefined as unknown as string,
          },
        },
      };

      const theme = configToTheme(partialConfig, 'light');

      // Should not crash and use fallback
      expect(theme.colors.primary).toBeDefined();
    });
  });

  describe('getMotionConfig', () => {
    it('should return motion config from UIConfig', () => {
      const motionConfig = getMotionConfig(config);

      expect(motionConfig.duration).toEqual(config.tokens.motion.duration);
      expect(motionConfig.easing).toEqual(config.tokens.motion.easing);
      expect(motionConfig.microInteractions).toEqual(config.microInteractions);
    });
  });

  describe('shouldRespectReducedMotion', () => {
    it('should return true when guard is enabled', () => {
      const configWithGuard: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            respectReducedMotion: true,
          },
        },
      };

      expect(shouldRespectReducedMotion(configWithGuard)).toBe(true);
    });

    it('should return false when guard is disabled', () => {
      const configWithoutGuard: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            // Force legacy configs that explicitly disable motion guard
            respectReducedMotion: false as unknown as true,
          },
        },
      };

      expect(shouldRespectReducedMotion(configWithoutGuard)).toBe(false);
    });
  });

  describe('getLowEndDevicePolicy', () => {
    it('should return correct policy', () => {
      const configWithPolicy: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            lowEndDevicePolicy: 'skip',
          },
        },
      };

      expect(getLowEndDevicePolicy(configWithPolicy)).toBe('skip');
    });
  });

  describe('applyMicroInteractionGuards', () => {
    it('should disable all animations when reduced motion is enabled', () => {
      mockUseReduceMotion.mockReturnValue(true);
      const configWithGuard: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            respectReducedMotion: true,
          },
        },
      };

      const guarded = applyMicroInteractionGuards(configWithGuard.microInteractions, true, false);

      expect(guarded.pressFeedback.enabled).toBe(false);
      expect(guarded.successMorph.enabled).toBe(false);
      expect(guarded.confettiLite.enabled).toBe(false);
    });

    it('should skip animations on low-end devices when policy is skip', () => {
      mockIsLowEndDevice.mockReturnValue(true);
      const configWithPolicy: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            lowEndDevicePolicy: 'skip',
          },
        },
      };

      const guarded = applyMicroInteractionGuards(configWithPolicy.microInteractions, false, true);

      expect(guarded.pressFeedback.enabled).toBe(false);
      expect(guarded.confettiLite.enabled).toBe(false);
    });

    it('should simplify animations on low-end devices when policy is simplify', () => {
      mockIsLowEndDevice.mockReturnValue(true);
      const configWithPolicy: UIConfig = {
        ...config,
        microInteractions: {
          ...config.microInteractions,
          guards: {
            ...config.microInteractions.guards,
            lowEndDevicePolicy: 'simplify',
          },
        },
      };

      const guarded = applyMicroInteractionGuards(configWithPolicy.microInteractions, false, true);

      // Heavy animations disabled, but lighter ones may remain
      expect(guarded.confettiLite.enabled).toBe(false);
    });

    it('should allow full animations when no guards trigger', () => {
      mockUseReduceMotion.mockReturnValue(false);
      mockIsLowEndDevice.mockReturnValue(false);

      const guarded = applyMicroInteractionGuards(config.microInteractions, false, false);

      expect(guarded.pressFeedback.enabled).toBe(config.microInteractions.pressFeedback.enabled);
    });
  });
});
