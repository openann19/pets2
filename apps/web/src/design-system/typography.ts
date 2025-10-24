/**
 * 📝 TYPOGRAPHY SCALE
 * Comprehensive typography system with semantic roles and responsive scaling
 */
export const TYPOGRAPHY = {
    // Font families
    fonts: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Georgia', 'serif'],
    },
    // Font sizes (xs to 6xl)
    sizes: {
        xs: {
            fontSize: '0.75rem', // 12px
            lineHeight: '1rem', // 16px
            letterSpacing: '0.025em',
        },
        sm: {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
            letterSpacing: '0.025em',
        },
        base: {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem', // 24px
            letterSpacing: '0em',
        },
        lg: {
            fontSize: '1.125rem', // 18px
            lineHeight: '1.75rem', // 28px
            letterSpacing: '-0.025em',
        },
        xl: {
            fontSize: '1.25rem', // 20px
            lineHeight: '1.75rem', // 28px
            letterSpacing: '-0.025em',
        },
        '2xl': {
            fontSize: '1.5rem', // 24px
            lineHeight: '2rem', // 32px
            letterSpacing: '-0.025em',
        },
        '3xl': {
            fontSize: '1.875rem', // 30px
            lineHeight: '2.25rem', // 36px
            letterSpacing: '-0.025em',
        },
        '4xl': {
            fontSize: '2.25rem', // 36px
            lineHeight: '2.5rem', // 40px
            letterSpacing: '-0.025em',
        },
        '5xl': {
            fontSize: '3rem', // 48px
            lineHeight: '1', // 48px
            letterSpacing: '-0.025em',
        },
        '6xl': {
            fontSize: '3.75rem', // 60px
            lineHeight: '1', // 60px
            letterSpacing: '-0.025em',
        },
    },
    // Font weights
    weights: {
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
    // Semantic text roles
    roles: {
        // Headings
        h1: {
            fontSize: '2.25rem', // 36px
            lineHeight: '2.5rem', // 40px
            fontWeight: '700',
            letterSpacing: '-0.025em',
            fontFamily: 'display',
        },
        h2: {
            fontSize: '1.875rem', // 30px
            lineHeight: '2.25rem', // 36px
            fontWeight: '600',
            letterSpacing: '-0.025em',
            fontFamily: 'display',
        },
        h3: {
            fontSize: '1.5rem', // 24px
            lineHeight: '2rem', // 32px
            fontWeight: '600',
            letterSpacing: '-0.025em',
        },
        h4: {
            fontSize: '1.25rem', // 20px
            lineHeight: '1.75rem', // 28px
            fontWeight: '600',
            letterSpacing: '-0.025em',
        },
        h5: {
            fontSize: '1.125rem', // 18px
            lineHeight: '1.75rem', // 28px
            fontWeight: '600',
            letterSpacing: '-0.025em',
        },
        h6: {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem', // 24px
            fontWeight: '600',
            letterSpacing: '-0.025em',
        },
        // Body text
        body: {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem', // 24px
            fontWeight: '400',
            letterSpacing: '0em',
        },
        'body-sm': {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
            fontWeight: '400',
            letterSpacing: '0.025em',
        },
        'body-lg': {
            fontSize: '1.125rem', // 18px
            lineHeight: '1.75rem', // 28px
            fontWeight: '400',
            letterSpacing: '-0.025em',
        },
        // UI elements
        caption: {
            fontSize: '0.75rem', // 12px
            lineHeight: '1rem', // 16px
            fontWeight: '400',
            letterSpacing: '0.025em',
        },
        label: {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
            fontWeight: '500',
            letterSpacing: '0.025em',
        },
        button: {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
            fontWeight: '600',
            letterSpacing: '0.025em',
        },
        'button-lg': {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem', // 24px
            fontWeight: '600',
            letterSpacing: '0.025em',
        },
        // Special text
        code: {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
            fontWeight: '400',
            fontFamily: 'mono',
            letterSpacing: '0em',
        },
        'code-sm': {
            fontSize: '0.75rem', // 12px
            lineHeight: '1rem', // 16px
            fontWeight: '400',
            fontFamily: 'mono',
            letterSpacing: '0em',
        },
    },
    // Responsive typography
    responsive: {
        // Mobile-first approach
        mobile: {
            h1: { fontSize: '1.875rem', lineHeight: '2.25rem' },
            h2: { fontSize: '1.5rem', lineHeight: '2rem' },
            h3: { fontSize: '1.25rem', lineHeight: '1.75rem' },
        },
        tablet: {
            h1: { fontSize: '2.25rem', lineHeight: '2.5rem' },
            h2: { fontSize: '1.875rem', lineHeight: '2.25rem' },
            h3: { fontSize: '1.5rem', lineHeight: '2rem' },
        },
        desktop: {
            h1: { fontSize: '3rem', lineHeight: '1' },
            h2: { fontSize: '2.25rem', lineHeight: '2.5rem' },
            h3: { fontSize: '1.875rem', lineHeight: '2.25rem' },
        },
    },
};
// CSS custom properties for typography
export const TYPOGRAPHY_CSS_VARS = `
  :root {
    /* Font families */
    --font-sans: ${TYPOGRAPHY.fonts.sans.join(', ')};
    --font-display: ${TYPOGRAPHY.fonts.display.join(', ')};
    --font-mono: ${TYPOGRAPHY.fonts.mono.join(', ')};
    --font-serif: ${TYPOGRAPHY.fonts.serif.join(', ')};

    /* Font sizes */
    --text-xs: ${TYPOGRAPHY.sizes.xs.fontSize};
    --text-sm: ${TYPOGRAPHY.sizes.sm.fontSize};
    --text-base: ${TYPOGRAPHY.sizes.base.fontSize};
    --text-lg: ${TYPOGRAPHY.sizes.lg.fontSize};
    --text-xl: ${TYPOGRAPHY.sizes.xl.fontSize};
    --text-2xl: ${TYPOGRAPHY.sizes['2xl'].fontSize};
    --text-3xl: ${TYPOGRAPHY.sizes['3xl'].fontSize};
    --text-4xl: ${TYPOGRAPHY.sizes['4xl'].fontSize};
    --text-5xl: ${TYPOGRAPHY.sizes['5xl'].fontSize};
    --text-6xl: ${TYPOGRAPHY.sizes['6xl'].fontSize};

    /* Line heights */
    --leading-xs: ${TYPOGRAPHY.sizes.xs.lineHeight};
    --leading-sm: ${TYPOGRAPHY.sizes.sm.lineHeight};
    --leading-base: ${TYPOGRAPHY.sizes.base.lineHeight};
    --leading-lg: ${TYPOGRAPHY.sizes.lg.lineHeight};
    --leading-xl: ${TYPOGRAPHY.sizes.xl.lineHeight};
    --leading-2xl: ${TYPOGRAPHY.sizes['2xl'].lineHeight};
    --leading-3xl: ${TYPOGRAPHY.sizes['3xl'].lineHeight};
    --leading-4xl: ${TYPOGRAPHY.sizes['4xl'].lineHeight};
    --leading-5xl: ${TYPOGRAPHY.sizes['5xl'].lineHeight};
    --leading-6xl: ${TYPOGRAPHY.sizes['6xl'].lineHeight};

    /* Font weights */
    --font-thin: ${TYPOGRAPHY.weights.thin};
    --font-extralight: ${TYPOGRAPHY.weights.extralight};
    --font-light: ${TYPOGRAPHY.weights.light};
    --font-normal: ${TYPOGRAPHY.weights.normal};
    --font-medium: ${TYPOGRAPHY.weights.medium};
    --font-semibold: ${TYPOGRAPHY.weights.semibold};
    --font-bold: ${TYPOGRAPHY.weights.bold};
    --font-extrabold: ${TYPOGRAPHY.weights.extrabold};
    --font-black: ${TYPOGRAPHY.weights.black};
  }
`;
export default TYPOGRAPHY;
//# sourceMappingURL=typography.js.map