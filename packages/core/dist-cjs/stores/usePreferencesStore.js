"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._usePreferencesStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const immer_1 = require("zustand/middleware/immer");
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
exports._usePreferencesStore = (0, zustand_1.create)()((0, middleware_1.persist)((0, immer_1.immer)((set) => ({
    ...defaultPreferences,
    // Update discovery preferences
    updateDiscoveryPreferences: (preferences) => {
        set((state) => {
            state.discovery = {
                ...state.discovery,
                ...preferences,
            };
            return state;
        });
    },
    // Update notification settings
    updateNotificationSettings: (settings) => {
        set((state) => {
            state.notifications = {
                ...state.notifications,
                ...settings,
            };
            return state;
        });
    },
    // Update appearance settings
    updateAppearanceSettings: (settings) => {
        set((state) => {
            state.appearance = {
                ...state.appearance,
                ...settings,
            };
            return state;
        });
    },
    // Update privacy settings
    updatePrivacySettings: (settings) => {
        set((state) => {
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
})), {
    name: 'pawfectmatch-preferences',
}));
