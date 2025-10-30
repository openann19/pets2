/**
 * useTheme Hook Tests
 *
 * Comprehensive tests for the useTheme hook and theme provider
 */

import { createTheme } from '../index';

describe('useTheme Hook - Theme System', () => {
  describe('Theme Creation', () => {
    it('should create a valid light theme', () => {
      const theme = createTheme('light');

      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('light');
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radii).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.blur).toBeDefined();
      expect(theme.easing).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.palette).toBeDefined();
    });

    it('should create a valid dark theme', () => {
      const theme = createTheme('dark');

      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('dark');
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radii).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.blur).toBeDefined();
      expect(theme.easing).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.palette).toBeDefined();
    });
  });

  describe('Color System', () => {
    it('should have all required color properties', () => {
      const theme = createTheme('light');
      const requiredColors = [
        'bg',
        'surface',
        'overlay',
        'border',
        'onBg',
        'onSurface',
        'onMuted',
        'primary',
        'onPrimary',
        'success',
        'danger',
        'warning',
        'info',
      ];

      requiredColors.forEach((color) => {
        expect(theme.colors).toHaveProperty(color);
        expect(typeof theme.colors[color as keyof typeof theme.colors]).toBe('string');
      });
    });

    it('should have valid color values', () => {
      const theme = createTheme('light');

      // Colors should be hex strings (or rgba for overlay)
      expect(theme.colors.bg).toMatch(/^#?[0-9a-f]{6}$/i);
      expect(theme.colors.onSurface).toMatch(/^#?[0-9a-f]{6}$/i);
      expect(theme.colors.primary).toMatch(/^#?[0-9a-f]{6}$/i);
    });

    it('should have different colors for light and dark themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');

      // Background and text should be inverted
      expect(lightTheme.colors.bg).not.toBe(darkTheme.colors.bg);
      expect(lightTheme.colors.onSurface).not.toBe(darkTheme.colors.onSurface);

      // Semantic colors should be the same
      expect(lightTheme.colors.primary).toBe(darkTheme.colors.primary);
      expect(lightTheme.colors.success).toBe(darkTheme.colors.success);
    });
  });

  describe('Spacing System', () => {
    it('should have all required spacing values', () => {
      const theme = createTheme('light');
      const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

      requiredSpacing.forEach((size) => {
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

      Object.values(theme.spacing).forEach((value) => {
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
      const requiredRadius = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill', 'full'];

      requiredRadius.forEach((size) => {
        expect(theme.radii).toHaveProperty(size);
        expect(typeof theme.radii[size as keyof typeof theme.radii]).toBe('number');
      });
    });

    it('should have ascending radius values', () => {
      const theme = createTheme('light');

      expect(theme.radii.none).toBe(0);
      expect(theme.radii.xs).toBeGreaterThan(theme.radii.none);
      expect(theme.radii.sm).toBeGreaterThan(theme.radii.xs);
      expect(theme.radii.md).toBeGreaterThan(theme.radii.sm);
      expect(theme.radii.lg).toBeGreaterThan(theme.radii.md);
      expect(theme.radii.xl).toBeGreaterThan(theme.radii.lg);
      expect(theme.radii['2xl']).toBeGreaterThan(theme.radii.xl);
      expect(theme.radii.full).toBeGreaterThan(theme.radii['2xl']);
    });

    it('should have consistent radius across themes', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');

      expect(lightTheme.radii.lg).toBe(darkTheme.radii.lg);
      expect(lightTheme.radii.md).toBe(darkTheme.radii.md);
      expect(lightTheme.radii.full).toBe(darkTheme.radii.full);
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      const theme = createTheme('light');

      // These should not throw TypeScript errors
      const bg: string = theme.colors.bg;
      const spacing: number = theme.spacing.lg;
      const radius: number = theme.radii.md;

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
  });
});
