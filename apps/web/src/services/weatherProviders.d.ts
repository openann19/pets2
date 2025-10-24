/**
 * ULTRA PREMIUM Weather Provider Implementations 🌟
 * Additional weather data providers for maximum redundancy
 */
import { EnhancedWeatherData } from './WeatherService';
export declare class WeatherProviders {
    /**
     * Tomorrow.io (formerly ClimaCell) - Advanced weather intelligence
     */
    static fetchTomorrowIO(apiKey: string, apiUrl: string, lat: number, lon: number): Promise<EnhancedWeatherData | null>;
    /**
     * Visual Crossing - Historical and forecast weather data
     */
    static fetchVisualCrossing(apiKey: string, apiUrl: string, lat: number, lon: number): Promise<EnhancedWeatherData | null>;
    /**
     * Meteomatics - Scientific weather data
     */
    static fetchMeteomatics(apiKey: string, apiUrl: string, lat: number, lon: number): Promise<EnhancedWeatherData | null>;
    /**
     * Map Tomorrow.io data to EnhancedWeatherData
     */
    private static mapTomorrowIOData;
    /**
     * Map Visual Crossing data to EnhancedWeatherData
     */
    private static mapVisualCrossingData;
    /**
     * Map Meteomatics data to EnhancedWeatherData
     */
    private static mapMeteomaticsData;
    private static getConditionFromCode;
    private static getDescriptionFromCode;
    private static getWeatherCodeFromConditions;
    private static calculateBeaufortScale;
    private static calculateTurbulence;
    private static getUVRiskLevel;
    private static getPrecipitationIntensity;
    private static generatePetSafetyInfo;
    private static generateRiskLevel;
    private static generateActivityBlock;
}
//# sourceMappingURL=weatherProviders.d.ts.map