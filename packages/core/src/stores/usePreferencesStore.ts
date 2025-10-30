import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ZustandSetter } from '../types/advanced';

export interface UserPreferences {
  // Discovery preferences
  discovery: {
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
    species: string[];
    intents: ('adoption' | 'mating' | 'playdate' | 'all')[];
    breeds: string[];
    size: ('tiny' | 'small' | 'medium' | 'large' | 'giant')[];
    gender: ('male' | 'female' | 'unknown')[];
  };

  // Notification settings
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
    marketing: boolean;
  };

  // Appearance settings
  appearance: {
    theme: 'light' | 'dark' | 'system';
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };

  // Privacy settings
  privacy: {
    showLocation: boolean;
    showOnlineStatus: boolean;
    showLastActive: boolean;
    allowLocationTracking: boolean;
  };
}

export interface PreferencesState extends UserPreferences {
  // Actions
  updateDiscoveryPreferences: (preferences: Partial<UserPreferences['discovery']>) => void;
  updateNotificationSettings: (settings: Partial<UserPreferences['notifications']>) => void;
  updateAppearanceSettings: (settings: Partial<UserPreferences['appearance']>) => void;
  updatePrivacySettings: (settings: Partial<UserPreferences['privacy']>) => void;
  resetPreferences: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  discovery: {
    maxDistance: 25, // in miles/km
    ageRange: {
      min: 0,
      max: 20,
    },
    species: ['dog', 'cat'],
    intents: ['playdate', 'adoption', 'mating', 'all'],
    breeds: [],
    size: ['tiny', 'small', 'medium', 'large', 'giant'],
    gender: ['male', 'female', 'unknown'],
  },
  notifications: {
    email: true,
    push: true,
    matches: true,
    messages: true,
    marketing: false,
  },
  appearance: {
    theme: 'system',
    reducedMotion: false,
    fontSize: 'medium',
    highContrast: false,
  },
  privacy: {
    showLocation: true,
    showOnlineStatus: true,
    showLastActive: true,
    allowLocationTracking: true,
  },
};

/**
 * Global preferences store for user settings
 * Persists to local storage
 */
export const _usePreferencesStore = create<PreferencesState>()(
  persist(
    immer((set: ZustandSetter<PreferencesState>) => ({
      ...defaultPreferences,

      // Update discovery preferences
      updateDiscoveryPreferences: (preferences) => {
        set((state: PreferencesState) => {
          state.discovery = {
            ...state.discovery,
            ...preferences,
          };
          return state;
        });
      },

      // Update notification settings
      updateNotificationSettings: (settings) => {
        set((state: PreferencesState) => {
          state.notifications = {
            ...state.notifications,
            ...settings,
          };
          return state;
        });
      },

      // Update appearance settings
      updateAppearanceSettings: (settings) => {
        set((state: PreferencesState) => {
          state.appearance = {
            ...state.appearance,
            ...settings,
          };
          return state;
        });
      },

      // Update privacy settings
      updatePrivacySettings: (settings) => {
        set((state: PreferencesState) => {
          state.privacy = {
            ...state.privacy,
            ...settings,
          };
          return state;
        });
      },

      // Reset all preferences to defaults
      resetPreferences: () => {
        set(() => ({
          ...defaultPreferences,
        }));
      },
    })),
    {
      name: 'pawfectmatch-preferences',
    },
  ),
);
