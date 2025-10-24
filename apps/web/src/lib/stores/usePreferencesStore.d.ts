export interface UserPreferences {
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
    notifications: {
        email: boolean;
        push: boolean;
        matches: boolean;
        messages: boolean;
        marketing: boolean;
    };
    appearance: {
        theme: 'light' | 'dark' | 'system';
        reducedMotion: boolean;
        fontSize: 'small' | 'medium' | 'large';
        highContrast: boolean;
    };
    privacy: {
        showLocation: boolean;
        showOnlineStatus: boolean;
        showLastActive: boolean;
        allowLocationTracking: boolean;
    };
}
export interface PreferencesState extends UserPreferences {
    updateDiscoveryPreferences: (preferences: Partial<UserPreferences['discovery']>) => void;
    updateNotificationSettings: (settings: Partial<UserPreferences['notifications']>) => void;
    updateAppearanceSettings: (settings: Partial<UserPreferences['appearance']>) => void;
    updatePrivacySettings: (settings: Partial<UserPreferences['privacy']>) => void;
    resetPreferences: () => void;
}
/**
 * Global preferences store for user settings
 * Persists to local storage
 */
export declare const usePreferencesStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<PreferencesState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<PreferencesState, PreferencesState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: PreferencesState) => void) => () => void;
        onFinishHydration: (fn: (state: PreferencesState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<PreferencesState, PreferencesState>>;
    };
}, "setState"> & {
    setState(nextStateOrUpdater: PreferencesState | Partial<PreferencesState> | ((state: import("immer").WritableDraft<PreferencesState>) => void), shouldReplace?: boolean | undefined): void;
}>;
//# sourceMappingURL=usePreferencesStore.d.ts.map