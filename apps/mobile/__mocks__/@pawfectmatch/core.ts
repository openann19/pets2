/**
 * @pawfectmatch/core Mock
 */

export const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const useAuthStore = jest.fn(() => ({
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
}));

export interface UIConfig {
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
      error: string;
      success: string;
      warning: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
  motion: {
    reducedMotion: boolean;
    lowEndDevicePolicy: 'allow' | 'simplify' | 'skip';
    microInteractions: boolean;
  };
}

export function getDefaultUIConfig(): UIConfig {
  return {
    tokens: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C6C6C8',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
      },
      typography: {
        fontFamily: 'System',
        fontSize: {
          xs: 12,
          sm: 14,
          md: 16,
          lg: 18,
          xl: 20,
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
    motion: {
      reducedMotion: false,
      lowEndDevicePolicy: 'allow',
      microInteractions: true,
    },
  };
}