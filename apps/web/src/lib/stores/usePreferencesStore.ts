import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// Default preferences
const defaultPreferences = {
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
export const usePreferencesStore = create()(persist(immer((set) => ({
    ...defaultPreferences,
    // Update discovery preferences
    updateDiscoveryPreferences: (preferences) => { set((state) => {
        state.discovery = {
            ...state.discovery,
            ...preferences,
        };
        return state;
    }); },
    // Update notification settings
    updateNotificationSettings: (settings) => { set((state) => {
        state.notifications = {
            ...state.notifications,
            ...settings,
        };
        return state;
    }); },
    // Update appearance settings
    updateAppearanceSettings: (settings) => { set((state) => {
        state.appearance = {
            ...state.appearance,
            ...settings,
        };
        return state;
    }); },
    // Update privacy settings
    updatePrivacySettings: (settings) => { set((state) => {
        state.privacy = {
            ...state.privacy,
            ...settings,
        };
        return state;
    }); },
    // Reset all preferences to defaults
    resetPreferences: () => { set(() => ({
        ...defaultPreferences,
    })); },
})), {
    name: 'pawfectmatch-preferences',
}));
//# sourceMappingURL=usePreferencesStore.js.map