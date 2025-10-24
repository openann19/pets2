/**
 * 🎨 CSS VARIABLES SYSTEM
 * Centralized CSS custom properties for design tokens
 */
export declare const SPACING_CSS_VARS = "\n  :root {\n    /* 8-pt spacing scale */\n    --space-0: 0;\n    --space-1: 0.125rem;  /* 2px */\n    --space-2: 0.25rem;   /* 4px */\n    --space-3: 0.375rem;  /* 6px */\n    --space-4: 0.5rem;    /* 8px */\n    --space-5: 0.625rem;  /* 10px */\n    --space-6: 0.75rem;   /* 12px */\n    --space-8: 1rem;      /* 16px */\n    --space-10: 1.25rem;  /* 20px */\n    --space-12: 1.5rem;   /* 24px */\n    --space-16: 2rem;     /* 32px */\n    --space-20: 2.5rem;   /* 40px */\n    --space-24: 3rem;     /* 48px */\n    --space-32: 4rem;     /* 64px */\n    --space-40: 5rem;     /* 80px */\n    --space-48: 6rem;     /* 96px */\n    --space-56: 7rem;     /* 112px */\n    --space-64: 8rem;     /* 128px */\n    --space-72: 9rem;     /* 144px */\n    --space-80: 10rem;    /* 160px */\n    --space-96: 12rem;    /* 192px */\n  }\n";
export declare const COLOR_CSS_VARS: string;
export declare const RADIUS_CSS_VARS = "\n  :root {\n    --radius-none: 0;\n    --radius-sm: 0.125rem;   /* 2px */\n    --radius-md: 0.25rem;    /* 4px */\n    --radius-lg: 0.375rem;   /* 6px */\n    --radius-xl: 0.5rem;     /* 8px */\n    --radius-2xl: 0.75rem;   /* 12px */\n    --radius-3xl: 1rem;      /* 16px */\n    --radius-4xl: 1.5rem;    /* 24px */\n    --radius-5xl: 2rem;      /* 32px */\n    --radius-full: 9999px;\n  }\n";
export declare const ANIMATION_CSS_VARS = "\n  :root {\n    /* Transition durations */\n    --duration-75: 75ms;\n    --duration-100: 100ms;\n    --duration-150: 150ms;\n    --duration-200: 200ms;\n    --duration-300: 300ms;\n    --duration-500: 500ms;\n    --duration-700: 700ms;\n    --duration-1000: 1000ms;\n\n    /* Transition timing functions */\n    --ease-linear: linear;\n    --ease-in: cubic-bezier(0.4, 0, 1, 1);\n    --ease-out: cubic-bezier(0, 0, 0.2, 1);\n    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);\n    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);\n    --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);\n\n    /* Animation delays */\n    --delay-75: 75ms;\n    --delay-100: 100ms;\n    --delay-150: 150ms;\n    --delay-200: 200ms;\n    --delay-300: 300ms;\n    --delay-500: 500ms;\n    --delay-700: 700ms;\n    --delay-1000: 1000ms;\n\n    /* Z-index layers */\n    --z-base: 0;\n    --z-dropdown: 1000;\n    --z-sticky: 1100;\n    --z-modal: 1200;\n    --z-popover: 1300;\n    --z-tooltip: 1400;\n    --z-toast: 1500;\n    --z-notification: 1600;\n  }\n";
export declare const LAYOUT_CSS_VARS = "\n  :root {\n    /* Container max widths */\n    --container-sm: 640px;\n    --container-md: 768px;\n    --container-lg: 1024px;\n    --container-xl: 1280px;\n    --container-2xl: 1536px;\n\n    /* Breakpoints */\n    --breakpoint-sm: 640px;\n    --breakpoint-md: 768px;\n    --breakpoint-lg: 1024px;\n    --breakpoint-xl: 1280px;\n    --breakpoint-2xl: 1536px;\n\n    /* Grid system */\n    --grid-cols-1: repeat(1, minmax(0, 1fr));\n    --grid-cols-2: repeat(2, minmax(0, 1fr));\n    --grid-cols-3: repeat(3, minmax(0, 1fr));\n    --grid-cols-4: repeat(4, minmax(0, 1fr));\n    --grid-cols-6: repeat(6, minmax(0, 1fr));\n    --grid-cols-12: repeat(12, minmax(0, 1fr));\n\n    /* Aspect ratios */\n    --aspect-square: 1 / 1;\n    --aspect-video: 16 / 9;\n    --aspect-photo: 4 / 3;\n    --aspect-portrait: 3 / 4;\n    --aspect-wide: 21 / 9;\n  }\n";
export declare const COMPLETE_CSS_VARS: string;
export declare const getCSSVar: (varName: string) => string;
export declare const getColorVar: (color: string) => string;
export declare const getSpacingVar: (size: string) => string;
export declare const getRadiusVar: (size: string) => string;
export declare const getDurationVar: (duration: string) => string;
export declare const getEaseVar: (ease: string) => string;
export declare const injectCSSVars: () => void;
declare const _default: {
    COLOR_CSS_VARS: string;
    SPACING_CSS_VARS: string;
    TYPOGRAPHY_CSS_VARS: string;
    ELEVATION_CSS_VARS: string;
    RADIUS_CSS_VARS: string;
    ANIMATION_CSS_VARS: string;
    LAYOUT_CSS_VARS: string;
    COMPLETE_CSS_VARS: string;
    injectCSSVars: () => void;
    getCSSVar: (varName: string) => string;
    getColorVar: (color: string) => string;
    getSpacingVar: (size: string) => string;
    getRadiusVar: (size: string) => string;
    getDurationVar: (duration: string) => string;
    getEaseVar: (ease: string) => string;
};
export default _default;
//# sourceMappingURL=css-variables.d.ts.map