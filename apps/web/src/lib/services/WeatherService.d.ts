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
    }, z.core.$strip>>;
    main: z.ZodObject<{
        temp: z.ZodNumber;
        humidity: z.ZodNumber;
        pressure: z.ZodNumber;
    }, z.core.$strip>;
    name: z.ZodString;
    sys: z.ZodObject<{
        sunrise: z.ZodNumber;
        sunset: z.ZodNumber;
    }, z.core.$strip>;
    wind: z.ZodObject<{
        speed: z.ZodNumber;
        deg: z.ZodNumber;
    }, z.core.$strip>;
    clouds: z.ZodObject<{
        all: z.ZodNumber;
    }, z.core.$strip>;
    visibility: z.ZodNumber;
    dt: z.ZodNumber;
}, z.core.$strip>;
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
export declare function useEnhancedWeather(): import("@tanstack/react-query").UseQueryResult<EnhancedWeatherData, Error>;
/**
 * React Query + Geolocation hook for basic weather
 */
export declare function useWeather(): import("@tanstack/react-query").UseQueryResult<{
    weather: {
        id: number;
        main: string;
        description: string;
    }[];
    main: {
        temp: number;
        humidity: number;
        pressure: number;
    };
    name: string;
    sys: {
        sunrise: number;
        sunset: number;
    };
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    visibility: number;
    dt: number;
}, Error>;
declare const _default: {
    fetchWeather: typeof fetchWeather;
    useWeather: typeof useWeather;
    useEnhancedWeather: typeof useEnhancedWeather;
};
export default _default;
//# sourceMappingURL=WeatherService.d.ts.map