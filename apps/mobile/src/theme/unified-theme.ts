/**
 * Unified Theme System for PawfectMatch Mobile
 * Consistent design tokens across the entire application
 */

export const Theme = {
  colors: {
    // Primary brand colors
    primary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
    },

    // Secondary colors
    secondary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Neutral colors
    neutral: {
      0: "#ffffff",
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },

    // Status colors
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },

    // Semantic colors
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      tertiary: "#9ca3af",
      inverse: "#ffffff",
    },

    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
      inverse: "#111827",
    },

    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
    },

    // Shadow color for backward compatibility
    shadowColor: "#000000",
    
    // Flat aliases for common usage (backward compatibility)
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },

  // Typography system
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
    },

    fontWeight: {
      light: "300" as const,
      normal: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
      black: "900" as const,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },

    letterSpacing: {
      tight: -0.025,
      normal: 0,
      wide: 0.025,
    },
  },

  // Spacing system (8px base unit)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
    "4xl": 96,
  },

  // Border radius system
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },

  // Shadow system
  shadows: {
    depth: {
      sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
      },
      xl: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 8,
      },
    },
  },

  // Motion system
  motion: {
    springs: {
      standard: {
        damping: 20,
        stiffness: 400,
        mass: 0.8,
      },
      gentle: {
        damping: 25,
        stiffness: 300,
        mass: 1,
      },
      snappy: {
        damping: 15,
        stiffness: 500,
        mass: 0.6,
      },
      bouncy: {
        damping: 10,
        stiffness: 600,
        mass: 0.5,
      },
    },

    timings: {
      fast: 150,
      standard: 300,
      slow: 500,
    },

    easings: {
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Semantic colors for interactive elements
  semantic: {
    interactive: {
      primary: "#db2777",
      secondary: "#0284c7",
      tertiary: "#9ca3af",
    },
    feedback: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
  },

  // Gradient definitions
  gradients: {
    primary: ["#ec4899", "#db2777"],
    secondary: ["#0ea5e9", "#0284c7"],
    success: ["#10b981", "#059669"],
    warning: ["#f59e0b", "#d97706"],
    error: ["#ef4444", "#dc2626"],
    glass: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    glow: ["rgba(236, 72, 153, 0.3)", "rgba(236, 72, 153, 0.1)"],
  },

  // Glass morphism effects
  glass: {
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
    },
    dark: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
    },
  },

  // Glow effects
  glow: {
    sm: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 5,
    },
    lg: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Shadow effects (alias for shadows.depth)
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },

  // Z-index system
  zIndex: {
    hide: -1,
    auto: "auto",
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
  },
};

// Dark theme variant
export const DarkTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,
    text: {
      primary: "#ffffff",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
      inverse: "#111827",
    },
    background: {
      primary: "#111827",
      secondary: "#1f2937",
      tertiary: "#374151",
      inverse: "#ffffff",
    },
    border: {
      light: "#374151",
      medium: "#4b5563",
      dark: "#6b7280",
    },
  },
};

// Export theme types
export type ThemeType = typeof Theme;
export type ColorPalette = keyof typeof Theme.colors;
export type SpacingSize = keyof typeof Theme.spacing;
export type BorderRadiusSize = keyof typeof Theme.borderRadius;
export type FontSize = keyof typeof Theme.typography.fontSize;
export type FontWeight = keyof typeof Theme.typography.fontWeight;

export default Theme;
