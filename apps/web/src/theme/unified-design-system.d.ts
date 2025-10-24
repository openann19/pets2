/**
 * 🎨 UNIFIED DESIGN SYSTEM
 * Single source of truth for all UI components
 * Ensures pixel-perfect consistency across the entire application
 */
export declare const COLORS: {
    readonly primary: {
        readonly 50: "#fdf2f8";
        readonly 100: "#fce7f3";
        readonly 200: "#fbcfe8";
        readonly 300: "#f9a8d4";
        readonly 400: "#f472b6";
        readonly 500: "#ec4899";
        readonly 600: "#db2777";
        readonly 700: "#be185d";
        readonly 800: "#9d174d";
        readonly 900: "#831843";
    };
    readonly secondary: {
        readonly 50: "#faf5ff";
        readonly 100: "#f3e8ff";
        readonly 200: "#e9d5ff";
        readonly 300: "#d8b4fe";
        readonly 400: "#c084fc";
        readonly 500: "#a855f7";
        readonly 600: "#9333ea";
        readonly 700: "#7e22ce";
        readonly 800: "#6b21a8";
        readonly 900: "#581c87";
    };
    readonly neutral: {
        readonly 0: "#ffffff";
        readonly 50: "#fafafa";
        readonly 100: "#f5f5f5";
        readonly 200: "#e5e5e5";
        readonly 300: "#d4d4d4";
        readonly 400: "#a3a3a3";
        readonly 500: "#737373";
        readonly 600: "#525252";
        readonly 700: "#404040";
        readonly 800: "#262626";
        readonly 900: "#171717";
        readonly 950: "#0a0a0a";
    };
    readonly success: {
        readonly 50: "#f0fdf4";
        readonly 100: "#dcfce7";
        readonly 400: "#4ade80";
        readonly 500: "#22c55e";
        readonly 600: "#16a34a";
        readonly 700: "#15803d";
    };
    readonly error: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
    };
    readonly warning: {
        readonly 50: "#fffbeb";
        readonly 100: "#fef3c7";
        readonly 400: "#fbbf24";
        readonly 500: "#f59e0b";
        readonly 600: "#d97706";
    };
    readonly info: {
        readonly 50: "#eff6ff";
        readonly 100: "#dbeafe";
        readonly 400: "#60a5fa";
        readonly 500: "#3b82f6";
        readonly 600: "#2563eb";
    };
};
export declare const TYPOGRAPHY: {
    readonly fontFamily: {
        readonly sans: readonly ["Inter", "system-ui", "sans-serif"];
        readonly mono: readonly ["JetBrains Mono", "monospace"];
    };
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
        readonly '6xl': "3.75rem";
    };
    readonly fontWeight: {
        readonly light: "300";
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly normal: "1.5";
        readonly relaxed: "1.75";
    };
    readonly textStyles: {
        readonly heading1: {
            readonly fontSize: "2.25rem";
            readonly fontWeight: "700";
            readonly lineHeight: "1.25";
        };
        readonly heading2: {
            readonly fontSize: "1.875rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
        };
        readonly heading3: {
            readonly fontSize: "1.5rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
        };
        readonly heading4: {
            readonly fontSize: "1.25rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
        };
        readonly body: {
            readonly fontSize: "1rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
        readonly bodyLarge: {
            readonly fontSize: "1.125rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
        readonly caption: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
        readonly small: {
            readonly fontSize: "0.75rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
        };
    };
};
export declare const SPACING: {
    readonly 0: "0";
    readonly 1: "0.25rem";
    readonly 2: "0.5rem";
    readonly 3: "0.75rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 8: "2rem";
    readonly 10: "2.5rem";
    readonly 12: "3rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 32: "8rem";
};
export declare const RADIUS: {
    readonly none: "0";
    readonly sm: "0.375rem";
    readonly md: "0.5rem";
    readonly lg: "0.75rem";
    readonly xl: "1rem";
    readonly '2xl': "1.5rem";
    readonly '3xl': "2rem";
    readonly full: "9999px";
};
export declare const SHADOWS: {
    readonly none: "none";
    readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    readonly hover: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    readonly focus: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    readonly primary: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    readonly secondary: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    readonly success: "0 10px 40px -10px rgba(34, 197, 94, 0.6)";
    readonly error: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
};
export declare const GRADIENTS: {
    readonly primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    readonly secondary: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    readonly success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    readonly error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    readonly premium: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
    readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    readonly glass: "rgba(255, 255, 255, 0.1)";
    readonly glassDark: "rgba(0, 0, 0, 0.1)";
};
export declare const TRANSITIONS: {
    readonly duration: {
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
    };
    readonly easing: {
        readonly ease: "ease";
        readonly easeIn: "ease-in";
        readonly easeOut: "ease-out";
        readonly easeInOut: "ease-in-out";
        readonly spring: "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    };
    readonly spring: {
        readonly gentle: {
            readonly stiffness: 200;
            readonly damping: 25;
        };
        readonly normal: {
            readonly stiffness: 300;
            readonly damping: 25;
        };
        readonly bouncy: {
            readonly stiffness: 400;
            readonly damping: 15;
        };
        readonly snappy: {
            readonly stiffness: 600;
            readonly damping: 30;
        };
    };
};
export declare const ZINDEX: {
    readonly base: 0;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly modal: 1200;
    readonly popover: 1300;
    readonly tooltip: 1400;
    readonly toast: 1500;
};
export declare const VARIANTS: {
    readonly button: {
        readonly primary: {
            readonly background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
            readonly color: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
            readonly hover: {
                readonly transform: "translateY(-2px)";
                readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
            };
        };
        readonly secondary: {
            readonly background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
            readonly color: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
            readonly hover: {
                readonly transform: "translateY(-2px)";
                readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
            };
        };
        readonly outline: {
            readonly background: "transparent";
            readonly color: "#db2777";
            readonly border: "2px solid #db2777";
            readonly shadow: "none";
            readonly hover: {
                readonly background: "#db2777";
                readonly color: "#ffffff";
                readonly transform: "translateY(-1px)";
            };
        };
        readonly ghost: {
            readonly background: "transparent";
            readonly color: "#404040";
            readonly border: "none";
            readonly shadow: "none";
            readonly hover: {
                readonly background: "#f5f5f5";
                readonly transform: "translateY(-1px)";
            };
        };
    };
    readonly card: {
        readonly default: {
            readonly background: "#ffffff";
            readonly border: "1px solid #e5e5e5";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            readonly radius: "0.75rem";
        };
        readonly elevated: {
            readonly background: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            readonly radius: "1rem";
        };
        readonly glass: {
            readonly background: "rgba(255, 255, 255, 0.1)";
            readonly border: "1px solid #e5e5e5";
            readonly shadow: any;
            readonly radius: "1rem";
            readonly backdropFilter: "blur(12px)";
        };
    };
    readonly input: {
        readonly default: {
            readonly background: "#ffffff";
            readonly border: "1px solid #d4d4d4";
            readonly color: "#171717";
            readonly focus: {
                readonly border: "2px solid #ec4899";
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
        };
        readonly filled: {
            readonly background: "#f5f5f5";
            readonly border: "none";
            readonly color: "#171717";
            readonly focus: {
                readonly background: "#ffffff";
                readonly border: "2px solid #ec4899";
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
        };
    };
};
export declare const SIZES: {
    readonly button: {
        readonly sm: {
            readonly padding: "0.5rem 1rem";
            readonly fontSize: "0.875rem";
            readonly height: "36px";
        };
        readonly md: {
            readonly padding: "0.75rem 1.5rem";
            readonly fontSize: "1rem";
            readonly height: "44px";
        };
        readonly lg: {
            readonly padding: "1rem 2rem";
            readonly fontSize: "1.125rem";
            readonly height: "52px";
        };
    };
    readonly input: {
        readonly sm: {
            readonly padding: "0.5rem 0.75rem";
            readonly fontSize: "0.875rem";
            readonly height: "36px";
        };
        readonly md: {
            readonly padding: "0.75rem 1rem";
            readonly fontSize: "1rem";
            readonly height: "44px";
        };
        readonly lg: {
            readonly padding: "1rem 1.25rem";
            readonly fontSize: "1.125rem";
            readonly height: "52px";
        };
    };
};
export declare const createStyle: (variant: keyof typeof VARIANTS.button, size: keyof typeof SIZES.button) => {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
    };
} | {
    transition: string;
    borderRadius: "0.75rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
    };
};
export declare const THEME: {
    readonly colors: {
        readonly primary: {
            readonly 50: "#fdf2f8";
            readonly 100: "#fce7f3";
            readonly 200: "#fbcfe8";
            readonly 300: "#f9a8d4";
            readonly 400: "#f472b6";
            readonly 500: "#ec4899";
            readonly 600: "#db2777";
            readonly 700: "#be185d";
            readonly 800: "#9d174d";
            readonly 900: "#831843";
        };
        readonly secondary: {
            readonly 50: "#faf5ff";
            readonly 100: "#f3e8ff";
            readonly 200: "#e9d5ff";
            readonly 300: "#d8b4fe";
            readonly 400: "#c084fc";
            readonly 500: "#a855f7";
            readonly 600: "#9333ea";
            readonly 700: "#7e22ce";
            readonly 800: "#6b21a8";
            readonly 900: "#581c87";
        };
        readonly neutral: {
            readonly 0: "#ffffff";
            readonly 50: "#fafafa";
            readonly 100: "#f5f5f5";
            readonly 200: "#e5e5e5";
            readonly 300: "#d4d4d4";
            readonly 400: "#a3a3a3";
            readonly 500: "#737373";
            readonly 600: "#525252";
            readonly 700: "#404040";
            readonly 800: "#262626";
            readonly 900: "#171717";
            readonly 950: "#0a0a0a";
        };
        readonly success: {
            readonly 50: "#f0fdf4";
            readonly 100: "#dcfce7";
            readonly 400: "#4ade80";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
            readonly 700: "#15803d";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
        };
        readonly warning: {
            readonly 50: "#fffbeb";
            readonly 100: "#fef3c7";
            readonly 400: "#fbbf24";
            readonly 500: "#f59e0b";
            readonly 600: "#d97706";
        };
        readonly info: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 400: "#60a5fa";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly sans: readonly ["Inter", "system-ui", "sans-serif"];
            readonly mono: readonly ["JetBrains Mono", "monospace"];
        };
        readonly fontSize: {
            readonly xs: "0.75rem";
            readonly sm: "0.875rem";
            readonly base: "1rem";
            readonly lg: "1.125rem";
            readonly xl: "1.25rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "1.875rem";
            readonly '4xl': "2.25rem";
            readonly '5xl': "3rem";
            readonly '6xl': "3.75rem";
        };
        readonly fontWeight: {
            readonly light: "300";
            readonly normal: "400";
            readonly medium: "500";
            readonly semibold: "600";
            readonly bold: "700";
            readonly extrabold: "800";
        };
        readonly lineHeight: {
            readonly tight: "1.25";
            readonly normal: "1.5";
            readonly relaxed: "1.75";
        };
        readonly textStyles: {
            readonly heading1: {
                readonly fontSize: "2.25rem";
                readonly fontWeight: "700";
                readonly lineHeight: "1.25";
            };
            readonly heading2: {
                readonly fontSize: "1.875rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
            };
            readonly heading3: {
                readonly fontSize: "1.5rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
            };
            readonly heading4: {
                readonly fontSize: "1.25rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
            };
            readonly body: {
                readonly fontSize: "1rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
            };
            readonly bodyLarge: {
                readonly fontSize: "1.125rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
            };
            readonly caption: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
            };
            readonly small: {
                readonly fontSize: "0.75rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
            };
        };
    };
    readonly spacing: {
        readonly 0: "0";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 8: "2rem";
        readonly 10: "2.5rem";
        readonly 12: "3rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 32: "8rem";
    };
    readonly radius: {
        readonly none: "0";
        readonly sm: "0.375rem";
        readonly md: "0.5rem";
        readonly lg: "0.75rem";
        readonly xl: "1rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "2rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly none: "none";
        readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
        readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
        readonly hover: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        readonly focus: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        readonly primary: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        readonly secondary: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        readonly success: "0 10px 40px -10px rgba(34, 197, 94, 0.6)";
        readonly error: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    };
    readonly gradients: {
        readonly primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        readonly secondary: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        readonly success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
        readonly error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        readonly premium: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
        readonly glass: "rgba(255, 255, 255, 0.1)";
        readonly glassDark: "rgba(0, 0, 0, 0.1)";
    };
    readonly transitions: {
        readonly duration: {
            readonly fast: "150ms";
            readonly normal: "300ms";
            readonly slow: "500ms";
        };
        readonly easing: {
            readonly ease: "ease";
            readonly easeIn: "ease-in";
            readonly easeOut: "ease-out";
            readonly easeInOut: "ease-in-out";
            readonly spring: "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        };
        readonly spring: {
            readonly gentle: {
                readonly stiffness: 200;
                readonly damping: 25;
            };
            readonly normal: {
                readonly stiffness: 300;
                readonly damping: 25;
            };
            readonly bouncy: {
                readonly stiffness: 400;
                readonly damping: 15;
            };
            readonly snappy: {
                readonly stiffness: 600;
                readonly damping: 30;
            };
        };
    };
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 1000;
        readonly sticky: 1100;
        readonly modal: 1200;
        readonly popover: 1300;
        readonly tooltip: 1400;
        readonly toast: 1500;
    };
    readonly variants: {
        readonly button: {
            readonly primary: {
                readonly background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
                readonly color: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
                readonly hover: {
                    readonly transform: "translateY(-2px)";
                    readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
                };
            };
            readonly secondary: {
                readonly background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
                readonly color: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
                readonly hover: {
                    readonly transform: "translateY(-2px)";
                    readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
                };
            };
            readonly outline: {
                readonly background: "transparent";
                readonly color: "#db2777";
                readonly border: "2px solid #db2777";
                readonly shadow: "none";
                readonly hover: {
                    readonly background: "#db2777";
                    readonly color: "#ffffff";
                    readonly transform: "translateY(-1px)";
                };
            };
            readonly ghost: {
                readonly background: "transparent";
                readonly color: "#404040";
                readonly border: "none";
                readonly shadow: "none";
                readonly hover: {
                    readonly background: "#f5f5f5";
                    readonly transform: "translateY(-1px)";
                };
            };
        };
        readonly card: {
            readonly default: {
                readonly background: "#ffffff";
                readonly border: "1px solid #e5e5e5";
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                readonly radius: "0.75rem";
            };
            readonly elevated: {
                readonly background: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                readonly radius: "1rem";
            };
            readonly glass: {
                readonly background: "rgba(255, 255, 255, 0.1)";
                readonly border: "1px solid #e5e5e5";
                readonly shadow: any;
                readonly radius: "1rem";
                readonly backdropFilter: "blur(12px)";
            };
        };
        readonly input: {
            readonly default: {
                readonly background: "#ffffff";
                readonly border: "1px solid #d4d4d4";
                readonly color: "#171717";
                readonly focus: {
                    readonly border: "2px solid #ec4899";
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
            };
            readonly filled: {
                readonly background: "#f5f5f5";
                readonly border: "none";
                readonly color: "#171717";
                readonly focus: {
                    readonly background: "#ffffff";
                    readonly border: "2px solid #ec4899";
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
            };
        };
    };
    readonly sizes: {
        readonly button: {
            readonly sm: {
                readonly padding: "0.5rem 1rem";
                readonly fontSize: "0.875rem";
                readonly height: "36px";
            };
            readonly md: {
                readonly padding: "0.75rem 1.5rem";
                readonly fontSize: "1rem";
                readonly height: "44px";
            };
            readonly lg: {
                readonly padding: "1rem 2rem";
                readonly fontSize: "1.125rem";
                readonly height: "52px";
            };
        };
        readonly input: {
            readonly sm: {
                readonly padding: "0.5rem 0.75rem";
                readonly fontSize: "0.875rem";
                readonly height: "36px";
            };
            readonly md: {
                readonly padding: "0.75rem 1rem";
                readonly fontSize: "1rem";
                readonly height: "44px";
            };
            readonly lg: {
                readonly padding: "1rem 1.25rem";
                readonly fontSize: "1.125rem";
                readonly height: "52px";
            };
        };
    };
    readonly createStyle: (variant: keyof typeof VARIANTS.button, size: keyof typeof SIZES.button) => {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
        };
    } | {
        transition: string;
        borderRadius: "0.75rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
        };
    };
};
export default THEME;
//# sourceMappingURL=unified-design-system.d.ts.map