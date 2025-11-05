import { type UseQueryResult } from '@tanstack/react-query';
import { z } from 'zod';
/**
 * Enhanced weather service with time-of-day awareness and seasonal variations
 * Implements Phase 3 requirements for dynamic weather effects
 */
declare const WeatherSchema: z.ZodObject<{
    weather: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        main: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        id: number;
        main: string;
    }, {
        description: string;
        id: number;
        main: string;
    }>, "many">;
    main: z.ZodObject<{
        temp: z.ZodNumber;
        humidity: z.ZodNumber;
        pressure: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        temp: number;
        pressure: number;
        humidity: number;
    }, {
        temp: number;
        pressure: number;
        humidity: number;
    }>;
    name: z.ZodString;
    sys: z.ZodObject<{
        sunrise: z.ZodNumber;
        sunset: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sunrise: number;
        sunset: number;
    }, {
        sunrise: number;
        sunset: number;
    }>;
    wind: z.ZodObject<{
        speed: z.ZodNumber;
        deg: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        speed: number;
        deg: number;
    }, {
        speed: number;
        deg: number;
    }>;
    clouds: z.ZodObject<{
        all: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        all: number;
    }, {
        all: number;
    }>;
    visibility: z.ZodNumber;
    dt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    weather: {
        description: string;
        id: number;
        main: string;
    }[];
    main: {
        temp: number;
        pressure: number;
        humidity: number;
    };
    sys: {
        sunrise: number;
        sunset: number;
    };
    dt: number;
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    visibility: number;
}, {
    name: string;
    weather: {
        description: string;
        id: number;
        main: string;
    }[];
    main: {
        temp: number;
        pressure: number;
        humidity: number;
    };
    sys: {
        sunrise: number;
        sunset: number;
    };
    dt: number;
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    visibility: number;
}>;
export type WeatherResponse = z.infer<typeof WeatherSchema>;
export interface EnhancedWeatherData extends WeatherResponse {
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
    season: 'spring' | 'summer' | 'fall' | 'winter';
    isPrecipitating: boolean;
    isCold: boolean;
    isHot: boolean;
    petFriendlyTips: string[];
    activitySuggestions: string[];
}
declare function fetchWeather(lat: number, lon: number): Promise<WeatherResponse>;
/**
 * Enhanced weather hook with time-of-day and seasonal context
 */
export declare function useEnhancedWeather(): UseQueryResult<EnhancedWeatherData>;
/**
 * React Query + Geolocation hook for basic weather
 */
export declare function useWeather(): UseQueryResult<WeatherResponse>;
declare const _default: {
    fetchWeather: typeof fetchWeather;
    useWeather: typeof useWeather;
    useEnhancedWeather: typeof useEnhancedWeather;
};
export default _default;
