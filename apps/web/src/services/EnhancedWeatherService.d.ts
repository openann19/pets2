/**
 * Production-Ready Enhanced Weather Service
 * Enterprise-grade weather data with multiple providers, caching, monitoring, and internationalization
 */
import { WeatherAlert, HourlyForecast, DailyForecast, AirQuality, PetSafetyInfo } from '../types';
interface WeatherData {
    temperature: number;
    feelsLike: number;
    condition: string;
    conditionCode: string;
    description: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    location: string;
    country: string;
    timezone: string;
    localTime: string;
    sunrise: string;
    sunset: string;
    icon: string;
    alerts?: WeatherAlert[];
    hourlyForecast?: HourlyForecast[];
    dailyForecast?: DailyForecast[];
    airQuality?: AirQuality;
    petSafety: PetSafetyInfo;
    dataSource: string;
    lastUpdated: string;
    units: 'metric' | 'imperial';
}
declare class EnhancedWeatherService {
    private providers;
    private cache;
    private rateLimits;
    private logger;
    private cacheTimeout;
    private backgroundRefreshInterval;
    constructor();
    private initializeProviders;
    getCurrentWeather(lat: number, lon: number, units?: 'metric' | 'imperial'): Promise<WeatherData | null>;
    getWeatherByCity(city: string, units?: 'metric' | 'imperial'): Promise<WeatherData | null>;
    private geocodeCity;
    private checkRateLimit;
    private updateRateLimit;
    private handleRateLimitExceeded;
    private getCached;
    private setCache;
    private startBackgroundRefresh;
    private refreshPopularCities;
    destroy(): void;
}
export declare const enhancedWeatherService: EnhancedWeatherService;
export default enhancedWeatherService;
//# sourceMappingURL=EnhancedWeatherService.d.ts.map