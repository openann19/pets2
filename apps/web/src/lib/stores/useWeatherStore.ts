import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
/**
 * Weather store for managing ambient weather effects
 */
export const useWeatherStore = create()(immer((set, get) => ({
    data: null,
    isLoading: false,
    error: null,
    location: {
        latitude: null,
        longitude: null,
    },
    // Set weather data
    setWeatherData: (data) => { set((state) => {
        state.data = {
            ...data,
            lastUpdated: new Date().toISOString(),
        };
        state.error = null;
        return state;
    }); },
    // Set loading state
    setIsLoading: (isLoading) => { set((state) => {
        state.isLoading = isLoading;
        return state;
    }); },
    // Set error
    setError: (error) => { set((state) => {
        state.error = error;
        return state;
    }); },
    // Set user location
    setLocation: (latitude, longitude) => { set((state) => {
        state.location = { latitude, longitude };
        return state;
    }); },
    // Calculate and update time of day based on current time and sunrise/sunset
    calculateTimeOfDay: () => { set((state) => {
        const data = get().data;
        if (!data || !data.sys)
            return state;
        const now = new Date().getTime() / 1000; // Current time in seconds
        const sunrise = data.sys.sunrise || 0;
        const sunset = data.sys.sunset || 0;
        // Dawn: 30 minutes before sunrise to sunrise
        const dawnStart = sunrise - 30 * 60;
        // Dusk: sunset to 30 minutes after sunset
        const duskEnd = sunset + 30 * 60;
        if (now >= dawnStart && now < sunrise) {
            state.data.timeOfDay = 'dawn';
        }
        else if (now >= sunrise && now < sunset) {
            state.data.timeOfDay = 'day';
        }
        else if (now >= sunset && now < duskEnd) {
            state.data.timeOfDay = 'dusk';
        }
        else {
            state.data.timeOfDay = 'night';
        }
        // Calculate season based on month in northern hemisphere
        const month = new Date().getMonth(); // 0-11
        if (month >= 2 && month <= 4) {
            state.data.season = 'spring';
        }
        else if (month >= 5 && month <= 7) {
            state.data.season = 'summer';
        }
        else if (month >= 8 && month <= 10) {
            state.data.season = 'fall';
        }
        else {
            state.data.season = 'winter';
        }
        return state;
    }); },
})));
//# sourceMappingURL=useWeatherStore.js.map