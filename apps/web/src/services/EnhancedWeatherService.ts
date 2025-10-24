/**
 * Production-Ready Enhanced Weather Service
 * Enterprise-grade weather data with multiple providers, caching, monitoring, and internationalization
 */
import { DateTime } from 'luxon'
import { logger } from '@pawfectmatch/core';
;
import { WeatherAlert, HourlyForecast, DailyForecast, AirQuality, PetSafetyInfo } from '../types';
class ProductionLogger {
    isDevelopment = process.env.NODE_ENV === 'development';
    info(message, meta) {
        logger.info(`[WeatherService] ${message}`, { meta });
        // In production: send to monitoring service
        this.sendToMonitoring('info', message, meta);
    }
    warn(message, meta) {
        logger.warn(`[WeatherService] ${message}`, { meta });
        this.sendToMonitoring('warn', message, meta);
    }
    error(message, error, meta) {
        logger.error(`[WeatherService] ${message}`, { error, meta });
        this.sendToMonitoring('error', message, { error, ...meta });
    }
    debug(message, meta) {
        if (this.isDevelopment) {
            logger.debug(`[WeatherService] ${message}`, { meta });
        }
    }
    sendToMonitoring(level, message, meta) {
        // Integration point for Sentry, LogRocket, DataDog, etc.
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.addBreadcrumb({
                message: `WeatherService: ${message}`,
                level,
                data: meta
            });
        }
    }
}
// Enhanced OpenWeatherMap provider
class OpenWeatherMapProvider {
    name = 'OpenWeatherMap';
    priority = 1;
    rateLimit = { requests: 1000, window: 60000 }; // 1000 requests per minute
    apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
    baseUrl = 'https://api.openweathermap.org/data/2.5';
    oneCallUrl = 'https://api.openweathermap.org/data/3.0/onecall';
    async fetch(lat, lon, units) {
        if (!this.apiKey)
            return null;
        try {
            // Use One Call API 3.0 for comprehensive data including UV index
            const response = await fetch(`${this.oneCallUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&exclude=minutely`);
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }
                throw new Error(`API_ERROR_${response.status}`);
            }
            const data = await response.json();
            return this.mapOneCallData(data, units);
        }
        catch (error) {
            // Fallback to basic current weather API
            return this.fetchBasicWeather(lat, lon, units);
        }
    }
    async fetchBasicWeather(lat, lon, units) {
        try {
            const [current, forecast] = await Promise.all([
                fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`),
                fetch(`${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`)
            ]);
            if (!current.ok)
                return null;
            const currentData = await current.json();
            const forecastData = forecast.ok ? await forecast.json() : null;
            return this.mapBasicWeatherData(currentData, forecastData, units);
        }
        catch {
            return null;
        }
    }
    mapOneCallData(data, units) {
        const current = data.current;
        const timezone = data.timezone;
        const localTime = DateTime.fromSeconds(current.dt).setZone(timezone);
        return {
            temperature: Math.round(current.temp),
            feelsLike: Math.round(current.feels_like),
            condition: current.weather?.[0]?.main || 'Unknown',
            conditionCode: current.weather?.[0]?.id?.toString() || '0',
            description: current.weather?.[0]?.description || '',
            humidity: current.humidity || 0,
            windSpeed: Math.round(current.wind_speed * (units === 'metric' ? 3.6 : 2.237)),
            windDirection: current.wind_deg || 0,
            pressure: current.pressure || 0,
            visibility: (current.visibility || 10000) / 1000,
            uvIndex: current.uvi || 0,
            cloudCover: current.clouds || 0,
            precipitation: current.rain?.['1h'] || current.snow?.['1h'] || 0,
            location: data.timezone.split('/').pop()?.replace('_', ' ') || 'Unknown',
            country: 'Unknown',
            timezone,
            localTime: localTime.toISO() || new Date().toISOString(),
            sunrise: DateTime.fromSeconds(current.sunrise).setZone(timezone).toISO() || new Date(current.sunrise * 1000).toISOString(),
            sunset: DateTime.fromSeconds(current.sunset).setZone(timezone).toISO() || new Date(current.sunset * 1000).toISOString(),
            icon: `https://openweathermap.org/img/wn/${current.weather?.[0]?.icon || '01d'}@2x.png`,
            alerts: data.alerts?.map(this.mapAlert) || [],
            hourlyForecast: data.hourly?.slice(0, 48).map((hour) => this.mapHourlyData(hour, timezone, units)),
            dailyForecast: data.daily?.slice(0, 7).map((day) => this.mapDailyData(day, timezone, units)),
            petSafety: this.calculateAdvancedPetSafety(current, data.daily?.[0], data.alerts),
            dataSource: this.name,
            lastUpdated: new Date().toISOString(),
            units
        };
    }
    mapBasicWeatherData(current, forecast, units) {
        const timezone = `UTC${current.timezone >= 0 ? '+' : ''}${current.timezone / 3600}`;
        return {
            temperature: Math.round(current.main?.temp || 0),
            feelsLike: Math.round(current.main?.feels_like || current.main?.temp || 0),
            condition: current.weather?.[0]?.main || 'Unknown',
            conditionCode: current.weather?.[0]?.id?.toString() || '0',
            description: current.weather?.[0]?.description || '',
            humidity: current.main?.humidity || 0,
            windSpeed: Math.round((current.wind?.speed || 0) * (units === 'metric' ? 3.6 : 2.237)),
            windDirection: current.wind?.deg || 0,
            pressure: current.main?.pressure || 0,
            visibility: (current.visibility || 10000) / 1000,
            uvIndex: 5, // Estimated since not available in basic API
            cloudCover: current.clouds?.all || 0,
            precipitation: current.rain?.['1h'] || current.snow?.['1h'] || 0,
            location: current.name || 'Unknown',
            country: current.sys?.country || 'Unknown',
            timezone,
            localTime: new Date().toISOString(),
            sunrise: current.sys?.sunrise ? new Date(current.sys.sunrise * 1000).toISOString() : '',
            sunset: current.sys?.sunset ? new Date(current.sys.sunset * 1000).toISOString() : '',
            icon: `https://openweathermap.org/img/wn/${current.weather?.[0]?.icon || '01d'}@2x.png`,
            petSafety: this.calculateBasicPetSafety(current.main?.temp || 20, current.weather?.[0]?.main || 'Clear'),
            dataSource: this.name,
            lastUpdated: new Date().toISOString(),
            units
        };
    }
    mapAlert(alert) {
        return {
            title: alert.event || 'Weather Alert',
            description: alert.description || '',
            severity: this.mapSeverity(alert.tags?.[0] || 'minor'),
            start: new Date(alert.start * 1000).toISOString(),
            end: new Date(alert.end * 1000).toISOString()
        };
    }
    mapSeverity(tag) {
        const severityMap = {
            'extreme': 'extreme',
            'severe': 'severe',
            'moderate': 'moderate',
            'minor': 'minor'
        };
        return severityMap[tag.toLowerCase()] || 'minor';
    }
    mapHourlyData(hour, timezone, units) {
        return {
            time: DateTime.fromSeconds(hour.dt).setZone(timezone).toISO() || new Date(hour.dt * 1000).toISOString(),
            temperature: Math.round(hour.temp),
            feelsLike: Math.round(hour.feels_like),
            condition: hour.weather?.[0]?.main || 'Unknown',
            precipitation: (hour.pop || 0) * 100,
            windSpeed: Math.round(hour.wind_speed * (units === 'metric' ? 3.6 : 2.237)),
            humidity: hour.humidity || 0,
            icon: `https://openweathermap.org/img/wn/${hour.weather?.[0]?.icon || '01d'}@2x.png`
        };
    }
    mapDailyData(day, timezone, units) {
        return {
            date: DateTime.fromSeconds(day.dt).setZone(timezone).toISODate() || new Date(day.dt * 1000).toISOString(),
            tempMin: Math.round(day.temp?.min || day.temp?.night || 0),
            tempMax: Math.round(day.temp?.max || day.temp?.day || 0),
            condition: day.weather?.[0]?.main || 'Unknown',
            precipitation: (day.pop || 0) * 100,
            windSpeed: Math.round(day.wind_speed * (units === 'metric' ? 3.6 : 2.237)),
            humidity: day.humidity || 0,
            sunrise: DateTime.fromSeconds(day.sunrise).setZone(timezone).toFormat('HH:mm'),
            sunset: DateTime.fromSeconds(day.sunset).setZone(timezone).toFormat('HH:mm'),
            moonPhase: this.getMoonPhase(day.moon_phase || 0),
            icon: `https://openweathermap.org/img/wn/${day.weather?.[0]?.icon || '01d'}@2x.png`
        };
    }
    getMoonPhase(phase) {
        if (phase < 0.125)
            return 'new';
        if (phase < 0.25)
            return 'waxing_crescent';
        if (phase < 0.375)
            return 'first_quarter';
        if (phase < 0.5)
            return 'waxing_gibbous';
        if (phase < 0.625)
            return 'full';
        if (phase < 0.75)
            return 'waning_gibbous';
        if (phase < 0.875)
            return 'last_quarter';
        return 'waning_crescent';
    }
    calculateAdvancedPetSafety(current, daily, alerts) {
        const temp = current.temp || 20;
        const humidity = current.humidity || 50;
        const uv = current.uvi || 5;
        const windSpeed = current.wind_speed || 0;
        // Calculate Wet Bulb Globe Temperature (WBGT) for heat stress
        const wbgt = this.calculateWBGT(temp, humidity, windSpeed, uv);
        // Enhanced risk calculations
        const heatRisk = this.calculateHeatRisk(wbgt, temp);
        const coldRisk = this.calculateColdRisk(temp, windSpeed);
        const uvRisk = this.calculateUVRisk(uv);
        // Check for weather alerts affecting pets
        const hasHeatWarning = alerts?.some(alert => alert.tags?.includes('heat') || alert.event?.toLowerCase().includes('heat'));
        const walkSafety = this.determineWalkSafety(heatRisk, coldRisk, uvRisk, hasHeatWarning);
        return {
            walkSafety,
            recommendations: this.generateAdvancedRecommendations(temp, humidity, uv, windSpeed, alerts),
            heatRisk,
            coldRisk,
            uvRisk,
            bestWalkTimes: this.calculateOptimalWalkTimes(daily, current)
        };
    }
    calculateBasicPetSafety(temp, condition) {
        const heatRisk = temp > 35 ? 'extreme' : temp > 30 ? 'high' : temp > 25 ? 'moderate' : 'low';
        const coldRisk = temp < -10 ? 'extreme' : temp < 0 ? 'high' : temp < 10 ? 'moderate' : 'low';
        return {
            walkSafety: heatRisk === 'extreme' || coldRisk === 'extreme' ? 'unsafe' :
                heatRisk === 'high' || coldRisk === 'high' ? 'caution' : 'safe',
            recommendations: [`Current conditions: ${condition}. Temperature: ${temp}°C`],
            heatRisk,
            coldRisk,
            uvRisk: 'moderate',
            bestWalkTimes: ['Early morning (6-9 AM)', 'Evening (6-8 PM)']
        };
    }
    calculateWBGT(temp, humidity, windSpeed, uv) {
        // Simplified WBGT calculation for pet safety
        const wetBulbTemp = temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) +
            Math.atan(temp + humidity) - Math.atan(humidity - 1.676331) +
            0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) - 4.686035;
        const globeTemp = temp + (uv / 10) * 2; // UV contribution to radiant heat
        const dryBulbTemp = temp;
        // WBGT = 0.7 * Wet Bulb + 0.2 * Globe + 0.1 * Dry Bulb (outdoor formula)
        return 0.7 * wetBulbTemp + 0.2 * globeTemp + 0.1 * dryBulbTemp;
    }
    calculateHeatRisk(wbgt, temp) {
        if (wbgt > 32 || temp > 40)
            return 'extreme';
        if (wbgt > 28 || temp > 35)
            return 'high';
        if (wbgt > 24 || temp > 30)
            return 'moderate';
        return 'low';
    }
    calculateColdRisk(temp, windSpeed) {
        const windChill = temp < 10 ?
            13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16) :
            temp;
        if (windChill < -15)
            return 'extreme';
        if (windChill < -5)
            return 'high';
        if (windChill < 5)
            return 'moderate';
        return 'low';
    }
    calculateUVRisk(uv) {
        if (uv >= 11)
            return 'extreme';
        if (uv >= 8)
            return 'very_high';
        if (uv >= 6)
            return 'high';
        if (uv >= 3)
            return 'moderate';
        return 'low';
    }
    determineWalkSafety(heatRisk, coldRisk, uvRisk, hasHeatWarning) {
        if (heatRisk === 'extreme' || coldRisk === 'extreme' || hasHeatWarning)
            return 'unsafe';
        if (heatRisk === 'high' || coldRisk === 'high' || uvRisk === 'very_high' || uvRisk === 'extreme')
            return 'caution';
        return 'safe';
    }
    generateAdvancedRecommendations(temp, humidity, uv, windSpeed, alerts) {
        const recommendations = [];
        // Heat-related recommendations
        if (temp > 30) {
            recommendations.push('🌡️ High temperature: Bring water for both you and your pet');
            recommendations.push('🐾 Check pavement temperature with your hand before walking');
            if (temp > 35) {
                recommendations.push('⚠️ Extreme heat: Consider indoor activities instead');
                recommendations.push('🥾 Use protective booties to prevent paw burns');
            }
        }
        // Cold-related recommendations
        if (temp < 5) {
            recommendations.push('🧥 Cold weather: Consider a pet jacket for warmth');
            recommendations.push('❄️ Limit outdoor time and watch for hypothermia signs');
            if (temp < -5) {
                recommendations.push('🧊 Protect paws from ice and salt with booties');
            }
        }
        // UV recommendations
        if (uv > 6) {
            recommendations.push('☀️ High UV: Apply pet-safe sunscreen to exposed areas');
            recommendations.push('🌳 Seek shaded routes during walks');
        }
        // Humidity recommendations
        if (humidity > 80) {
            recommendations.push('💧 High humidity: Reduce exercise intensity');
        }
        // Wind recommendations
        if (windSpeed > 25) {
            recommendations.push('💨 Windy conditions: Secure leash and avoid open areas');
        }
        // Alert-based recommendations
        alerts?.forEach(alert => {
            if (alert.tags?.includes('heat')) {
                recommendations.push('🚨 Heat warning in effect: Avoid outdoor activities');
            }
            if (alert.tags?.includes('storm')) {
                recommendations.push('⛈️ Storm warning: Stay indoors until conditions improve');
            }
        });
        return recommendations;
    }
    calculateOptimalWalkTimes(daily, current) {
        const times = [];
        const temp = current.temp || 20;
        const uv = current.uvi || 5;
        if (temp > 25 || uv > 6) {
            times.push('🌅 Early morning (5:30-8:00 AM) - Coolest temperatures');
            times.push('🌙 Late evening (7:30-10:00 PM) - After sunset');
        }
        else if (temp < 10) {
            times.push('☀️ Midday (11:00 AM-2:00 PM) - Warmest period');
            times.push('🌤️ Early afternoon (2:00-4:00 PM) - Still warm');
        }
        else {
            times.push('🌄 Morning (7:00-10:00 AM) - Pleasant temperatures');
            times.push('🌆 Late afternoon (4:00-7:00 PM) - Comfortable walking');
            times.push('🌃 Evening (7:00-9:00 PM) - Cool and comfortable');
        }
        return times;
    }
}
// Enhanced Weather Service with all production features
class EnhancedWeatherService {
    providers = [];
    cache = new Map();
    rateLimits = new Map();
    logger = new ProductionLogger();
    cacheTimeout = 10 * 60 * 1000; // 10 minutes
    backgroundRefreshInterval = null;
    constructor() {
        this.initializeProviders();
        this.startBackgroundRefresh();
    }
    initializeProviders() {
        this.providers = [
            new OpenWeatherMapProvider()
        ].sort((a, b) => a.priority - b.priority);
        this.logger.info('Weather service initialized', {
            providers: this.providers.map(p => p.name),
            cacheTimeout: this.cacheTimeout
        });
    }
    async getCurrentWeather(lat, lon, units = 'metric') {
        const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)},${units}`;
        // Check cache first
        const cached = this.getCached(cacheKey);
        if (cached) {
            this.logger.debug('Cache hit', { cacheKey });
            return cached;
        }
        // Try providers in priority order
        for (const provider of this.providers) {
            if (!this.checkRateLimit(provider)) {
                this.logger.warn('Rate limit exceeded', { provider: provider.name });
                continue;
            }
            try {
                this.logger.debug('Fetching from provider', { provider: provider.name, lat, lon, units });
                const weatherData = await provider.fetch(lat, lon, units);
                if (weatherData) {
                    this.setCache(cacheKey, weatherData);
                    this.updateRateLimit(provider);
                    this.logger.info('Weather data fetched successfully', {
                        provider: provider.name,
                        location: weatherData.location,
                        temperature: weatherData.temperature
                    });
                    return weatherData;
                }
            }
            catch (error) {
                this.logger.error('Provider fetch failed', error, {
                    provider: provider.name,
                    lat,
                    lon
                });
                if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
                    this.handleRateLimitExceeded(provider);
                }
            }
        }
        this.logger.error('All providers failed', null, { lat, lon, units });
        return null;
    }
    async getWeatherByCity(city, units = 'metric') {
        const cacheKey = `city:${city.toLowerCase()},${units}`;
        const cached = this.getCached(cacheKey);
        if (cached)
            return cached;
        try {
            // Get coordinates using free geocoding service
            const coords = await this.geocodeCity(city);
            if (!coords) {
                this.logger.warn('Geocoding failed', { city });
                return null;
            }
            const weatherData = await this.getCurrentWeather(coords.lat, coords.lon, units);
            if (weatherData) {
                this.setCache(cacheKey, weatherData);
            }
            return weatherData;
        }
        catch (error) {
            this.logger.error('City weather fetch failed', error, { city });
            return null;
        }
    }
    async geocodeCity(city) {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            if (!response.ok)
                return null;
            const data = await response.json();
            if (!data.results?.length)
                return null;
            return {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude
            };
        }
        catch {
            return null;
        }
    }
    checkRateLimit(provider) {
        const key = provider.name;
        const limit = this.rateLimits.get(key);
        if (!limit)
            return true;
        const now = Date.now();
        if (now - limit.windowStart > provider.rateLimit.window) {
            // Reset window
            this.rateLimits.set(key, { requests: 0, windowStart: now });
            return true;
        }
        return limit.requests < provider.rateLimit.requests;
    }
    updateRateLimit(provider) {
        const key = provider.name;
        const limit = this.rateLimits.get(key);
        const now = Date.now();
        if (!limit || now - limit.windowStart > provider.rateLimit.window) {
            this.rateLimits.set(key, { requests: 1, windowStart: now });
        }
        else {
            limit.requests++;
        }
    }
    handleRateLimitExceeded(provider) {
        const key = provider.name;
        const now = Date.now();
        // Set rate limit to max for current window
        this.rateLimits.set(key, {
            requests: provider.rateLimit.requests,
            windowStart: now
        });
        this.logger.warn('Rate limit exceeded, provider blocked', {
            provider: provider.name,
            resetTime: new Date(now + provider.rateLimit.window).toISOString()
        });
    }
    getCached(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const now = Date.now();
        if (now > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    setCache(key, data) {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + this.cacheTimeout
        });
    }
    startBackgroundRefresh() {
        // Refresh popular cities every 5 minutes
        this.backgroundRefreshInterval = setInterval(() => {
            this.refreshPopularCities();
        }, 5 * 60 * 1000);
    }
    async refreshPopularCities() {
        const popularCities = [
            { name: 'New York', lat: 40.7128, lon: -74.0060 },
            { name: 'London', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
            { name: 'Paris', lat: 48.8566, lon: 2.3522 },
            { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
        ];
        for (const city of popularCities) {
            try {
                await this.getCurrentWeather(city.lat, city.lon);
                this.logger.debug('Background refresh completed', { city: city.name });
            }
            catch (error) {
                this.logger.debug('Background refresh failed', { city: city.name, error });
            }
        }
    }
    // Cleanup method for proper resource management
    destroy() {
        if (this.backgroundRefreshInterval) {
            clearInterval(this.backgroundRefreshInterval);
            this.backgroundRefreshInterval = null;
        }
        this.cache.clear();
        this.rateLimits.clear();
        this.logger.info('Weather service destroyed');
    }
}
// Export singleton instance
export const enhancedWeatherService = new EnhancedWeatherService();
export default enhancedWeatherService;
//# sourceMappingURL=EnhancedWeatherService.js.map