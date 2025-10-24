/**
 * 🎨 UNIFIED DESIGN SYSTEM
 * Single source of truth for all design tokens
 * WCAG-AA compliant with comprehensive testing
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
        readonly 950: "#500724";
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
        readonly 950: "#3b0764";
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
        readonly 200: "#bbf7d0";
        readonly 300: "#86efac";
        readonly 400: "#4ade80";
        readonly 500: "#22c55e";
        readonly 600: "#16a34a";
        readonly 700: "#15803d";
        readonly 800: "#166534";
        readonly 900: "#14532d";
    };
    readonly error: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
    };
    readonly warning: {
        readonly 50: "#fffbeb";
        readonly 100: "#fef3c7";
        readonly 200: "#fde68a";
        readonly 300: "#fcd34d";
        readonly 400: "#fbbf24";
        readonly 500: "#f59e0b";
        readonly 600: "#d97706";
        readonly 700: "#b45309";
        readonly 800: "#92400e";
        readonly 900: "#78350f";
    };
    readonly info: {
        readonly 50: "#eff6ff";
        readonly 100: "#dbeafe";
        readonly 200: "#bfdbfe";
        readonly 300: "#93c5fd";
        readonly 400: "#60a5fa";
        readonly 500: "#3b82f6";
        readonly 600: "#2563eb";
        readonly 700: "#1d4ed8";
        readonly 800: "#1e40af";
        readonly 900: "#1e3a8a";
    };
};
export declare const DARK_COLORS: {
    readonly primary: {
        readonly 50: "#500724";
        readonly 100: "#831843";
        readonly 200: "#9d174d";
        readonly 300: "#be185d";
        readonly 400: "#db2777";
        readonly 500: "#ec4899";
        readonly 600: "#f472b6";
        readonly 700: "#f9a8d4";
        readonly 800: "#fbcfe8";
        readonly 900: "#fce7f3";
        readonly 950: "#fdf2f8";
    };
    readonly secondary: {
        readonly 50: "#3b0764";
        readonly 100: "#581c87";
        readonly 200: "#6b21a8";
        readonly 300: "#7e22ce";
        readonly 400: "#9333ea";
        readonly 500: "#a855f7";
        readonly 600: "#c084fc";
        readonly 700: "#d8b4fe";
        readonly 800: "#e9d5ff";
        readonly 900: "#f3e8ff";
        readonly 950: "#faf5ff";
    };
    readonly neutral: {
        readonly 0: "#0a0a0a";
        readonly 50: "#171717";
        readonly 100: "#262626";
        readonly 200: "#404040";
        readonly 300: "#525252";
        readonly 400: "#737373";
        readonly 500: "#a3a3a3";
        readonly 600: "#d4d4d4";
        readonly 700: "#e5e5e5";
        readonly 800: "#f5f5f5";
        readonly 900: "#fafafa";
        readonly 950: "#ffffff";
    };
};
export declare const TYPOGRAPHY: {
    readonly fontFamily: {
        readonly sans: readonly ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"];
        readonly mono: readonly ["JetBrains Mono", "Fira Code", "Monaco", "Consolas", "monospace"];
        readonly display: readonly ["SF Pro Display", "Inter", "system-ui", "sans-serif"];
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
        readonly '7xl': "4.5rem";
        readonly '8xl': "6rem";
        readonly '9xl': "8rem";
    };
    readonly fontWeight: {
        readonly thin: "100";
        readonly extralight: "200";
        readonly light: "300";
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
        readonly black: "900";
    };
    readonly lineHeight: {
        readonly none: "1";
        readonly tight: "1.25";
        readonly snug: "1.375";
        readonly normal: "1.5";
        readonly relaxed: "1.625";
        readonly loose: "2";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0em";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
    readonly textStyles: {
        readonly h1: {
            readonly fontSize: "2.25rem";
            readonly fontWeight: "700";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h2: {
            readonly fontSize: "1.875rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h3: {
            readonly fontSize: "1.5rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h4: {
            readonly fontSize: "1.25rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h5: {
            readonly fontSize: "1.125rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly h6: {
            readonly fontSize: "1rem";
            readonly fontWeight: "600";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "-0.025em";
        };
        readonly body: {
            readonly fontSize: "1rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0em";
        };
        readonly bodyLarge: {
            readonly fontSize: "1.125rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0em";
        };
        readonly bodySmall: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0em";
        };
        readonly caption: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "0.025em";
        };
        readonly small: {
            readonly fontSize: "0.75rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "0.025em";
        };
        readonly label: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "500";
            readonly lineHeight: "1.25";
            readonly letterSpacing: "0.025em";
        };
        readonly code: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0em";
            readonly fontFamily: "JetBrains Mono, monospace";
        };
        readonly pre: {
            readonly fontSize: "0.875rem";
            readonly fontWeight: "400";
            readonly lineHeight: "1.5";
            readonly letterSpacing: "0em";
            readonly fontFamily: "JetBrains Mono, monospace";
        };
    };
};
export declare const SPACING: {
    readonly 0: "0";
    readonly px: "1px";
    readonly 0.5: "0.125rem";
    readonly 1: "0.25rem";
    readonly 1.5: "0.375rem";
    readonly 2: "0.5rem";
    readonly 2.5: "0.625rem";
    readonly 3: "0.75rem";
    readonly 3.5: "0.875rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 7: "1.75rem";
    readonly 8: "2rem";
    readonly 9: "2.25rem";
    readonly 10: "2.5rem";
    readonly 11: "2.75rem";
    readonly 12: "3rem";
    readonly 14: "3.5rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 28: "7rem";
    readonly 32: "8rem";
    readonly 36: "9rem";
    readonly 40: "10rem";
    readonly 44: "11rem";
    readonly 48: "12rem";
    readonly 52: "13rem";
    readonly 56: "14rem";
    readonly 60: "15rem";
    readonly 64: "16rem";
    readonly 72: "18rem";
    readonly 80: "20rem";
    readonly 96: "24rem";
};
export declare const RADIUS: {
    readonly none: "0";
    readonly sm: "0.125rem";
    readonly DEFAULT: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
export declare const SHADOWS: {
    readonly none: "none";
    readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    readonly DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
    readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)";
    readonly hover: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    readonly focus: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    readonly focusRing: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    readonly primary: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    readonly secondary: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    readonly success: "0 10px 40px -10px rgba(34, 197, 94, 0.6)";
    readonly error: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    readonly warning: "0 10px 40px -10px rgba(245, 158, 11, 0.6)";
    readonly info: "0 10px 40px -10px rgba(59, 130, 246, 0.6)";
    readonly premium: "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
    readonly 'premium-lg': "0 30px 60px -12px rgba(0, 0, 0, 0.25)";
    readonly glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
    readonly 'glass-lg': "0 16px 64px 0 rgba(31, 38, 135, 0.2)";
    readonly neon: "0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)";
    readonly 'neon-strong': "0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)";
};
export declare const GRADIENTS: {
    readonly primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    readonly secondary: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    readonly success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    readonly error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    readonly warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    readonly info: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
    readonly premium: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
    readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    readonly royal: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
    readonly mesh: {
        readonly warm: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)";
        readonly cool: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
        readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
        readonly royal: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
    };
    readonly glass: "rgba(255, 255, 255, 0.1)";
    readonly 'glass-dark': "rgba(0, 0, 0, 0.1)";
    readonly 'glass-light': "rgba(255, 255, 255, 0.2)";
    readonly holographic: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)";
    readonly neon: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    readonly rainbow: "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)";
};
export declare const TRANSITIONS: {
    readonly duration: {
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
        readonly slower: "750ms";
        readonly slowest: "1000ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly ease: "ease";
        readonly easeIn: "ease-in";
        readonly easeOut: "ease-out";
        readonly easeInOut: "ease-in-out";
        readonly spring: "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
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
        readonly wobbly: {
            readonly stiffness: 180;
            readonly damping: 12;
        };
    };
    readonly common: {
        readonly all: "all 300ms ease-out";
        readonly colors: "color 300ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out";
        readonly transform: "transform 300ms ease-out";
        readonly opacity: "opacity 300ms ease-out";
        readonly shadow: "box-shadow 300ms ease-out";
    };
};
export declare const ZINDEX: {
    readonly base: 0;
    readonly docked: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly banner: 1200;
    readonly overlay: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly skipLink: 1600;
    readonly toast: 1700;
    readonly tooltip: 1800;
};
export declare const BREAKPOINTS: {
    readonly xs: "375px";
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
    readonly '3xl': "1600px";
    readonly uhd: "1920px";
    readonly '4k': "3840px";
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
            readonly focus: {
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly active: {
                readonly transform: "translateY(0)";
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
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
            readonly focus: {
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly active: {
                readonly transform: "translateY(0)";
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
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
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            };
            readonly focus: {
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly active: {
                readonly transform: "translateY(0)";
                readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
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
                readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
            };
            readonly focus: {
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly active: {
                readonly transform: "translateY(0)";
                readonly background: "#e5e5e5";
            };
        };
        readonly danger: {
            readonly background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            readonly color: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
            readonly hover: {
                readonly transform: "translateY(-2px)";
                readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
            };
            readonly focus: {
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly active: {
                readonly transform: "translateY(0)";
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            };
        };
    };
    readonly card: {
        readonly default: {
            readonly background: "#ffffff";
            readonly border: "1px solid #e5e5e5";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            readonly radius: "0.5rem";
        };
        readonly elevated: {
            readonly background: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            readonly radius: "0.75rem";
        };
        readonly glass: {
            readonly background: "rgba(255, 255, 255, 0.1)";
            readonly border: "1px solid #e5e5e5";
            readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
            readonly radius: "0.75rem";
            readonly backdropFilter: "blur(12px)";
        };
        readonly premium: {
            readonly background: "#ffffff";
            readonly border: "none";
            readonly shadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
            readonly radius: "1rem";
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
            readonly error: {
                readonly border: "2px solid #ef4444";
                readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
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
            readonly error: {
                readonly background: "#fef2f2";
                readonly border: "2px solid #ef4444";
                readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
            };
        };
        readonly outline: {
            readonly background: "transparent";
            readonly border: "2px solid #d4d4d4";
            readonly color: "#171717";
            readonly focus: {
                readonly border: "2px solid #ec4899";
                readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
            };
            readonly error: {
                readonly border: "2px solid #ef4444";
                readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
            };
        };
    };
};
export declare const SIZES: {
    readonly button: {
        readonly xs: {
            readonly padding: "0.375rem 0.75rem";
            readonly fontSize: "0.75rem";
            readonly height: "28px";
            readonly minWidth: "64px";
        };
        readonly sm: {
            readonly padding: "0.5rem 1rem";
            readonly fontSize: "0.875rem";
            readonly height: "36px";
            readonly minWidth: "72px";
        };
        readonly md: {
            readonly padding: "0.75rem 1.5rem";
            readonly fontSize: "1rem";
            readonly height: "44px";
            readonly minWidth: "80px";
        };
        readonly lg: {
            readonly padding: "1rem 2rem";
            readonly fontSize: "1.125rem";
            readonly height: "52px";
            readonly minWidth: "96px";
        };
        readonly xl: {
            readonly padding: "1.25rem 2.5rem";
            readonly fontSize: "1.25rem";
            readonly height: "60px";
            readonly minWidth: "112px";
        };
    };
    readonly input: {
        readonly xs: {
            readonly padding: "0.375rem 0.75rem";
            readonly fontSize: "0.75rem";
            readonly height: "28px";
        };
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
        readonly xl: {
            readonly padding: "1.25rem 1.5rem";
            readonly fontSize: "1.25rem";
            readonly height: "60px";
        };
    };
    readonly avatar: {
        readonly xs: {
            readonly width: "24px";
            readonly height: "24px";
        };
        readonly sm: {
            readonly width: "32px";
            readonly height: "32px";
        };
        readonly md: {
            readonly width: "40px";
            readonly height: "40px";
        };
        readonly lg: {
            readonly width: "48px";
            readonly height: "48px";
        };
        readonly xl: {
            readonly width: "64px";
            readonly height: "64px";
        };
        readonly '2xl': {
            readonly width: "80px";
            readonly height: "80px";
        };
        readonly '3xl': {
            readonly width: "96px";
            readonly height: "96px";
        };
    };
};
export declare const createStyle: (variant: keyof typeof VARIANTS.button, size: keyof typeof SIZES.button) => {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.375rem 0.75rem";
    fontSize: "0.75rem";
    height: "28px";
    minWidth: "64px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    minWidth: "72px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    minWidth: "80px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    minWidth: "96px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1.25rem 2.5rem";
    fontSize: "1.25rem";
    height: "60px";
    minWidth: "112px";
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.375rem 0.75rem";
    fontSize: "0.75rem";
    height: "28px";
    minWidth: "64px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    minWidth: "72px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    minWidth: "80px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    minWidth: "96px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1.25rem 2.5rem";
    fontSize: "1.25rem";
    height: "60px";
    minWidth: "112px";
    background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.375rem 0.75rem";
    fontSize: "0.75rem";
    height: "28px";
    minWidth: "64px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    minWidth: "72px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    minWidth: "80px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    minWidth: "96px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1.25rem 2.5rem";
    fontSize: "1.25rem";
    height: "60px";
    minWidth: "112px";
    background: "transparent";
    color: "#db2777";
    border: "2px solid #db2777";
    shadow: "none";
    hover: {
        readonly background: "#db2777";
        readonly color: "#ffffff";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.375rem 0.75rem";
    fontSize: "0.75rem";
    height: "28px";
    minWidth: "64px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly background: "#e5e5e5";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    minWidth: "72px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly background: "#e5e5e5";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    minWidth: "80px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly background: "#e5e5e5";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    minWidth: "96px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly background: "#e5e5e5";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1.25rem 2.5rem";
    fontSize: "1.25rem";
    height: "60px";
    minWidth: "112px";
    background: "transparent";
    color: "#404040";
    border: "none";
    shadow: "none";
    hover: {
        readonly background: "#f5f5f5";
        readonly transform: "translateY(-1px)";
        readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly background: "#e5e5e5";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.375rem 0.75rem";
    fontSize: "0.75rem";
    height: "28px";
    minWidth: "64px";
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.5rem 1rem";
    fontSize: "0.875rem";
    height: "36px";
    minWidth: "72px";
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "0.75rem 1.5rem";
    fontSize: "1rem";
    height: "44px";
    minWidth: "80px";
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1rem 2rem";
    fontSize: "1.125rem";
    height: "52px";
    minWidth: "96px";
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
} | {
    transition: "all 300ms ease-out";
    borderRadius: "0.5rem";
    fontWeight: "600";
    cursor: string;
    display: string;
    alignItems: string;
    justifyContent: string;
    textDecoration: string;
    outline: string;
    userSelect: string;
    WebkitTapHighlightColor: string;
    padding: "1.25rem 2.5rem";
    fontSize: "1.25rem";
    height: "60px";
    minWidth: "112px";
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    color: "#ffffff";
    border: "none";
    shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
    hover: {
        readonly transform: "translateY(-2px)";
        readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
    };
    focus: {
        readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
    };
    active: {
        readonly transform: "translateY(0)";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
};
export declare const WCAG: {
    readonly contrast: {
        readonly normal: 4.5;
        readonly large: 3;
        readonly enhanced: 7;
    };
    readonly combinations: {
        readonly primaryOnWhite: {
            readonly foreground: "#be185d";
            readonly background: "#ffffff";
        };
        readonly primaryOnLight: {
            readonly foreground: "#9d174d";
            readonly background: "#f5f5f5";
        };
        readonly whiteOnPrimary: {
            readonly foreground: "#ffffff";
            readonly background: "#db2777";
        };
        readonly secondaryOnWhite: {
            readonly foreground: "#7e22ce";
            readonly background: "#ffffff";
        };
        readonly secondaryOnLight: {
            readonly foreground: "#6b21a8";
            readonly background: "#f5f5f5";
        };
        readonly whiteOnSecondary: {
            readonly foreground: "#ffffff";
            readonly background: "#9333ea";
        };
        readonly darkOnLight: {
            readonly foreground: "#262626";
            readonly background: "#f5f5f5";
        };
        readonly lightOnDark: {
            readonly foreground: "#f5f5f5";
            readonly background: "#262626";
        };
        readonly darkOnWhite: {
            readonly foreground: "#171717";
            readonly background: "#ffffff";
        };
        readonly whiteOnDark: {
            readonly foreground: "#ffffff";
            readonly background: "#171717";
        };
        readonly successOnWhite: {
            readonly foreground: "#15803d";
            readonly background: "#ffffff";
        };
        readonly errorOnWhite: {
            readonly foreground: "#b91c1c";
            readonly background: "#ffffff";
        };
        readonly warningOnWhite: {
            readonly foreground: "#b45309";
            readonly background: "#ffffff";
        };
        readonly infoOnWhite: {
            readonly foreground: "#1d4ed8";
            readonly background: "#ffffff";
        };
    };
    readonly focus: {
        readonly ring: "0 0 0 3px #ec489940";
        readonly outline: "2px solid #ec4899";
        readonly offset: "2px";
    };
    readonly touchTarget: {
        readonly min: "44px";
        readonly recommended: "48px";
        readonly large: "56px";
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
            readonly 950: "#500724";
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
            readonly 950: "#3b0764";
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
            readonly 200: "#bbf7d0";
            readonly 300: "#86efac";
            readonly 400: "#4ade80";
            readonly 500: "#22c55e";
            readonly 600: "#16a34a";
            readonly 700: "#15803d";
            readonly 800: "#166534";
            readonly 900: "#14532d";
        };
        readonly error: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 200: "#fecaca";
            readonly 300: "#fca5a5";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
            readonly 800: "#991b1b";
            readonly 900: "#7f1d1d";
        };
        readonly warning: {
            readonly 50: "#fffbeb";
            readonly 100: "#fef3c7";
            readonly 200: "#fde68a";
            readonly 300: "#fcd34d";
            readonly 400: "#fbbf24";
            readonly 500: "#f59e0b";
            readonly 600: "#d97706";
            readonly 700: "#b45309";
            readonly 800: "#92400e";
            readonly 900: "#78350f";
        };
        readonly info: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 200: "#bfdbfe";
            readonly 300: "#93c5fd";
            readonly 400: "#60a5fa";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
            readonly 700: "#1d4ed8";
            readonly 800: "#1e40af";
            readonly 900: "#1e3a8a";
        };
    };
    readonly darkColors: {
        readonly primary: {
            readonly 50: "#500724";
            readonly 100: "#831843";
            readonly 200: "#9d174d";
            readonly 300: "#be185d";
            readonly 400: "#db2777";
            readonly 500: "#ec4899";
            readonly 600: "#f472b6";
            readonly 700: "#f9a8d4";
            readonly 800: "#fbcfe8";
            readonly 900: "#fce7f3";
            readonly 950: "#fdf2f8";
        };
        readonly secondary: {
            readonly 50: "#3b0764";
            readonly 100: "#581c87";
            readonly 200: "#6b21a8";
            readonly 300: "#7e22ce";
            readonly 400: "#9333ea";
            readonly 500: "#a855f7";
            readonly 600: "#c084fc";
            readonly 700: "#d8b4fe";
            readonly 800: "#e9d5ff";
            readonly 900: "#f3e8ff";
            readonly 950: "#faf5ff";
        };
        readonly neutral: {
            readonly 0: "#0a0a0a";
            readonly 50: "#171717";
            readonly 100: "#262626";
            readonly 200: "#404040";
            readonly 300: "#525252";
            readonly 400: "#737373";
            readonly 500: "#a3a3a3";
            readonly 600: "#d4d4d4";
            readonly 700: "#e5e5e5";
            readonly 800: "#f5f5f5";
            readonly 900: "#fafafa";
            readonly 950: "#ffffff";
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly sans: readonly ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"];
            readonly mono: readonly ["JetBrains Mono", "Fira Code", "Monaco", "Consolas", "monospace"];
            readonly display: readonly ["SF Pro Display", "Inter", "system-ui", "sans-serif"];
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
            readonly '7xl': "4.5rem";
            readonly '8xl': "6rem";
            readonly '9xl': "8rem";
        };
        readonly fontWeight: {
            readonly thin: "100";
            readonly extralight: "200";
            readonly light: "300";
            readonly normal: "400";
            readonly medium: "500";
            readonly semibold: "600";
            readonly bold: "700";
            readonly extrabold: "800";
            readonly black: "900";
        };
        readonly lineHeight: {
            readonly none: "1";
            readonly tight: "1.25";
            readonly snug: "1.375";
            readonly normal: "1.5";
            readonly relaxed: "1.625";
            readonly loose: "2";
        };
        readonly letterSpacing: {
            readonly tighter: "-0.05em";
            readonly tight: "-0.025em";
            readonly normal: "0em";
            readonly wide: "0.025em";
            readonly wider: "0.05em";
            readonly widest: "0.1em";
        };
        readonly textStyles: {
            readonly h1: {
                readonly fontSize: "2.25rem";
                readonly fontWeight: "700";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly h2: {
                readonly fontSize: "1.875rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly h3: {
                readonly fontSize: "1.5rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly h4: {
                readonly fontSize: "1.25rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly h5: {
                readonly fontSize: "1.125rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly h6: {
                readonly fontSize: "1rem";
                readonly fontWeight: "600";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "-0.025em";
            };
            readonly body: {
                readonly fontSize: "1rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
                readonly letterSpacing: "0em";
            };
            readonly bodyLarge: {
                readonly fontSize: "1.125rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
                readonly letterSpacing: "0em";
            };
            readonly bodySmall: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
                readonly letterSpacing: "0em";
            };
            readonly caption: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "0.025em";
            };
            readonly small: {
                readonly fontSize: "0.75rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "0.025em";
            };
            readonly label: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "500";
                readonly lineHeight: "1.25";
                readonly letterSpacing: "0.025em";
            };
            readonly code: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
                readonly letterSpacing: "0em";
                readonly fontFamily: "JetBrains Mono, monospace";
            };
            readonly pre: {
                readonly fontSize: "0.875rem";
                readonly fontWeight: "400";
                readonly lineHeight: "1.5";
                readonly letterSpacing: "0em";
                readonly fontFamily: "JetBrains Mono, monospace";
            };
        };
    };
    readonly spacing: {
        readonly 0: "0";
        readonly px: "1px";
        readonly 0.5: "0.125rem";
        readonly 1: "0.25rem";
        readonly 1.5: "0.375rem";
        readonly 2: "0.5rem";
        readonly 2.5: "0.625rem";
        readonly 3: "0.75rem";
        readonly 3.5: "0.875rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 9: "2.25rem";
        readonly 10: "2.5rem";
        readonly 11: "2.75rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 28: "7rem";
        readonly 32: "8rem";
        readonly 36: "9rem";
        readonly 40: "10rem";
        readonly 44: "11rem";
        readonly 48: "12rem";
        readonly 52: "13rem";
        readonly 56: "14rem";
        readonly 60: "15rem";
        readonly 64: "16rem";
        readonly 72: "18rem";
        readonly 80: "20rem";
        readonly 96: "24rem";
    };
    readonly radius: {
        readonly none: "0";
        readonly sm: "0.125rem";
        readonly DEFAULT: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly none: "none";
        readonly sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        readonly DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
        readonly md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        readonly lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        readonly xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
        readonly '2xl': "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
        readonly inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)";
        readonly hover: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        readonly focus: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        readonly focusRing: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        readonly primary: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        readonly secondary: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        readonly success: "0 10px 40px -10px rgba(34, 197, 94, 0.6)";
        readonly error: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        readonly warning: "0 10px 40px -10px rgba(245, 158, 11, 0.6)";
        readonly info: "0 10px 40px -10px rgba(59, 130, 246, 0.6)";
        readonly premium: "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
        readonly 'premium-lg': "0 30px 60px -12px rgba(0, 0, 0, 0.25)";
        readonly glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
        readonly 'glass-lg': "0 16px 64px 0 rgba(31, 38, 135, 0.2)";
        readonly neon: "0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)";
        readonly 'neon-strong': "0 0 30px rgba(236, 72, 153, 0.7), 0 0 60px rgba(236, 72, 153, 0.5)";
    };
    readonly gradients: {
        readonly primary: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        readonly secondary: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        readonly success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
        readonly error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        readonly warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
        readonly info: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
        readonly premium: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
        readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
        readonly royal: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
        readonly mesh: {
            readonly warm: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #a8385d 75%, #7f2c53 100%)";
            readonly cool: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
            readonly sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
            readonly ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
            readonly royal: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
        };
        readonly glass: "rgba(255, 255, 255, 0.1)";
        readonly 'glass-dark': "rgba(0, 0, 0, 0.1)";
        readonly 'glass-light': "rgba(255, 255, 255, 0.2)";
        readonly holographic: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7)";
        readonly neon: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
        readonly rainbow: "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)";
    };
    readonly transitions: {
        readonly duration: {
            readonly fast: "150ms";
            readonly normal: "300ms";
            readonly slow: "500ms";
            readonly slower: "750ms";
            readonly slowest: "1000ms";
        };
        readonly easing: {
            readonly linear: "linear";
            readonly ease: "ease";
            readonly easeIn: "ease-in";
            readonly easeOut: "ease-out";
            readonly easeInOut: "ease-in-out";
            readonly spring: "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
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
            readonly wobbly: {
                readonly stiffness: 180;
                readonly damping: 12;
            };
        };
        readonly common: {
            readonly all: "all 300ms ease-out";
            readonly colors: "color 300ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out";
            readonly transform: "transform 300ms ease-out";
            readonly opacity: "opacity 300ms ease-out";
            readonly shadow: "box-shadow 300ms ease-out";
        };
    };
    readonly zIndex: {
        readonly base: 0;
        readonly docked: 10;
        readonly dropdown: 1000;
        readonly sticky: 1100;
        readonly banner: 1200;
        readonly overlay: 1300;
        readonly modal: 1400;
        readonly popover: 1500;
        readonly skipLink: 1600;
        readonly toast: 1700;
        readonly tooltip: 1800;
    };
    readonly breakpoints: {
        readonly xs: "375px";
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1280px";
        readonly '2xl': "1536px";
        readonly '3xl': "1600px";
        readonly uhd: "1920px";
        readonly '4k': "3840px";
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
                readonly focus: {
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
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
                readonly focus: {
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
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
                    readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                };
                readonly focus: {
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
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
                    readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                };
                readonly focus: {
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly background: "#e5e5e5";
                };
            };
            readonly danger: {
                readonly background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                readonly color: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
                readonly hover: {
                    readonly transform: "translateY(-2px)";
                    readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
                };
                readonly focus: {
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly active: {
                    readonly transform: "translateY(0)";
                    readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                };
            };
        };
        readonly card: {
            readonly default: {
                readonly background: "#ffffff";
                readonly border: "1px solid #e5e5e5";
                readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                readonly radius: "0.5rem";
            };
            readonly elevated: {
                readonly background: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                readonly radius: "0.75rem";
            };
            readonly glass: {
                readonly background: "rgba(255, 255, 255, 0.1)";
                readonly border: "1px solid #e5e5e5";
                readonly shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)";
                readonly radius: "0.75rem";
                readonly backdropFilter: "blur(12px)";
            };
            readonly premium: {
                readonly background: "#ffffff";
                readonly border: "none";
                readonly shadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
                readonly radius: "1rem";
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
                readonly error: {
                    readonly border: "2px solid #ef4444";
                    readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
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
                readonly error: {
                    readonly background: "#fef2f2";
                    readonly border: "2px solid #ef4444";
                    readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
                };
            };
            readonly outline: {
                readonly background: "transparent";
                readonly border: "2px solid #d4d4d4";
                readonly color: "#171717";
                readonly focus: {
                    readonly border: "2px solid #ec4899";
                    readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
                };
                readonly error: {
                    readonly border: "2px solid #ef4444";
                    readonly shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
                };
            };
        };
    };
    readonly sizes: {
        readonly button: {
            readonly xs: {
                readonly padding: "0.375rem 0.75rem";
                readonly fontSize: "0.75rem";
                readonly height: "28px";
                readonly minWidth: "64px";
            };
            readonly sm: {
                readonly padding: "0.5rem 1rem";
                readonly fontSize: "0.875rem";
                readonly height: "36px";
                readonly minWidth: "72px";
            };
            readonly md: {
                readonly padding: "0.75rem 1.5rem";
                readonly fontSize: "1rem";
                readonly height: "44px";
                readonly minWidth: "80px";
            };
            readonly lg: {
                readonly padding: "1rem 2rem";
                readonly fontSize: "1.125rem";
                readonly height: "52px";
                readonly minWidth: "96px";
            };
            readonly xl: {
                readonly padding: "1.25rem 2.5rem";
                readonly fontSize: "1.25rem";
                readonly height: "60px";
                readonly minWidth: "112px";
            };
        };
        readonly input: {
            readonly xs: {
                readonly padding: "0.375rem 0.75rem";
                readonly fontSize: "0.75rem";
                readonly height: "28px";
            };
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
            readonly xl: {
                readonly padding: "1.25rem 1.5rem";
                readonly fontSize: "1.25rem";
                readonly height: "60px";
            };
        };
        readonly avatar: {
            readonly xs: {
                readonly width: "24px";
                readonly height: "24px";
            };
            readonly sm: {
                readonly width: "32px";
                readonly height: "32px";
            };
            readonly md: {
                readonly width: "40px";
                readonly height: "40px";
            };
            readonly lg: {
                readonly width: "48px";
                readonly height: "48px";
            };
            readonly xl: {
                readonly width: "64px";
                readonly height: "64px";
            };
            readonly '2xl': {
                readonly width: "80px";
                readonly height: "80px";
            };
            readonly '3xl': {
                readonly width: "96px";
                readonly height: "96px";
            };
        };
    };
    readonly wcag: {
        readonly contrast: {
            readonly normal: 4.5;
            readonly large: 3;
            readonly enhanced: 7;
        };
        readonly combinations: {
            readonly primaryOnWhite: {
                readonly foreground: "#be185d";
                readonly background: "#ffffff";
            };
            readonly primaryOnLight: {
                readonly foreground: "#9d174d";
                readonly background: "#f5f5f5";
            };
            readonly whiteOnPrimary: {
                readonly foreground: "#ffffff";
                readonly background: "#db2777";
            };
            readonly secondaryOnWhite: {
                readonly foreground: "#7e22ce";
                readonly background: "#ffffff";
            };
            readonly secondaryOnLight: {
                readonly foreground: "#6b21a8";
                readonly background: "#f5f5f5";
            };
            readonly whiteOnSecondary: {
                readonly foreground: "#ffffff";
                readonly background: "#9333ea";
            };
            readonly darkOnLight: {
                readonly foreground: "#262626";
                readonly background: "#f5f5f5";
            };
            readonly lightOnDark: {
                readonly foreground: "#f5f5f5";
                readonly background: "#262626";
            };
            readonly darkOnWhite: {
                readonly foreground: "#171717";
                readonly background: "#ffffff";
            };
            readonly whiteOnDark: {
                readonly foreground: "#ffffff";
                readonly background: "#171717";
            };
            readonly successOnWhite: {
                readonly foreground: "#15803d";
                readonly background: "#ffffff";
            };
            readonly errorOnWhite: {
                readonly foreground: "#b91c1c";
                readonly background: "#ffffff";
            };
            readonly warningOnWhite: {
                readonly foreground: "#b45309";
                readonly background: "#ffffff";
            };
            readonly infoOnWhite: {
                readonly foreground: "#1d4ed8";
                readonly background: "#ffffff";
            };
        };
        readonly focus: {
            readonly ring: "0 0 0 3px #ec489940";
            readonly outline: "2px solid #ec4899";
            readonly offset: "2px";
        };
        readonly touchTarget: {
            readonly min: "44px";
            readonly recommended: "48px";
            readonly large: "56px";
        };
    };
    readonly createStyle: (variant: keyof typeof VARIANTS.button, size: keyof typeof SIZES.button) => {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.375rem 0.75rem";
        fontSize: "0.75rem";
        height: "28px";
        minWidth: "64px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        minWidth: "72px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        minWidth: "80px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        minWidth: "96px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1.25rem 2.5rem";
        fontSize: "1.25rem";
        height: "60px";
        minWidth: "112px";
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(236, 72, 153, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.375rem 0.75rem";
        fontSize: "0.75rem";
        height: "28px";
        minWidth: "64px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        minWidth: "72px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        minWidth: "80px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        minWidth: "96px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1.25rem 2.5rem";
        fontSize: "1.25rem";
        height: "60px";
        minWidth: "112px";
        background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(168, 85, 247, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.375rem 0.75rem";
        fontSize: "0.75rem";
        height: "28px";
        minWidth: "64px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        minWidth: "72px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        minWidth: "80px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        minWidth: "96px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1.25rem 2.5rem";
        fontSize: "1.25rem";
        height: "60px";
        minWidth: "112px";
        background: "transparent";
        color: "#db2777";
        border: "2px solid #db2777";
        shadow: "none";
        hover: {
            readonly background: "#db2777";
            readonly color: "#ffffff";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.375rem 0.75rem";
        fontSize: "0.75rem";
        height: "28px";
        minWidth: "64px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly background: "#e5e5e5";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        minWidth: "72px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly background: "#e5e5e5";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        minWidth: "80px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly background: "#e5e5e5";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        minWidth: "96px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly background: "#e5e5e5";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1.25rem 2.5rem";
        fontSize: "1.25rem";
        height: "60px";
        minWidth: "112px";
        background: "transparent";
        color: "#404040";
        border: "none";
        shadow: "none";
        hover: {
            readonly background: "#f5f5f5";
            readonly transform: "translateY(-1px)";
            readonly shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly background: "#e5e5e5";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.375rem 0.75rem";
        fontSize: "0.75rem";
        height: "28px";
        minWidth: "64px";
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.5rem 1rem";
        fontSize: "0.875rem";
        height: "36px";
        minWidth: "72px";
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "0.75rem 1.5rem";
        fontSize: "1rem";
        height: "44px";
        minWidth: "80px";
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1rem 2rem";
        fontSize: "1.125rem";
        height: "52px";
        minWidth: "96px";
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    } | {
        transition: "all 300ms ease-out";
        borderRadius: "0.5rem";
        fontWeight: "600";
        cursor: string;
        display: string;
        alignItems: string;
        justifyContent: string;
        textDecoration: string;
        outline: string;
        userSelect: string;
        WebkitTapHighlightColor: string;
        padding: "1.25rem 2.5rem";
        fontSize: "1.25rem";
        height: "60px";
        minWidth: "112px";
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        color: "#ffffff";
        border: "none";
        shadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)";
        hover: {
            readonly transform: "translateY(-2px)";
            readonly shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)";
        };
        focus: {
            readonly shadow: "0 0 0 3px rgba(236, 72, 153, 0.1)";
        };
        active: {
            readonly transform: "translateY(0)";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
    };
};
export default THEME;
//# sourceMappingURL=index.d.ts.map