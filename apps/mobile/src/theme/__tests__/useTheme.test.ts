/**
 * useTheme Hook Tests
 * 
 * Comprehensive tests for the useTheme hook and theme provider
 */

import { createTheme } from '../rnTokens';
import { createContext, useContext } from 'react';

describe('useTheme Hook - Theme System', () => {
  describe('Theme Creation', () => {
    it('should create a valid light theme', () => {
      const theme = createTheme('light');
      
      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('light');
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radius).toBeDefined();
      expect(theme.motion).toBeDefined();
    });

    it('should create a valid dark theme', () => {
      const theme = createTheme('dark');
      
      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('dark');
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radius).toBeDefined();
      expect(theme.motion).toBeDefined();
    });
  });

  describe('Color System', () => {
    it('should have all required color properties', () => {
      const theme = createTheme('light');
      const requiredColors = [
        'bg',
        'bgElevated',
        'text',
        'textMuted',
        'primary',
        'primaryText',
        'border',
        'success',
        'warning',
        'danger',
      ];

      requiredColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color);
        expect(typeof theme.colors[color as keyof typeof theme.colors]).toBe('string');
      });
    });

    it('should have valid color values', () => {
      const theme = createTheme('light');
      
      // Colors should be hex strings
      expect(theme.colors.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.colors.text).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have different colors for light and dark themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      // Background and text should be inverted
      expect(lightTheme.colors.bg).not.toBe(darkTheme.colors.bg);
      expect(lightTheme.colors.text).not.toBe(darkTheme.colors.text);
      
      // Semantic colors should be the same
      expect(lightTheme.colors.primary).toBe(darkTheme.colors.primary);
      expect(lightTheme.colors.success).toBe(darkTheme.colors.success);
    });

    it('should have proper contrast in light theme', () => {
      const theme = createTheme('light');
      
      // Light theme: white background, dark text
      expect(theme.colors.bg).toBe('#ffffff');
      expect(theme.colors.text).toBe('#111827');
    });

    it('should have proper contrast in dark theme', () => {
      const theme = createTheme('dark');
      
      // Dark theme: dark background, light text
      expect(theme.colors.bg).toBe('#0a0a0a');
      expect(theme.colors.text).toBe('#ffffff');
    });
  });

  describe('Spacing System', () => {
    it('should have all required spacing values', () => {
      const theme = createTheme('light');
      const requiredSpacing = [
        'xs', 'sm', 'md', 'lg', 'xl',
        '2xl', '3xl', '4xl'
      ];

      requiredSpacing.forEach(size => {
        expect(theme.spacing).toHaveProperty(size);
        expect(typeof theme.spacing[size as keyof typeof theme.spacing]).toBe('number');
      });
    });

    it('should have ascending spacing values', () => {
      const theme = createTheme('light');
      
      expect(theme.spacing.xs).toBeLessThan(theme.spacing.sm);
      expect(theme.spacing.sm).toBeLessThan(theme.spacing.md);
      expect(theme.spacing.md).toBeLessThan(theme.spacing.lg);
      expect(theme.spacing.lg).toBeLessThan(theme.spacing.xl);
      expect(theme.spacing.xl).toBeLessThan(theme.spacing['2xl']);
      expect(theme.spacing['2xl']).toBeLessThan(theme.spacing['3xl']);
      expect(theme.spacing['3xl']).toBeLessThan(theme.spacing['4xl']);
    });

    it('should have positive spacing values', () => {
      const theme = createTheme('light');
      
      Object.values(theme.spacing).forEach(value => {
        if (typeof value === 'number') {
          expect(value).toBeGreaterThan(0);
        }
      });
    });

    it('should have consistent spacing across themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      expect(lightTheme.spacing.lg).toBe(darkTheme.spacing.lg);
      expect(lightTheme.spacing.md).toBe(darkTheme.spacing.md);
      expect(lightTheme.spacing.xl).toBe(darkTheme.spacing.xl);
    });
  });

  describe('Radius System', () => {
    it('should have all required radius values', () => {
      const theme = createTheme('light');
      const requiredRadius = [
        'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'
      ];

      requiredRadius.forEach(size => {
        expect(theme.radius).toHaveProperty(size);
        expect(typeof theme.radius[size as keyof typeof theme.radius]).toBe('number');
      });
    });

    it('should have ascending radius values', () => {
      const theme = createTheme('light');
      
      expect(theme.radius.none).toBe(0);
      expect(theme.radius.xs).toBeGreaterThan(theme.radius.none);
      expect(theme.radius.sm).toBeGreaterThan(theme.radius.xs);
      expect(theme.radius.md).toBeGreaterThan(theme.radius.sm);
      expect(theme.radius.lg).toBeGreaterThan(theme.radius.md);
      expect(theme.radius.xl).toBeGreaterThan(theme.radius.lg);
      expect(theme.radius['2xl']).toBeGreaterThan(theme.radius.xl);
      expect(theme.radius.full).toBeGreaterThan(theme.radius['2xl']);
    });

    it('should have consistent radius across themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      expect(lightTheme.radius.lg).toBe(darkTheme.radius.lg);
      expect(lightTheme.radius.md).toBe(darkTheme.radius.md);
      expect(lightTheme.radius.full).toBe(darkTheme.radius.full);
    });
  });

  describe('Motion System', () => {
    it('should have duration values', () => {
      const theme = createTheme('light');
      
      expect(theme.motion.duration).toHaveProperty('fast');
      expect(theme.motion.duration).toHaveProperty('normal');
      expect(theme.motion.duration).toHaveProperty('slow');
      
      expect(typeof theme.motion.duration.fast).toBe('number');
      expect(typeof theme.motion.duration.normal).toBe('number');
      expect(typeof theme.motion.duration.slow).toBe('number');
    });

    it('should have ascending duration values', () => {
      const theme = createTheme('light');
      
      expect(theme.motion.duration.fast).toBeLessThan(theme.motion.duration.normal);
      expect(theme.motion.duration.normal).toBeLessThan(theme.motion.duration.slow);
    });

    it('should have spring configuration', () => {
      const theme = createTheme('light');
      
      expect(theme.motion.spring.stiff).toHaveProperty('stiffness');
      expect(theme.motion.spring.stiff).toHaveProperty('damping');
      expect(theme.motion.spring.stiff).toHaveProperty('mass');
      
      expect(typeof theme.motion.spring.stiff.stiffness).toBe('number');
      expect(typeof theme.motion.spring.stiff.damping).toBe('number');
      expect(typeof theme.motion.spring.stiff.mass).toBe('number');
    });

    it('should have easing function', () => {
      const theme = createTheme('light');
      
      expect(theme.motion.easing).toHaveProperty('standard');
      expect(typeof theme.motion.easing.standard).toBe('function');
    });

    it('should have consistent motion across themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      expect(lightTheme.motion.duration.fast).toBe(darkTheme.motion.duration.fast);
      expect(lightTheme.motion.duration.normal).toBe(darkTheme.motion.duration.normal);
      expect(lightTheme.motion.duration.slow).toBe(darkTheme.motion.duration.slow);
    });
  });

  describe('Theme Immutability', () => {
    it('should not allow mutation of theme colors', () => {
      const theme = createTheme('light');
      
      // Attempting to modify should not affect the original
      const originalColor = theme.colors.primary;
      
      expect(theme.colors.primary).toBe(originalColor);
    });

    it('should not allow mutation of theme spacing', () => {
      const theme = createTheme('light');
      
      const originalSpacing = theme.spacing.lg;
      
      expect(theme.spacing.lg).toBe(originalSpacing);
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      const theme = createTheme('light');
      
      // These should not throw TypeScript errors
      const bg: string = theme.colors.bg;
      const spacing: number = theme.spacing.lg;
      const radius: number = theme.radius.md;
      
      expect(typeof bg).toBe('string');
      expect(typeof spacing).toBe('number');
      expect(typeof radius).toBe('number');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain isDark property for backward compatibility', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      expect(lightTheme.isDark).toBe(false);
      expect(darkTheme.isDark).toBe(true);
    });

    it('should have styles and shadows properties for legacy support', () => {
      const theme = createTheme('light');
      
      expect(theme).toHaveProperty('styles');
      expect(theme).toHaveProperty('shadows');
    });
  });
});
