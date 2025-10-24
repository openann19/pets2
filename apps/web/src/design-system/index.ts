/**
 * 🎨 UNIFIED DESIGN SYSTEM
 * Single source of truth for all design tokens
 * WCAG-AA compliant with comprehensive testing
 */
// ====== WCAG-AA COMPLIANT COLOR PALETTE ======
export const COLORS = {
    // Brand Primary (Pink/Rose) - WCAG-AA compliant
    primary: {
        50: '#fdf2f8', // Lightest - for backgrounds
        100: '#fce7f3', // Very light - for subtle backgrounds
        200: '#fbcfe8', // Light - for borders
        300: '#f9a8d4', // Light medium - for hover states
        400: '#f472b6', // Medium - for secondary elements
        500: '#ec4899', // Base - primary brand color
        600: '#db2777', // Dark - for hover states
        700: '#be185d', // Darker - for active states
        800: '#9d174d', // Very dark - for text on light
        900: '#831843', // Darkest - for high contrast text
        950: '#500724', // Ultra dark - for maximum contrast
    },
    // Brand Secondary (Purple/Violet) - WCAG-AA compliant
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
    // Neutral Grays - WCAG-AA compliant
    neutral: {
        0: '#ffffff', // Pure white
        50: '#fafafa', // Off-white
        100: '#f5f5f5', // Very light gray
        200: '#e5e5e5', // Light gray
        300: '#d4d4d4', // Medium light gray
        400: '#a3a3a3', // Medium gray
        500: '#737373', // Base gray
        600: '#525252', // Dark gray
        700: '#404040', // Darker gray
        800: '#262626', // Very dark gray
        900: '#171717', // Almost black
        950: '#0a0a0a', // Pure black
    },
    // Semantic Colors - WCAG-AA compliant
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Base success
        600: '#16a34a', // Dark success
        700: '#15803d', // Darker success
        800: '#166534',
        900: '#14532d',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Base error
        600: '#dc2626', // Dark error
        700: '#b91c1c', // Darker error
        800: '#991b1b',
        900: '#7f1d1d',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Base warning
        600: '#d97706', // Dark warning
        700: '#b45309', // Darker warning
        800: '#92400e',
        900: '#78350f',
    },
    info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Base info
        600: '#2563eb', // Dark info
        700: '#1d4ed8', // Darker info
        800: '#1e40af',
        900: '#1e3a8a',
    },
};
// ====== DARK MODE COLORS ======
export const DARK_COLORS = {
    // Dark mode primary
    primary: {
        50: '#500724',
        100: '#831843',
        200: '#9d174d',
        300: '#be185d',
        400: '#db2777',
        500: '#ec4899',
        600: '#f472b6',
        700: '#f9a8d4',
        800: '#fbcfe8',
        900: '#fce7f3',
        950: '#fdf2f8',
    },
    // Dark mode secondary
    secondary: {
        50: '#3b0764',
        100: '#581c87',
        200: '#6b21a8',
        300: '#7e22ce',
        400: '#9333ea',
        500: '#a855f7',
        600: '#c084fc',
        700: '#d8b4fe',
        800: '#e9d5ff',
        900: '#f3e8ff',
        950: '#faf5ff',
    },
    // Dark mode neutral
    neutral: {
        0: '#0a0a0a',
        50: '#171717',
        100: '#262626',
        200: '#404040',
        300: '#525252',
        400: '#737373',
        500: '#a3a3a3',
        600: '#d4d4d4',
        700: '#e5e5e5',
        800: '#f5f5f5',
        900: '#fafafa',
        950: '#ffffff',
    },
};
// ====== TYPOGRAPHY SCALE ======
export const TYPOGRAPHY = {
    // Font Families
    fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
    },
    // Font Sizes (rem units for accessibility)
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
        '7xl': '4.5rem', // 72px
        '8xl': '6rem', // 96px
        '9xl': '8rem', // 128px
    },
    // Font Weights
    fontWeight: {
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
    // Line Heights
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },
    // Letter Spacing
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },
    // Text Styles
    textStyles: {
        // Headings
        h1: {
            fontSize: '2.25rem',
            fontWeight: '700',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        h2: {
            fontSize: '1.875rem',
            fontWeight: '600',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: '600',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: '600',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: '600',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: '600',
            lineHeight: '1.25',
            letterSpacing: '-0.025em',
        },
        // Body text
        body: {
            fontSize: '1rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0em',
        },
        bodyLarge: {
            fontSize: '1.125rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0em',
        },
        bodySmall: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0em',
        },
        // UI text
        caption: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.25',
            letterSpacing: '0.025em',
        },
        small: {
            fontSize: '0.75rem',
            fontWeight: '400',
            lineHeight: '1.25',
            letterSpacing: '0.025em',
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.25',
            letterSpacing: '0.025em',
        },
        // Special text
        code: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0em',
            fontFamily: 'JetBrains Mono, monospace',
        },
        pre: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0em',
            fontFamily: 'JetBrains Mono, monospace',
        },
    },
};
// ====== SPACING SCALE ======
export const SPACING = {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
};
// ====== BORDER RADIUS ======
export const RADIUS = {
    none: '0',
    sm: '0.125rem', // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
};
// ====== SHADOWS ======
export const SHADOWS = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Interactive shadows
    hover: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
    focus: '0 0 0 3px rgba(236, 72, 153, 0.1)',
    focusRing: '0 0 0 3px rgba(236, 72, 153, 0.1)',
    // Color-specific shadows
    primary: '0 10px 40px -10px rgba(236, 72, 153, 0.6)',
    secondary: '0 10px 40px -10px rgba(168, 85, 247, 0.6)',
    success: '0 10px 40px -10px rgba(34, 197, 94, 0.6)',
    error: '0 10px 40px -10px rgba(239, 68, 68, 0.6)',
    warning: '0 10px 40px -10px rgba(245, 158, 11, 0.6)',
    info: '0 10px 40px -10px rgba(59, 130, 246, 0.6)',
    // Premium shadows
    premium: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
    'premium-lg': '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
    // Glass morphism
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.2)',
    // Neon effects
    neon: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
    'neon-strong': '0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)',
};
// ====== GRADIENTS ======
export const GRADIENTS = {
    // Brand gradients
    primary: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    // Premium gradients
    premium: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    royal: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    // Mesh gradients
    mesh: {
        warm: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)',
        cool: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        royal: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    // Glass morphism
    glass: 'rgba(255, 255, 255, 0.1)',
    'glass-dark': 'rgba(0, 0, 0, 0.1)',
    'glass-light': 'rgba(255, 255, 255, 0.2)',
    // Special effects
    holographic: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)',
    neon: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    rainbow: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)',
};
// ====== TRANSITIONS ======
export const TRANSITIONS = {
    // Duration
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '750ms',
        slowest: '1000ms',
    },
    // Easing functions
    easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    // Spring physics for Framer Motion
    spring: {
        gentle: { stiffness: 200, damping: 25 },
        normal: { stiffness: 300, damping: 25 },
        bouncy: { stiffness: 400, damping: 15 },
        snappy: { stiffness: 600, damping: 30 },
        wobbly: { stiffness: 180, damping: 12 },
    },
    // Common transitions
    common: {
        all: 'all 300ms ease-out',
        colors: 'color 300ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out',
        transform: 'transform 300ms ease-out',
        opacity: 'opacity 300ms ease-out',
        shadow: 'box-shadow 300ms ease-out',
    },
};
// ====== Z-INDEX SCALE ======
export const ZINDEX = {
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
};
// ====== BREAKPOINTS ======
export const BREAKPOINTS = {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1600px',
    uhd: '1920px',
    '4k': '3840px',
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
            focus: {
                shadow: SHADOWS.focusRing,
            },
            active: {
                transform: 'translateY(0)',
                shadow: SHADOWS.md,
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
            focus: {
                shadow: SHADOWS.focusRing,
            },
            active: {
                transform: 'translateY(0)',
                shadow: SHADOWS.md,
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
                shadow: SHADOWS.md,
            },
            focus: {
                shadow: SHADOWS.focusRing,
            },
            active: {
                transform: 'translateY(0)',
                shadow: SHADOWS.sm,
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
                shadow: SHADOWS.sm,
            },
            focus: {
                shadow: SHADOWS.focusRing,
            },
            active: {
                transform: 'translateY(0)',
                background: COLORS.neutral[200],
            },
        },
        danger: {
            background: GRADIENTS.error,
            color: COLORS.neutral[0],
            border: 'none',
            shadow: SHADOWS.error,
            hover: {
                transform: 'translateY(-2px)',
                shadow: SHADOWS.hover,
            },
            focus: {
                shadow: SHADOWS.focusRing,
            },
            active: {
                transform: 'translateY(0)',
                shadow: SHADOWS.md,
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
        premium: {
            background: COLORS.neutral[0],
            border: 'none',
            shadow: SHADOWS.premium,
            radius: RADIUS['2xl'],
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
                shadow: SHADOWS.focusRing,
            },
            error: {
                border: `2px solid ${COLORS.error[500]}`,
                shadow: SHADOWS.error,
            },
        },
        filled: {
            background: COLORS.neutral[100],
            border: 'none',
            color: COLORS.neutral[900],
            focus: {
                background: COLORS.neutral[0],
                border: `2px solid ${COLORS.primary[500]}`,
                shadow: SHADOWS.focusRing,
            },
            error: {
                background: COLORS.error[50],
                border: `2px solid ${COLORS.error[500]}`,
                shadow: SHADOWS.error,
            },
        },
        outline: {
            background: 'transparent',
            border: `2px solid ${COLORS.neutral[300]}`,
            color: COLORS.neutral[900],
            focus: {
                border: `2px solid ${COLORS.primary[500]}`,
                shadow: SHADOWS.focusRing,
            },
            error: {
                border: `2px solid ${COLORS.error[500]}`,
                shadow: SHADOWS.error,
            },
        },
    },
};
// ====== COMPONENT SIZES ======
export const SIZES = {
    button: {
        xs: {
            padding: `${SPACING[1.5]} ${SPACING[3]}`,
            fontSize: TYPOGRAPHY.fontSize.xs,
            height: '28px',
            minWidth: '64px',
        },
        sm: {
            padding: `${SPACING[2]} ${SPACING[4]}`,
            fontSize: TYPOGRAPHY.fontSize.sm,
            height: '36px',
            minWidth: '72px',
        },
        md: {
            padding: `${SPACING[3]} ${SPACING[6]}`,
            fontSize: TYPOGRAPHY.fontSize.base,
            height: '44px',
            minWidth: '80px',
        },
        lg: {
            padding: `${SPACING[4]} ${SPACING[8]}`,
            fontSize: TYPOGRAPHY.fontSize.lg,
            height: '52px',
            minWidth: '96px',
        },
        xl: {
            padding: `${SPACING[5]} ${SPACING[10]}`,
            fontSize: TYPOGRAPHY.fontSize.xl,
            height: '60px',
            minWidth: '112px',
        },
    },
    input: {
        xs: {
            padding: `${SPACING[1.5]} ${SPACING[3]}`,
            fontSize: TYPOGRAPHY.fontSize.xs,
            height: '28px',
        },
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
        xl: {
            padding: `${SPACING[5]} ${SPACING[6]}`,
            fontSize: TYPOGRAPHY.fontSize.xl,
            height: '60px',
        },
    },
    avatar: {
        xs: { width: '24px', height: '24px' },
        sm: { width: '32px', height: '32px' },
        md: { width: '40px', height: '40px' },
        lg: { width: '48px', height: '48px' },
        xl: { width: '64px', height: '64px' },
        '2xl': { width: '80px', height: '80px' },
        '3xl': { width: '96px', height: '96px' },
    },
};
// ====== UTILITY FUNCTIONS ======
export const createStyle = (variant, size) => {
    return {
        ...VARIANTS.button[variant],
        ...SIZES.button[size],
        transition: TRANSITIONS.common.all,
        borderRadius: RADIUS.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        outline: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
    };
};
// ====== WCAG-AA COMPLIANCE HELPERS ======
export const WCAG = {
    // Minimum contrast ratios for WCAG-AA
    contrast: {
        normal: 4.5, // Normal text
        large: 3.0, // Large text (18pt+ or 14pt+ bold)
        enhanced: 7.0, // Enhanced contrast (WCAG-AAA)
    },
    // Color combinations that meet WCAG-AA
    combinations: {
        // Primary colors
        primaryOnWhite: { foreground: COLORS.primary[700], background: COLORS.neutral[0] },
        primaryOnLight: { foreground: COLORS.primary[800], background: COLORS.neutral[100] },
        whiteOnPrimary: { foreground: COLORS.neutral[0], background: COLORS.primary[600] },
        // Secondary colors
        secondaryOnWhite: { foreground: COLORS.secondary[700], background: COLORS.neutral[0] },
        secondaryOnLight: { foreground: COLORS.secondary[800], background: COLORS.neutral[100] },
        whiteOnSecondary: { foreground: COLORS.neutral[0], background: COLORS.secondary[600] },
        // Neutral colors
        darkOnLight: { foreground: COLORS.neutral[800], background: COLORS.neutral[100] },
        lightOnDark: { foreground: COLORS.neutral[100], background: COLORS.neutral[800] },
        darkOnWhite: { foreground: COLORS.neutral[900], background: COLORS.neutral[0] },
        whiteOnDark: { foreground: COLORS.neutral[0], background: COLORS.neutral[900] },
        // Semantic colors
        successOnWhite: { foreground: COLORS.success[700], background: COLORS.neutral[0] },
        errorOnWhite: { foreground: COLORS.error[700], background: COLORS.neutral[0] },
        warningOnWhite: { foreground: COLORS.warning[700], background: COLORS.neutral[0] },
        infoOnWhite: { foreground: COLORS.info[700], background: COLORS.neutral[0] },
    },
    // Focus indicators
    focus: {
        ring: `0 0 0 3px ${COLORS.primary[500]}40`,
        outline: `2px solid ${COLORS.primary[500]}`,
        offset: '2px',
    },
    // Touch targets (minimum 44px for accessibility)
    touchTarget: {
        min: '44px',
        recommended: '48px',
        large: '56px',
    },
};
// ====== EXPORT UNIFIED THEME ======
export const THEME = {
    colors: COLORS,
    darkColors: DARK_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    gradients: GRADIENTS,
    transitions: TRANSITIONS,
    zIndex: ZINDEX,
    breakpoints: BREAKPOINTS,
    variants: VARIANTS,
    sizes: SIZES,
    wcag: WCAG,
    createStyle,
};
export default THEME;
//# sourceMappingURL=index.js.map