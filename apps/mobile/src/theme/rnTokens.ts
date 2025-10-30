/**
 * 🎨 RN-SAFE TOKENS WRAPPER (DEPRECATED)
 * 
 * @deprecated This file is deprecated. Use `createTheme` from '@/theme' instead.
 * This file now re-exports the unified createTheme for backward compatibility.
 * 
 * Migration: Change `import { createTheme } from '@/theme/rnTokens'` 
 *           to `import { createTheme } from '@/theme'`
 */

import type { ColorScheme, AppTheme } from './contracts';
import { createTheme as createThemeUnified } from './index';

/**
 * @deprecated Use createTheme from '@/theme' instead
 */
export const createTheme = (scheme: ColorScheme): AppTheme => {
  return createThemeUnified(scheme);
};
