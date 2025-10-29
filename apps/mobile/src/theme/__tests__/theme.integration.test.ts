// apps/mobile/src/theme/__tests__/theme.integration.test.ts
import { getLightTheme, getDarkTheme } from '../resolve';

describe('resolved theme', () => {
  test('has ergonomic keys', () => {
    const t = getLightTheme();
    expect(typeof t.colors.primary).toBe('string');
    expect(typeof t.colors.primaryText).toBe('string');
    expect(typeof t.colors.bg).toBe('string');
    expect(typeof t.radius.md).toBe('number');
  });
  test('dark variant flips text/bg', () => {
    const l = getLightTheme();
    const d = getDarkTheme();
    expect(l.colors.bg).not.toBe(d.colors.bg);
    expect(l.colors.onSurface).not.toBe(d.colors.onSurface);
  });
});

