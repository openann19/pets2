/**
 * 🏗️ ELEVATION TOKENS
 * Comprehensive shadow and elevation system for depth and hierarchy
 */
export const ELEVATION = {
    // Standard elevation levels (shadow-xs to shadow-3xl)
    levels: {
        'shadow-xs': {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            zIndex: 1,
            description: 'Subtle elevation for cards and inputs',
        },
        'shadow-sm': {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            zIndex: 2,
            description: 'Light elevation for buttons and small cards',
        },
        'shadow-md': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 3,
            description: 'Medium elevation for modals and dropdowns',
        },
        'shadow-lg': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 4,
            description: 'High elevation for tooltips and popovers',
        },
        'shadow-xl': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 5,
            description: 'Very high elevation for overlays',
        },
        'shadow-2xl': {
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 6,
            description: 'Maximum elevation for full-screen modals',
        },
        'shadow-3xl': {
            boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
            zIndex: 7,
            description: 'Ultra-high elevation for special effects',
        },
    },
    // Premium elevation with color tints
    premium: {
        'shadow-primary': {
            boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.2), 0 4px 6px -2px rgba(236, 72, 153, 0.1)',
            zIndex: 4,
            description: 'Primary colored elevation for premium elements',
        },
        'shadow-secondary': {
            boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.2), 0 4px 6px -2px rgba(168, 85, 247, 0.1)',
            zIndex: 4,
            description: 'Secondary colored elevation for premium elements',
        },
        'shadow-success': {
            boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)',
            zIndex: 4,
            description: 'Success colored elevation for positive actions',
        },
        'shadow-warning': {
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.2), 0 4px 6px -2px rgba(245, 158, 11, 0.1)',
            zIndex: 4,
            description: 'Warning colored elevation for caution elements',
        },
        'shadow-error': {
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)',
            zIndex: 4,
            description: 'Error colored elevation for destructive actions',
        },
    },
    // Glass morphism elevation
    glass: {
        'glass-sm': {
            boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
            backdropFilter: 'blur(8px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: 3,
            description: 'Light glass morphism effect',
        },
        'glass-md': {
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            backdropFilter: 'blur(16px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            zIndex: 4,
            description: 'Medium glass morphism effect',
        },
        'glass-lg': {
            boxShadow: '0 16px 64px 0 rgba(31, 38, 135, 0.2)',
            backdropFilter: 'blur(24px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            zIndex: 5,
            description: 'Strong glass morphism effect',
        },
        'glass-dark': {
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(16px) saturate(180%)',
            background: 'rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 4,
            description: 'Dark glass morphism effect',
        },
    },
    // Neon and glow effects
    neon: {
        'neon-sm': {
            boxShadow: '0 0 10px rgba(236, 72, 153, 0.3), 0 0 20px rgba(236, 72, 153, 0.1)',
            zIndex: 3,
            description: 'Subtle neon glow effect',
        },
        'neon-md': {
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
            zIndex: 4,
            description: 'Medium neon glow effect',
        },
        'neon-lg': {
            boxShadow: '0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)',
            zIndex: 5,
            description: 'Strong neon glow effect',
        },
        'neon-primary': {
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
            zIndex: 4,
            description: 'Primary colored neon effect',
        },
        'neon-secondary': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)',
            zIndex: 4,
            description: 'Secondary colored neon effect',
        },
    },
    // Interactive elevation (hover states)
    interactive: {
        'hover-lift': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            description: 'Lift effect on hover',
        },
        'hover-glow': {
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            description: 'Glow effect on hover',
        },
        'hover-scale': {
            transform: 'scale(1.02)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            description: 'Scale effect on hover',
        },
    },
    // Depth layers for complex UIs
    layers: {
        background: {
            zIndex: 0,
            description: 'Background layer',
        },
        content: {
            zIndex: 1,
            description: 'Main content layer',
        },
        overlay: {
            zIndex: 10,
            description: 'Overlay layer',
        },
        modal: {
            zIndex: 20,
            description: 'Modal layer',
        },
        tooltip: {
            zIndex: 30,
            description: 'Tooltip layer',
        },
        notification: {
            zIndex: 40,
            description: 'Notification layer',
        },
    },
};
// CSS custom properties for elevation
export const ELEVATION_CSS_VARS = `
  :root {
    /* Standard shadows */
    --shadow-xs: ${ELEVATION.levels['shadow-xs'].boxShadow};
    --shadow-sm: ${ELEVATION.levels['shadow-sm'].boxShadow};
    --shadow-md: ${ELEVATION.levels['shadow-md'].boxShadow};
    --shadow-lg: ${ELEVATION.levels['shadow-lg'].boxShadow};
    --shadow-xl: ${ELEVATION.levels['shadow-xl'].boxShadow};
    --shadow-2xl: ${ELEVATION.levels['shadow-2xl'].boxShadow};
    --shadow-3xl: ${ELEVATION.levels['shadow-3xl'].boxShadow};

    /* Premium shadows */
    --shadow-primary: ${ELEVATION.premium['shadow-primary'].boxShadow};
    --shadow-secondary: ${ELEVATION.premium['shadow-secondary'].boxShadow};
    --shadow-success: ${ELEVATION.premium['shadow-success'].boxShadow};
    --shadow-warning: ${ELEVATION.premium['shadow-warning'].boxShadow};
    --shadow-error: ${ELEVATION.premium['shadow-error'].boxShadow};

    /* Glass morphism */
    --glass-sm-shadow: ${ELEVATION.glass['glass-sm'].boxShadow};
    --glass-md-shadow: ${ELEVATION.glass['glass-md'].boxShadow};
    --glass-lg-shadow: ${ELEVATION.glass['glass-lg'].boxShadow};
    --glass-dark-shadow: ${ELEVATION.glass['glass-dark'].boxShadow};

    /* Neon effects */
    --neon-sm: ${ELEVATION.neon['neon-sm'].boxShadow};
    --neon-md: ${ELEVATION.neon['neon-md'].boxShadow};
    --neon-lg: ${ELEVATION.neon['neon-lg'].boxShadow};
    --neon-primary: ${ELEVATION.neon['neon-primary'].boxShadow};
    --neon-secondary: ${ELEVATION.neon['neon-secondary'].boxShadow};

    /* Z-index layers */
    --z-background: ${ELEVATION.layers.background.zIndex};
    --z-content: ${ELEVATION.layers.content.zIndex};
    --z-overlay: ${ELEVATION.layers.overlay.zIndex};
    --z-modal: ${ELEVATION.layers.modal.zIndex};
    --z-tooltip: ${ELEVATION.layers.tooltip.zIndex};
    --z-notification: ${ELEVATION.layers.notification.zIndex};
  }
`;
// Utility functions for elevation
export const getElevation = (level) => {
    return ELEVATION.levels[level];
};
export const getPremiumElevation = (color) => {
    return ELEVATION.premium[color];
};
export const getGlassElevation = (size) => {
    return ELEVATION.glass[size];
};
export const getNeonElevation = (intensity) => {
    return ELEVATION.neon[intensity];
};
export const getInteractiveElevation = (effect) => {
    return ELEVATION.interactive[effect];
};
export default ELEVATION;
//# sourceMappingURL=elevation.js.map