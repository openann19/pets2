import { COLORS } from '@pawfectmatch/design-tokens';
import { getLightTheme } from './resolve';

const c = COLORS;
const base = getLightTheme();

const compatTheme = {
  colors: {
    // expose full palettes where expected
    primary: c.primary as Record<number, string>,
    neutral: c.neutral as Record<number, string>,

    // status set
    status: {
      success: base.colors.success,
      error: base.colors.danger,
      warning: base.colors.warning,
      info: base.colors.info,
    },

    // legacy "text" mapping to semantic
    text: {
      primary: base.colors.onSurface,
      secondary: base.colors.onMuted,
    },
  },
} as const;

// Attach to global for runtime consumers that reference `Theme` directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).Theme = compatTheme;

export type ThemeCompat = typeof compatTheme;
export const Theme = compatTheme;
export default compatTheme;
