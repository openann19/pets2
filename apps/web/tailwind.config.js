/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/services/**/*.{js,ts,jsx,tsx}",
    "./src/utils/**/*.{js,ts,jsx,tsx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx}",
    "./src/providers/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  // Enable purge for production builds
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    options: {
      safelist: [
        // Keep dynamic classes that might be generated
        /^bg-gradient-/,
        /^from-/,
        /^to-/,
        /^shadow-/,
        /^text-/,
        /^border-/,
        /^ring-/,
        /^animate-/,
        /^hover:/,
        /^focus:/,
        /^active:/,
        /^group-hover:/,
        /^group-focus:/,
        /^dark:/,
        // Keep glass morphism classes
        'glass-morphism',
        'glass-morphism-dark',
        // Keep premium utility classes
        'premium-gradient',
        'mesh-gradient',
        'smooth-gradient',
        'shadow-sleek',
        'border-sleek',
        // Keep UHD optimization classes
        'uhd-high-dpi',
        'uhd-gpu-accelerated',
        'uhd-crisp-text',
        'uhd-smooth-animation',
      ],
    },
  },
  theme: {
    extend: {
      // Theme-aware colors using CSS variables (injected by ThemeProvider)
      colors: {
        // Semantic colors from theme (CSS variables take precedence)
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        overlay: 'var(--color-overlay)',
        border: 'var(--color-border)',
        'on-bg': 'var(--color-on-bg)',
        'on-surface': 'var(--color-on-surface)',
        'on-muted': 'var(--color-on-muted)',
        'on-primary': 'var(--color-on-primary)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        // Enhanced color system from unified design system
        // Note: primary uses var(--color-primary) but scale available for gradients
        primary: {
          DEFAULT: 'var(--color-primary)', // Use theme primary as default
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
          950: '#500724',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21b6',
          900: '#581c87',
          950: '#3b0764',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },

      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Premium animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'holographic': 'holographic 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },

      // Premium keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' },
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Enhanced shadows (theme-aware via CSS variables)
      boxShadow: {
        'elevation1': 'var(--shadow-elevation1)',
        'elevation2': 'var(--shadow-elevation2)',
        'glass': 'var(--shadow-glass)',
        'premium': '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
        'premium-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow-primary': '0 20px 40px -12px rgba(236, 72, 153, 0.4)',
        'glow-secondary': '0 20px 40px -12px rgba(14, 165, 233, 0.4)',
        'glow-purple': '0 20px 40px -12px rgba(168, 85, 247, 0.4)',
        'neon': '0 0 20px currentColor',
      },

      // Backdrop filters (theme-aware via CSS variables)
      backdropBlur: {
        'sm': 'var(--blur-sm)',
        'md': 'var(--blur-md)',
        'lg': 'var(--blur-lg)',
        'premium': '16px',
        'premium-lg': '24px',
        'premium-xl': '40px',
      },

      // Enhanced spacing (theme-aware via CSS variables)
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        // Additional utility spacing
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Premium border radius (theme-aware via CSS variables)
      borderRadius: {
        'none': 'var(--radius-none)',
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'pill': 'var(--radius-pill)',
        'full': 'var(--radius-full)',
        // Additional utility radius
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // UHD/4K Responsive breakpoints
      screens: {
        'xs': '375px',
        '3xl': '1600px',
        'uhd': '1920px',      // UHD (1920x1080)
        '4k': '3840px',       // 4K UHD (3840x2160)
        '8k': '7680px',       // 8K UHD (7680x4320)
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // Custom utilities for premium effects
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.glass-morphism-dark': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.premium-gradient': {
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        },
        '.mesh-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographic 4s ease infinite',
        },
        // Subtle pastel gradient for a sleeker colourful theme
        '.smooth-gradient': {
          background: 'linear-gradient(135deg, hsl(215,100%,97%) 0%, hsl(203,100%,95%) 35%, hsl(192,100%,93%) 65%, hsl(180,100%,91%) 100%)',
          backgroundSize: '300% 300%',
          animation: 'holographic 20s ease-in-out infinite',
        },
        '.shadow-sleek': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        '.border-sleek': {
          border: '1px solid rgba(255, 255, 255, 0.25)',
        },
        // UHD/4K Optimizations
        '.uhd-high-dpi': {
          imageRendering: '-webkit-optimize-contrast',
          imageRendering: 'crisp-edges',
        },
        '.uhd-gpu-accelerated': {
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        },
        '.uhd-crisp-text': {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '.uhd-smooth-animation': {
          transform: 'translateZ(0)',
          willChange: 'transform',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
