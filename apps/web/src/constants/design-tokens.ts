/**
 * 🎨 PREMIUM DESIGN TOKENS
 * Central design system with colors, gradients, shadows, and effects
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
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
    },
    // Error/Danger
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
    },
    // Warning
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
    },
    // Info
    info: {
        50: '#eff6ff',
        100: '#dbeafe',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
    },
};
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
    rainbow: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)',
};
// ====== SHADOWS ======
export const SHADOWS = {
    // Standard shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Premium shadows
    premium: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
    'premium-lg': '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
    // Glass morphism shadow
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    // Color glow shadows
    primaryGlow: '0 10px 40px -10px rgba(236, 72, 153, 0.6)',
    secondaryGlow: '0 10px 40px -10px rgba(168, 85, 247, 0.6)',
    successGlow: '0 10px 40px -10px rgba(34, 197, 94, 0.6)',
    errorGlow: '0 10px 40px -10px rgba(239, 68, 68, 0.6)',
    warningGlow: '0 10px 40px -10px rgba(245, 158, 11, 0.6)',
    // Neon effects
    neon: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
    neonStrong: '0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)',
};
// ====== BLUR EFFECTS ======
export const BLUR = {
    none: 'blur(0)',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
    '2xl': 'blur(24px)',
    premium: 'blur(16px) saturate(180%)',
};
// ====== BORDER RADIUS ======
export const RADIUS = {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
};
// ====== SPACING SCALE ======
export const SPACING = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
};
// ====== TRANSITIONS ======
export const transitions = {
    micro: { stiffness: 400, damping: 25 },
    smooth: { stiffness: 300, damping: 30 },
    bouncy: { stiffness: 600, damping: 15 },
    gentle: { stiffness: 200, damping: 35 },
};
// ====== Z-INDEX SCALE ======
export const ZINDEX = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    toast: 1500,
};
//# sourceMappingURL=design-tokens.js.map