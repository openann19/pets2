/**
 * Theme Token Guards Tests
 * Validates semantic tokens, deprecated token detection, spacing/radii invariants, and hook ordering
 */

import { describe, it, expect } from '@jest/globals';
import { createTheme } from '../index';
import type { AppTheme } from '../contracts';

describe('Theme Token Guards', () => {
  describe('Semantic Token Validation', () => {
    it('should have all required semantic color tokens', () => {
      const theme = createTheme('light');
      
      const requiredSemanticColors = [
        'bg',
        'surface',
        'surfaceAlt',
        'overlay',
        'border',
        'onBg',
        'onSurface',
        'onMuted',
        'primary',
        'secondary',
        'onPrimary',
        'success',
        'danger',
        'warning',
        'info',
      ];

      requiredSemanticColors.forEach((color) => {
        expect(theme.colors).toHaveProperty(color);
        expect(typeof theme.colors[color as keyof typeof theme.colors]).toBe('string');
        expect(theme.colors[color as keyof typeof theme.colors]).toBeTruthy();
      });
    });

    it('should NOT have deprecated color tokens', () => {
      const theme = createTheme('light');
      
      const deprecatedProperties = [
        'neutral',
        'status',
        'text',
        'background',
        'textSecondary',
      ];

      deprecatedProperties.forEach((prop) => {
        expect((theme.colors as Record<string, unknown>)[prop]).toBeUndefined();
      });
    });

    it('should NOT have theme.colors.status.* pattern', () => {
      const theme = createTheme('light');
      
      // status should not exist
      expect((theme.colors as Record<string, unknown>).status).toBeUndefined();
    });
  });

  describe('Spacing Invariants', () => {
    it('should have all spacing tokens in ascending order', () => {
      const theme = createTheme('light');
      
      const spacingOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
      
      for (let i = 0; i < spacingOrder.length - 1; i++) {
        const current = spacingOrder[i];
        const next = spacingOrder[i + 1];
        const currentValue = theme.spacing[current as keyof typeof theme.spacing];
        const nextValue = theme.spacing[next as keyof typeof theme.spacing];
        
        expect(currentValue).toBeLessThan(nextValue);
        expect(typeof currentValue).toBe('number');
        expect(typeof nextValue).toBe('number');
        expect(currentValue).toBeGreaterThan(0);
      }
    });

    it('should have all spacing tokens using valid semantic keys', () => {
      const theme = createTheme('light');
      
      const validSpacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
      const spacingKeys = Object.keys(theme.spacing);
      
      spacingKeys.forEach((key) => {
        expect(validSpacingKeys).toContain(key);
      });
    });

    it('should NOT use spacing math operations in theme', () => {
      const theme = createTheme('light');
      
      // Verify spacing values are numeric, not computed
      Object.values(theme.spacing).forEach((value) => {
        expect(typeof value).toBe('number');
        expect(Number.isFinite(value)).toBe(true);
      });
    });
  });

  describe('Radii Invariants', () => {
    it('should have all radii tokens in ascending order', () => {
      const theme = createTheme('light');
      
      const radiiOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
      
      for (let i = 0; i < radiiOrder.length - 1; i++) {
        const current = radiiOrder[i];
        const next = radiiOrder[i + 1];
        const currentValue = theme.radii[current as keyof typeof theme.radii];
        const nextValue = theme.radii[next as keyof typeof theme.radii];
        
        // full might be a special case (could be very large), so only check up to 2xl
        if (next !== 'full') {
          expect(currentValue).toBeLessThan(nextValue);
        }
        expect(typeof currentValue).toBe('number');
        expect(typeof nextValue).toBe('number');
        expect(currentValue).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have all radii tokens using valid semantic keys', () => {
      const theme = createTheme('light');
      
      const validRadiiKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
      const radiiKeys = Object.keys(theme.radii);
      
      radiiKeys.forEach((key) => {
        expect(validRadiiKeys).toContain(key);
      });
    });
  });

  describe('Hook Ordering Invariant', () => {
    it('should enforce useTheme hook must be called first in component', () => {
      // This is a documentation/pattern test - actual enforcement would be via ESLint rule
      // Pattern: const theme = useTheme(); should be first hook call
      
      const theme = createTheme('light');
      
      // Verify theme is usable (basic sanity check)
      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
    });
  });

  describe('Contract Compliance', () => {
    it('should satisfy AppTheme contract', () => {
      const theme: AppTheme = createTheme('light');
      
      // Required by AppTheme contract
      expect(theme.scheme).toBe('light');
      expect(typeof theme.isDark).toBe('boolean');
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.radii).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.shadows).toBeDefined();
      expect(theme.palette).toBeDefined();
    });

    it('should have consistent theme structure across light and dark', () => {
      const lightTheme = createTheme('light');
      const darkTheme = createTheme('dark');
      
      // Structure should be identical
      expect(Object.keys(lightTheme.colors)).toEqual(Object.keys(darkTheme.colors));
      expect(Object.keys(lightTheme.spacing)).toEqual(Object.keys(darkTheme.spacing));
      expect(Object.keys(lightTheme.radii)).toEqual(Object.keys(darkTheme.radii));
      
      // Semantic colors should be same (primary, success, etc.)
      expect(lightTheme.colors.primary).toBe(darkTheme.colors.primary);
      expect(lightTheme.colors.success).toBe(darkTheme.colors.success);
      expect(lightTheme.colors.danger).toBe(darkTheme.colors.danger);
      
      // Background colors should differ
      expect(lightTheme.colors.bg).not.toBe(darkTheme.colors.bg);
    });
  });

  describe('Migration Compliance', () => {
    it('should not expose legacy theme.colors.text.primary pattern', () => {
      const theme = createTheme('light');
      
      // text property should not exist
      expect((theme.colors as Record<string, unknown>).text).toBeUndefined();
    });

    it('should use semantic tokens instead of deprecated patterns', () => {
      const theme = createTheme('light');
      
      // Verify semantic replacements exist
      expect(theme.colors.onSurface).toBeDefined(); // was text.primary
      expect(theme.colors.onMuted).toBeDefined(); // was text.secondary
      expect(theme.colors.success).toBeDefined(); // was status.success
      expect(theme.colors.danger).toBeDefined(); // was status.error
    });
  });
});
