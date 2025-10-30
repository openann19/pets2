/**
 * Glass Border Styles
 */

export const BORDER_CONFIGS = {
  light: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  medium: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heavy: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
} as const;

export type BorderStyle = keyof typeof BORDER_CONFIGS;
