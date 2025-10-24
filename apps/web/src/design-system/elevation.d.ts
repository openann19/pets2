/**
 * 🏗️ ELEVATION TOKENS
 * Comprehensive shadow and elevation system for depth and hierarchy
 */
export declare const ELEVATION: {
    levels: {
        'shadow-xs': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-sm': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-md': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-lg': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-xl': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-2xl': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-3xl': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
    };
    premium: {
        'shadow-primary': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-secondary': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-success': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-warning': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'shadow-error': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
    };
    glass: {
        'glass-sm': {
            boxShadow: string;
            backdropFilter: string;
            background: string;
            border: string;
            zIndex: number;
            description: string;
        };
        'glass-md': {
            boxShadow: string;
            backdropFilter: string;
            background: string;
            border: string;
            zIndex: number;
            description: string;
        };
        'glass-lg': {
            boxShadow: string;
            backdropFilter: string;
            background: string;
            border: string;
            zIndex: number;
            description: string;
        };
        'glass-dark': {
            boxShadow: string;
            backdropFilter: string;
            background: string;
            border: string;
            zIndex: number;
            description: string;
        };
    };
    neon: {
        'neon-sm': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'neon-md': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'neon-lg': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'neon-primary': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
        'neon-secondary': {
            boxShadow: string;
            zIndex: number;
            description: string;
        };
    };
    interactive: {
        'hover-lift': {
            transform: string;
            boxShadow: string;
            transition: string;
            description: string;
        };
        'hover-glow': {
            boxShadow: string;
            transition: string;
            description: string;
        };
        'hover-scale': {
            transform: string;
            boxShadow: string;
            transition: string;
            description: string;
        };
    };
    layers: {
        background: {
            zIndex: number;
            description: string;
        };
        content: {
            zIndex: number;
            description: string;
        };
        overlay: {
            zIndex: number;
            description: string;
        };
        modal: {
            zIndex: number;
            description: string;
        };
        tooltip: {
            zIndex: number;
            description: string;
        };
        notification: {
            zIndex: number;
            description: string;
        };
    };
};
export declare const ELEVATION_CSS_VARS: string;
export declare const getElevation: (level: keyof typeof ELEVATION.levels) => {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
};
export declare const getPremiumElevation: (color: keyof typeof ELEVATION.premium) => {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
};
export declare const getGlassElevation: (size: keyof typeof ELEVATION.glass) => {
    boxShadow: string;
    backdropFilter: string;
    background: string;
    border: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    backdropFilter: string;
    background: string;
    border: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    backdropFilter: string;
    background: string;
    border: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    backdropFilter: string;
    background: string;
    border: string;
    zIndex: number;
    description: string;
};
export declare const getNeonElevation: (intensity: keyof typeof ELEVATION.neon) => {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
} | {
    boxShadow: string;
    zIndex: number;
    description: string;
};
export declare const getInteractiveElevation: (effect: keyof typeof ELEVATION.interactive) => {
    transform: string;
    boxShadow: string;
    transition: string;
    description: string;
} | {
    boxShadow: string;
    transition: string;
    description: string;
} | {
    transform: string;
    boxShadow: string;
    transition: string;
    description: string;
};
export default ELEVATION;
//# sourceMappingURL=elevation.d.ts.map