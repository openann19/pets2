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
import { useReduceMotion } from '../../hooks/useReducedMotion';
import { isLowEndDevice } from '../../utils/motionGuards';

jest.mock('../../hooks/useReducedMotion');
jest.mock('../../utils/motionGuards');

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
      expect(theme.colors.primary).toBe(config.tokens.colors.primary);
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
            respectReducedMotion: false,
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
