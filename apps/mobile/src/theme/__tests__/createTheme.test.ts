/**
 * Theme System Tests
 * Tests for createTheme, resolveTheme, and contract compliance
 */

import { describe, it, expect } from '@jest/globals';
import { createTheme } from '../index';
import { getLightTheme, getDarkTheme, resolveTheme } from '../resolve';
import type { AppTheme } from '../contracts';
import { Theme as BaseLight, DarkTheme as BaseDark } from '../base-theme';

describe('Theme System - Contract Compliance', () => {
  describe('createTheme', () => {
    it('should create a valid light theme with all required fields', () => {
      const theme = createTheme('light');

      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('light');
      expect(theme.isDark).toBe(false);
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radii).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.blur).toBeDefined();
      expect(theme.easing).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.palette).toBeDefined();
    });

    it('should create a valid dark theme with all required fields', () => {
      const theme = createTheme('dark');

      expect(theme).toBeDefined();
      expect(theme.scheme).toBe('dark');
      expect(theme.isDark).toBe(true);
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radii).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.blur).toBeDefined();
      expect(theme.easing).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.palette).toBeDefined();
    });

    it('should return complete AppTheme contract', () => {
      const theme: AppTheme = createTheme('light');

      // Verify SemanticColors
      expect(theme.colors.bg).toBeDefined();
      expect(theme.colors.surface).toBeDefined();
      expect(theme.colors.overlay).toBeDefined();
      expect(theme.colors.border).toBeDefined();
      expect(theme.colors.onBg).toBeDefined();
      expect(theme.colors.onSurface).toBeDefined();
      expect(theme.colors.onMuted).toBeDefined();
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.onPrimary).toBeDefined();
      expect(theme.colors.success).toBeDefined();
      expect(theme.colors.danger).toBeDefined();
      expect(theme.colors.warning).toBeDefined();
      expect(theme.colors.info).toBeDefined();
    });

    it('should have numeric spacing values (not strings)', () => {
      const theme = createTheme('light');

      expect(typeof theme.spacing.xs).toBe('number');
      expect(typeof theme.spacing.sm).toBe('number');
      expect(typeof theme.spacing.md).toBe('number');
      expect(typeof theme.spacing.lg).toBe('number');
      expect(typeof theme.spacing.xl).toBe('number');
      expect(typeof theme.spacing['2xl']).toBe('number');
      expect(typeof theme.spacing['3xl']).toBe('number');
      expect(typeof theme.spacing['4xl']).toBe('number');

      // Verify values are positive and ascending
      expect(theme.spacing.xs).toBeGreaterThan(0);
      expect(theme.spacing.md).toBeGreaterThan(theme.spacing.xs);
      expect(theme.spacing.lg).toBeGreaterThan(theme.spacing.md);
    });

    it('should have numeric radii values', () => {
      const theme = createTheme('light');

      expect(typeof theme.radii.none).toBe('number');
      expect(typeof theme.radii.xs).toBe('number');
      expect(typeof theme.radii.sm).toBe('number');
      expect(typeof theme.radii.md).toBe('number');
      expect(typeof theme.radii.lg).toBe('number');
      expect(typeof theme.radii.xl).toBe('number');
      expect(typeof theme.radii['2xl']).toBe('number');
      expect(typeof theme.radii.pill).toBe('number');
      expect(typeof theme.radii.full).toBe('number');
    });

    it('should have complete palette with gradients', () => {
      const theme = createTheme('light');

      expect(theme.palette).toBeDefined();
      expect(theme.palette.neutral).toBeDefined();
      expect(theme.palette.brand).toBeDefined();
      expect(theme.palette.gradients).toBeDefined();
      expect(theme.palette.gradients.primary).toBeDefined();
      expect(Array.isArray(theme.palette.gradients.primary)).toBe(true);
      expect(theme.palette.gradients.primary.length).toBe(2);
      expect(theme.palette.gradients.success).toBeDefined();
      expect(theme.palette.gradients.danger).toBeDefined();
    });

    it('should have proper typography structure', () => {
      const theme = createTheme('light');

      expect(theme.typography.body).toBeDefined();
      expect(typeof theme.typography.body.size).toBe('number');
      expect(typeof theme.typography.body.lineHeight).toBe('number');
      expect(theme.typography.body.weight).toMatch(/^[456]00$/);

      expect(theme.typography.h1).toBeDefined();
      expect(theme.typography.h1.weight).toBe('700');
      expect(theme.typography.h2).toBeDefined();
      expect(theme.typography.h2.weight).toBe('600');
    });
  });

  describe('resolveTheme', () => {
    it('should resolve base light theme to full AppTheme', () => {
      const theme = resolveTheme(BaseLight);

      expect(theme.scheme).toBe('light');
      expect(theme.isDark).toBe(false);
      expect(theme.palette).toBeDefined();
      expect(theme.colors.bg).toBeDefined();
      expect(typeof theme.spacing.xs).toBe('number');
    });

    it('should resolve base dark theme to full AppTheme', () => {
      const theme = resolveTheme(BaseDark);

      expect(theme.scheme).toBe('dark');
      expect(theme.isDark).toBe(true);
      expect(theme.palette).toBeDefined();
      expect(theme.colors.bg).toBeDefined();
      expect(typeof theme.spacing.xs).toBe('number');
    });
  });

  describe('getLightTheme / getDarkTheme', () => {
    it('should return consistent themes across calls', () => {
      const theme1 = getLightTheme();
      const theme2 = getLightTheme();

      expect(theme1.scheme).toBe(theme2.scheme);
      expect(theme1.colors.bg).toBe(theme2.colors.bg);
      expect(theme1.spacing.md).toBe(theme2.spacing.md);
    });

    it('should return different colors for light vs dark', () => {
      const lightTheme = getLightTheme();
      const darkTheme = getDarkTheme();

      expect(lightTheme.colors.bg).not.toBe(darkTheme.colors.bg);
      expect(lightTheme.isDark).toBe(false);
      expect(darkTheme.isDark).toBe(true);
    });
  });
});
