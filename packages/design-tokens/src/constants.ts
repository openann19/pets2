/**
 * Core design token constants
 * Separated to avoid circular dependencies
 */

// ====== COLOR PALETTE ======
export const COLORS = {
  // Brand Primary (Pink/Rose)
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },

  // Brand Secondary (Purple/Violet)
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Neutral Grays
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Error/Danger
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Info
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const;

// ====== GRADIENTS ======
export const GRADIENTS = {
  // Primary brand gradients
  primary: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  secondary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',

  // Premium mesh gradients
  mesh: {
    warm: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)',
    cool: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    royal: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  // Glass morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },

  // Special effects
  holographic: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)',
  neon: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  aurora: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)',
} as const;

// ====== SHADOWS ======
export const SHADOWS = {
  // Standard shadows
  'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Premium color glows
  'primaryGlow': '0 0 20px rgba(236, 72, 153, 0.4)',
  'secondaryGlow': '0 0 20px rgba(168, 85, 247, 0.4)',
  'successGlow': '0 0 20px rgba(34, 197, 94, 0.4)',
  'errorGlow': '0 0 20px rgba(239, 68, 68, 0.4)',
  'warningGlow': '0 0 20px rgba(245, 158, 11, 0.4)',
  'infoGlow': '0 0 20px rgba(59, 130, 246, 0.4)',

  // Glass morphism
  'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
  'glassLight': '0 4px 16px rgba(255, 255, 255, 0.1)',

  // Neon effects
  'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
  'neonPrimary': '0 0 5px #ec4899, 0 0 10px #ec4899, 0 0 15px #ec4899',
  'neonSecondary': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7',
} as const;

// ====== BLUR EFFECTS ======
export const BLUR = {
  'sm': 'blur(4px)',
  'md': 'blur(8px)',
  'lg': 'blur(16px)',
  'xl': 'blur(24px)',
  '2xl': 'blur(40px)',
  'premium': 'blur(20px)',
} as const;

// ====== BORDER RADIUS ======
export const RADIUS = {
  'none': '0px',
  'sm': '0.125rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
} as const;

// ====== SPACING ======
export const SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// ====== TYPOGRAPHY ======
export const TYPOGRAPHY = {
  fontSizes: {
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ====== ANIMATIONS ======
export const TRANSITIONS = {
  micro: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  smooth: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  bouncy: {
    duration: 400,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  gentle: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ====== Z-INDEX ======
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;
