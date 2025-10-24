/**
 * 🎨 CSS VARIABLES SYSTEM
 * Centralized CSS custom properties for design tokens
 */
import { COLORS } from '../constants/design-tokens';
import { TYPOGRAPHY_CSS_VARS } from './typography';
import { ELEVATION_CSS_VARS } from './elevation';
// Spacing scale (8-pt system)
export const SPACING_CSS_VARS = `
  :root {
    /* 8-pt spacing scale */
    --space-0: 0;
    --space-1: 0.125rem;  /* 2px */
    --space-2: 0.25rem;   /* 4px */
    --space-3: 0.375rem;  /* 6px */
    --space-4: 0.5rem;    /* 8px */
    --space-5: 0.625rem;  /* 10px */
    --space-6: 0.75rem;   /* 12px */
    --space-8: 1rem;      /* 16px */
    --space-10: 1.25rem;  /* 20px */
    --space-12: 1.5rem;   /* 24px */
    --space-16: 2rem;     /* 32px */
    --space-20: 2.5rem;   /* 40px */
    --space-24: 3rem;     /* 48px */
    --space-32: 4rem;     /* 64px */
    --space-40: 5rem;     /* 80px */
    --space-48: 6rem;     /* 96px */
    --space-56: 7rem;     /* 112px */
    --space-64: 8rem;     /* 128px */
    --space-72: 9rem;     /* 144px */
    --space-80: 10rem;    /* 160px */
    --space-96: 12rem;    /* 192px */
  }
`;
// Color system CSS variables
export const COLOR_CSS_VARS = `
  :root {
    /* Primary colors */
    --color-primary-50: ${COLORS.primary[50]};
    --color-primary-100: ${COLORS.primary[100]};
    --color-primary-200: ${COLORS.primary[200]};
    --color-primary-300: ${COLORS.primary[300]};
    --color-primary-400: ${COLORS.primary[400]};
    --color-primary-500: ${COLORS.primary[500]};
    --color-primary-600: ${COLORS.primary[600]};
    --color-primary-700: ${COLORS.primary[700]};
    --color-primary-800: ${COLORS.primary[800]};
    --color-primary-900: ${COLORS.primary[900]};

    /* Secondary colors */
    --color-secondary-50: ${COLORS.secondary[50]};
    --color-secondary-100: ${COLORS.secondary[100]};
    --color-secondary-200: ${COLORS.secondary[200]};
    --color-secondary-300: ${COLORS.secondary[300]};
    --color-secondary-400: ${COLORS.secondary[400]};
    --color-secondary-500: ${COLORS.secondary[500]};
    --color-secondary-600: ${COLORS.secondary[600]};
    --color-secondary-700: ${COLORS.secondary[700]};
    --color-secondary-800: ${COLORS.secondary[800]};
    --color-secondary-900: ${COLORS.secondary[900]};

    /* Neutral colors */
    --color-neutral-0: ${COLORS.neutral[0]};
    --color-neutral-50: ${COLORS.neutral[50]};
    --color-neutral-100: ${COLORS.neutral[100]};
    --color-neutral-200: ${COLORS.neutral[200]};
    --color-neutral-300: ${COLORS.neutral[300]};
    --color-neutral-400: ${COLORS.neutral[400]};
    --color-neutral-500: ${COLORS.neutral[500]};
    --color-neutral-600: ${COLORS.neutral[600]};
    --color-neutral-700: ${COLORS.neutral[700]};
    --color-neutral-800: ${COLORS.neutral[800]};
    --color-neutral-900: ${COLORS.neutral[900]};
    --color-neutral-950: ${COLORS.neutral[950]};

    /* Semantic colors */
    --color-success-50: ${COLORS.success[50]};
    --color-success-100: ${COLORS.success[100]};
    --color-success-400: ${COLORS.success[400]};
    --color-success-500: ${COLORS.success[500]};
    --color-success-600: ${COLORS.success[600]};
    --color-success-700: ${COLORS.success[700]};

    --color-error-50: ${COLORS.error[50]};
    --color-error-100: ${COLORS.error[100]};
    --color-error-400: ${COLORS.error[400]};
    --color-error-500: ${COLORS.error[500]};
    --color-error-600: ${COLORS.error[600]};
    --color-error-700: ${COLORS.error[700]};

    --color-warning-50: ${COLORS.warning[50]};
    --color-warning-100: ${COLORS.warning[100]};
    --color-warning-400: ${COLORS.warning[400]};
    --color-warning-500: ${COLORS.warning[500]};
    --color-warning-600: ${COLORS.warning[600]};

    --color-info-50: ${COLORS.info[50]};
    --color-info-100: ${COLORS.info[100]};
    --color-info-400: ${COLORS.info[400]};
    --color-info-500: ${COLORS.info[500]};
    --color-info-600: ${COLORS.info[600]};

    /* Semantic color aliases */
    --color-primary: var(--color-primary-500);
    --color-secondary: var(--color-secondary-500);
    --color-success: var(--color-success-500);
    --color-error: var(--color-error-500);
    --color-warning: var(--color-warning-500);
    --color-info: var(--color-info-500);
  }

  /* Dark mode color overrides */
  .dark {
    --color-primary: var(--color-primary-400);
    --color-secondary: var(--color-secondary-400);
    --color-success: var(--color-success-400);
    --color-error: var(--color-error-400);
    --color-warning: var(--color-warning-400);
    --color-info: var(--color-info-400);
  }
`;
// Border radius system
export const RADIUS_CSS_VARS = `
  :root {
    --radius-none: 0;
    --radius-sm: 0.125rem;   /* 2px */
    --radius-md: 0.25rem;    /* 4px */
    --radius-lg: 0.375rem;   /* 6px */
    --radius-xl: 0.5rem;     /* 8px */
    --radius-2xl: 0.75rem;   /* 12px */
    --radius-3xl: 1rem;      /* 16px */
    --radius-4xl: 1.5rem;    /* 24px */
    --radius-5xl: 2rem;      /* 32px */
    --radius-full: 9999px;
  }
`;
// Animation and transition system
export const ANIMATION_CSS_VARS = `
  :root {
    /* Transition durations */
    --duration-75: 75ms;
    --duration-100: 100ms;
    --duration-150: 150ms;
    --duration-200: 200ms;
    --duration-300: 300ms;
    --duration-500: 500ms;
    --duration-700: 700ms;
    --duration-1000: 1000ms;

    /* Transition timing functions */
    --ease-linear: linear;
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);

    /* Animation delays */
    --delay-75: 75ms;
    --delay-100: 100ms;
    --delay-150: 150ms;
    --delay-200: 200ms;
    --delay-300: 300ms;
    --delay-500: 500ms;
    --delay-700: 700ms;
    --delay-1000: 1000ms;

    /* Z-index layers */
    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-modal: 1200;
    --z-popover: 1300;
    --z-tooltip: 1400;
    --z-toast: 1500;
    --z-notification: 1600;
  }
`;
// Layout system
export const LAYOUT_CSS_VARS = `
  :root {
    /* Container max widths */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1536px;

    /* Breakpoints */
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;

    /* Grid system */
    --grid-cols-1: repeat(1, minmax(0, 1fr));
    --grid-cols-2: repeat(2, minmax(0, 1fr));
    --grid-cols-3: repeat(3, minmax(0, 1fr));
    --grid-cols-4: repeat(4, minmax(0, 1fr));
    --grid-cols-6: repeat(6, minmax(0, 1fr));
    --grid-cols-12: repeat(12, minmax(0, 1fr));

    /* Aspect ratios */
    --aspect-square: 1 / 1;
    --aspect-video: 16 / 9;
    --aspect-photo: 4 / 3;
    --aspect-portrait: 3 / 4;
    --aspect-wide: 21 / 9;
  }
`;
// Complete CSS variables system
export const COMPLETE_CSS_VARS = `
  ${COLOR_CSS_VARS}
  ${SPACING_CSS_VARS}
  ${TYPOGRAPHY_CSS_VARS}
  ${ELEVATION_CSS_VARS}
  ${RADIUS_CSS_VARS}
  ${ANIMATION_CSS_VARS}
  ${LAYOUT_CSS_VARS}
`;
// Utility functions for CSS variables
export const getCSSVar = (varName) => `var(--${varName})`;
export const getColorVar = (color) => `var(--color-${color})`;
export const getSpacingVar = (size) => `var(--space-${size})`;
export const getRadiusVar = (size) => `var(--radius-${size})`;
export const getDurationVar = (duration) => `var(--duration-${duration})`;
export const getEaseVar = (ease) => `var(--ease-${ease})`;
// CSS variable injection function
export const injectCSSVars = () => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = COMPLETE_CSS_VARS;
        document.head.appendChild(style);
    }
};
export default {
    COLOR_CSS_VARS,
    SPACING_CSS_VARS,
    TYPOGRAPHY_CSS_VARS,
    ELEVATION_CSS_VARS,
    RADIUS_CSS_VARS,
    ANIMATION_CSS_VARS,
    LAYOUT_CSS_VARS,
    COMPLETE_CSS_VARS,
    injectCSSVars,
    getCSSVar,
    getColorVar,
    getSpacingVar,
    getRadiusVar,
    getDurationVar,
    getEaseVar,
};
//# sourceMappingURL=css-variables.js.map