/**
 * 🎨 UNIFIED DESIGN SYSTEM
 * Single source of truth for all UI components
 * Ensures pixel-perfect consistency across the entire application
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
    // Semantic Colors
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
    },
    info: {
        50: '#eff6ff',
        100: '#dbeafe',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
    },
};
// ====== TYPOGRAPHY SCALE ======
export const TYPOGRAPHY = {
    // Font Families
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
    },
    // Font Sizes
    fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem', // 48px
        '6xl': '3.75rem', // 60px
    },
    // Font Weights
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },
    // Line Heights
    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    },
    // Text Styles
    textStyles: {
        heading1: {
            fontSize: '2.25rem',
            fontWeight: '700',
            lineHeight: '1.25',
        },
        heading2: {
            fontSize: '1.875rem',
            fontWeight: '600',
            lineHeight: '1.25',
        },
        heading3: {
            fontSize: '1.5rem',
            fontWeight: '600',
            lineHeight: '1.25',
        },
        heading4: {
            fontSize: '1.25rem',
            fontWeight: '600',
            lineHeight: '1.25',
        },
        body: {
            fontSize: '1rem',
            fontWeight: '400',
            lineHeight: '1.5',
        },
        bodyLarge: {
            fontSize: '1.125rem',
            fontWeight: '400',
            lineHeight: '1.5',
        },
        caption: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.5',
        },
        small: {
            fontSize: '0.75rem',
            fontWeight: '400',
            lineHeight: '1.5',
        },
    },
};
// ====== SPACING SCALE ======
export const SPACING = {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
};
// ====== BORDER RADIUS ======
export const RADIUS = {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
};
// ====== SHADOWS ======
export const SHADOWS = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Interactive shadows
    hover: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
    focus: '0 0 0 3px rgba(236, 72, 153, 0.1)',
    // Color-specific shadows
    primary: '0 10px 40px -10px rgba(236, 72, 153, 0.6)',
    secondary: '0 10px 40px -10px rgba(168, 85, 247, 0.6)',
    success: '0 10px 40px -10px rgba(34, 197, 94, 0.6)',
    error: '0 10px 40px -10px rgba(239, 68, 68, 0.6)',
};
// ====== GRADIENTS ======
export const GRADIENTS = {
    primary: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    // Premium gradients
    premium: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    // Glass morphism
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
};
// ====== TRANSITIONS ======
export const TRANSITIONS = {
    // Duration
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    // Easing
    easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    // Spring physics
    spring: {
        gentle: { stiffness: 200, damping: 25 },
        normal: { stiffness: 300, damping: 25 },
        bouncy: { stiffness: 400, damping: 15 },
        snappy: { stiffness: 600, damping: 30 },
    },
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
// ====== COMPONENT VARIANTS ======
export const VARIANTS = {
    // Button variants
    button: {
        primary: {
            background: GRADIENTS.primary,
            color: COLORS.neutral[0],
            border: 'none',
            shadow: SHADOWS.primary,
            hover: {
                transform: 'translateY(-2px)',
                shadow: SHADOWS.hover,
            },
        },
        secondary: {
            background: GRADIENTS.secondary,
            color: COLORS.neutral[0],
            border: 'none',
            shadow: SHADOWS.secondary,
            hover: {
                transform: 'translateY(-2px)',
                shadow: SHADOWS.hover,
            },
        },
        outline: {
            background: 'transparent',
            color: COLORS.primary[600],
            border: `2px solid ${COLORS.primary[600]}`,
            shadow: 'none',
            hover: {
                background: COLORS.primary[600],
                color: COLORS.neutral[0],
                transform: 'translateY(-1px)',
            },
        },
        ghost: {
            background: 'transparent',
            color: COLORS.neutral[700],
            border: 'none',
            shadow: 'none',
            hover: {
                background: COLORS.neutral[100],
                transform: 'translateY(-1px)',
            },
        },
    },
    // Card variants
    card: {
        default: {
            background: COLORS.neutral[0],
            border: `1px solid ${COLORS.neutral[200]}`,
            shadow: SHADOWS.md,
            radius: RADIUS.lg,
        },
        elevated: {
            background: COLORS.neutral[0],
            border: 'none',
            shadow: SHADOWS.lg,
            radius: RADIUS.xl,
        },
        glass: {
            background: GRADIENTS.glass,
            border: `1px solid ${COLORS.neutral[200]}`,
            shadow: SHADOWS.glass,
            radius: RADIUS.xl,
            backdropFilter: 'blur(12px)',
        },
    },
    // Input variants
    input: {
        default: {
            background: COLORS.neutral[0],
            border: `1px solid ${COLORS.neutral[300]}`,
            color: COLORS.neutral[900],
            focus: {
                border: `2px solid ${COLORS.primary[500]}`,
                shadow: SHADOWS.focus,
            },
        },
        filled: {
            background: COLORS.neutral[100],
            border: 'none',
            color: COLORS.neutral[900],
            focus: {
                background: COLORS.neutral[0],
                border: `2px solid ${COLORS.primary[500]}`,
                shadow: SHADOWS.focus,
            },
        },
    },
};
// ====== COMPONENT SIZES ======
export const SIZES = {
    button: {
        sm: {
            padding: `${SPACING[2]} ${SPACING[4]}`,
            fontSize: TYPOGRAPHY.fontSize.sm,
            height: '36px',
        },
        md: {
            padding: `${SPACING[3]} ${SPACING[6]}`,
            fontSize: TYPOGRAPHY.fontSize.base,
            height: '44px',
        },
        lg: {
            padding: `${SPACING[4]} ${SPACING[8]}`,
            fontSize: TYPOGRAPHY.fontSize.lg,
            height: '52px',
        },
    },
    input: {
        sm: {
            padding: `${SPACING[2]} ${SPACING[3]}`,
            fontSize: TYPOGRAPHY.fontSize.sm,
            height: '36px',
        },
        md: {
            padding: `${SPACING[3]} ${SPACING[4]}`,
            fontSize: TYPOGRAPHY.fontSize.base,
            height: '44px',
        },
        lg: {
            padding: `${SPACING[4]} ${SPACING[5]}`,
            fontSize: TYPOGRAPHY.fontSize.lg,
            height: '52px',
        },
    },
};
// ====== UTILITY FUNCTIONS ======
export const createStyle = (variant, size) => {
    return {
        ...VARIANTS.button[variant],
        ...SIZES.button[size],
        transition: `all ${TRANSITIONS.duration.normal} ${TRANSITIONS.easing.easeOut}`,
        borderRadius: RADIUS.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        outline: 'none',
    };
};
// ====== EXPORT UNIFIED THEME ======
export const THEME = {
    colors: COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    gradients: GRADIENTS,
    transitions: TRANSITIONS,
    zIndex: ZINDEX,
    variants: VARIANTS,
    sizes: SIZES,
    createStyle,
};
export default THEME;
//# sourceMappingURL=unified-design-system.js.map