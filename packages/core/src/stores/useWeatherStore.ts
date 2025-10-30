import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ZustandSetter, ZustandGetter } from '../types/advanced';

export interface WeatherData {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon?: string;
  }>;
  main: {
    temp: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
    humidity?: number;
  };
  name?: string; // City name
  sys?: {
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  lastUpdated: string; // ISO timestamp
}

export interface WeatherState {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
  };

  // Actions
  setWeatherData: (data: WeatherData) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLocation: (latitude: number, longitude: number) => void;
  calculateTimeOfDay: () => void;
}

/**
 * Weather store for managing ambient weather effects
 */
export const _useWeatherStore = create<WeatherState>()(
  immer((set: ZustandSetter<WeatherState>, get: ZustandGetter<WeatherState>) => ({
    data: null as WeatherData | null,
    isLoading: false as boolean,
    error: null as string | null,
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
    },

    // Set weather data
    setWeatherData: (data) => {
      set((state: WeatherState) => {
        state.data = {
          ...data,
          lastUpdated: new Date().toISOString(),
        };
        state.error = null;
        return state;
      });
    },

    // Set loading state
    setIsLoading: (isLoading: boolean) => {
      set((state: WeatherState) => {
        state.isLoading = isLoading;
        return state;
      });
    },

    // Set error
    setError: (error: string | null) => {
      set((state: WeatherState) => {
        state.error = error;
        return state;
      });
    },

    // Set user location
    setLocation: (latitude: number, longitude: number) => {
      set((state: WeatherState) => {
        state.location = { latitude, longitude };
        return state;
      });
    },

    // Calculate and update time of day based on current time and sunrise/sunset
    calculateTimeOfDay: () => {
      set((state: WeatherState) => {
        const data = get().data;
        if (data == null || data.sys == null || state.data == null) return state;

        const now = new Date().getTime() / 1000; // Current time in seconds
        const sunrise = data.sys.sunrise != null ? data.sys.sunrise : 0;
        const sunset = data.sys.sunset != null ? data.sys.sunset : 0;

        // Dawn: 30 minutes before sunrise to sunrise
        const dawnStart = sunrise - 30 * 60;
        // Dusk: sunset to 30 minutes after sunset
        const duskEnd = sunset + 30 * 60;

        if (now >= dawnStart && now < sunrise) {
          state.data.timeOfDay = 'dawn';
        } else if (now >= sunrise && now < sunset) {
          state.data.timeOfDay = 'day';
        } else if (now >= sunset && now < duskEnd) {
          state.data.timeOfDay = 'dusk';
        } else {
          state.data.timeOfDay = 'night';
        }

        // Calculate season based on month in northern hemisphere
        const month = new Date().getMonth(); // 0-11

        if (month >= 2 && month <= 4) {
          state.data.season = 'spring';
        } else if (month >= 5 && month <= 7) {
          state.data.season = 'summer';
        } else if (month >= 8 && month <= 10) {
          state.data.season = 'fall';
        } else {
          state.data.season = 'winter';
        }

        return state;
      });
    },
  })),
);
