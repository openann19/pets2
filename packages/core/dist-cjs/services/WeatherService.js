"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEnhancedWeather = useEnhancedWeather;
exports.useWeather = useWeather;
const react_query_1 = require("@tanstack/react-query");
const zod_1 = require("zod");
const environment_1 = require("../utils/environment");
/**
 * Enhanced weather service with time-of-day awareness and seasonal variations
 * Implements Phase 3 requirements for dynamic weather effects
 */
const WeatherSchema = zod_1.z.object({
    weather: zod_1.z.array(zod_1.z.object({ id: zod_1.z.number(), main: zod_1.z.string(), description: zod_1.z.string() })),
    main: zod_1.z.object({ temp: zod_1.z.number(), humidity: zod_1.z.number(), pressure: zod_1.z.number() }),
    name: zod_1.z.string(),
    sys: zod_1.z.object({ sunrise: zod_1.z.number(), sunset: zod_1.z.number() }),
    wind: zod_1.z.object({ speed: zod_1.z.number(), deg: zod_1.z.number() }),
    clouds: zod_1.z.object({ all: zod_1.z.number() }),
    visibility: zod_1.z.number(),
    dt: zod_1.z.number()
});
const API_KEY = process.env['REACT_APP_OPENWEATHER_KEY'] ?? process.env['OPENWEATHER_KEY'];
const ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';
async function fetchWeather(lat, lon) {
    if (API_KEY == null || API_KEY === '')
        throw new Error('OpenWeather API key not configured');
    const url = `${ENDPOINT}?lat=${String(lat)}&lon=${String(lon)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error('Failed to fetch weather');
    const json = await res.json();
    return WeatherSchema.parse(json);
}
/**
 * Get current time of day based on sunrise/sunset
 */
function getTimeOfDay(sunrise, sunset, currentTime) {
    const now = currentTime;
    const dawnStart = sunrise - 3600; // 1 hour before sunrise
    const duskEnd = sunset + 3600; // 1 hour after sunset
    if (now >= dawnStart && now < sunrise)
        return 'dawn';
    if (now >= sunrise && now < sunset)
        return 'day';
    if (now >= sunset && now < duskEnd)
        return 'dusk';
    return 'night';
}
/**
 * Get current season based on date
 */
function getSeason() {
    const month = new Date().getMonth() + 1; // getMonth() returns 0-11
    if (month >= 3 && month <= 5)
        return 'spring';
    if (month >= 6 && month <= 8)
        return 'summer';
    if (month >= 9 && month <= 11)
        return 'fall';
    return 'winter';
}
/**
 * Generate pet-friendly tips based on weather conditions
 */
function generatePetTips(weather, timeOfDay, season) {
    const tips = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0]?.main.toLowerCase();
    // Temperature-based tips
    if (temp < 5) {
        tips.push('Keep your pet warm with extra bedding and consider indoor activities');
    }
    else if (temp > 30) {
        tips.push('Ensure your pet stays hydrated and avoid long walks during peak heat');
    }
    // Weather condition tips
    if (condition != null && condition.includes('rain')) {
        tips.push('Pack a towel for after-walk cleanup and consider waterproof gear');
    }
    else if (condition != null && condition.includes('snow')) {
        tips.push('Protect paws with booties and limit outdoor time in extreme cold');
    }
    else if (condition != null && condition.includes('thunderstorm')) {
        tips.push('Keep pets indoors during storms - many are afraid of thunder');
    }
    // Time-based tips
    if (timeOfDay === 'night') {
        tips.push('Use reflective gear for evening walks for better visibility');
    }
    else if (timeOfDay === 'day' && temp > 25) {
        tips.push('Walk during cooler parts of the day to avoid heat exhaustion');
    }
    // Seasonal tips
    if (season === 'summer') {
        tips.push('Check for ticks after outdoor activities and ensure flea prevention');
    }
    else if (season === 'winter') {
        tips.push('Wipe paws after walks to remove salt and chemicals from roads');
    }
    return tips.length > 0 ? tips : ['Perfect weather for pet activities!'];
}
/**
 * Generate activity suggestions based on weather
 */
function generateActivitySuggestions(weather, timeOfDay, season) {
    const suggestions = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0]?.main.toLowerCase();
    const windSpeed = weather.wind.speed;
    // Outdoor activities
    if (temp >= 10 && temp <= 25 && (condition == null || !condition.includes('rain')) && (condition == null || !condition.includes('snow'))) {
        suggestions.push('Perfect weather for a long park walk');
        suggestions.push('Great conditions for fetch or agility training');
        if (windSpeed < 5) {
            suggestions.push('Ideal for a relaxed picnic with your pet');
        }
    }
    // Indoor activities
    if (temp < 10 || temp > 30 || (condition != null && condition.includes('rain'))) {
        suggestions.push('Try indoor puzzle toys or training games');
        suggestions.push('Perfect time for bonding with cuddle sessions');
    }
    // Time-specific activities
    if (timeOfDay === 'dawn' || timeOfDay === 'dusk') {
        suggestions.push('Beautiful lighting for pet photography');
    }
    // Seasonal activities
    if (season === 'summer' && temp > 20) {
        suggestions.push('Visit a pet-friendly beach or lake if available');
    }
    else if (season === 'fall') {
        suggestions.push('Collect fallen leaves for sensory play');
    }
    return suggestions.length > 0 ? suggestions : ['Enjoy quality time with your pet!'];
}
/**
 * Enhanced weather hook with time-of-day and seasonal context
 */
function useEnhancedWeather() {
    return (0, react_query_1.useQuery)({
        queryKey: ['enhanced-weather'],
        queryFn: async () => {
            const pos = await getPosition();
            const weather = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
            const timeOfDay = getTimeOfDay(weather.sys.sunrise, weather.sys.sunset, weather.dt);
            const season = getSeason();
            const isPrecipitating = weather.weather.some(w => w.main.toLowerCase().includes('rain') ||
                w.main.toLowerCase().includes('snow') ||
                w.main.toLowerCase().includes('drizzle'));
            const isCold = weather.main.temp < 10;
            const isHot = weather.main.temp > 28;
            const enhancedData = {
                ...weather,
                timeOfDay,
                season,
                isPrecipitating,
                isCold,
                isHot,
                petFriendlyTips: generatePetTips(weather, timeOfDay, season),
                activitySuggestions: generateActivitySuggestions(weather, timeOfDay, season)
            };
            return enhancedData;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
        refetchInterval: 1000 * 60 * 15,
        refetchOnWindowFocus: false
    });
}
/**
 * React Query + Geolocation hook for basic weather
 */
function useWeather() {
    return (0, react_query_1.useQuery)({
        queryKey: ['weather'],
        queryFn: async () => {
            const pos = await getPosition();
            return fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        staleTime: 1000 * 60 * 20, // 20min
        refetchInterval: 1000 * 60 * 20,
        refetchOnWindowFocus: false
    });
}
function getPosition() {
    return new Promise((resolve, reject) => {
        const geolocation = (0, environment_1.getGeolocation)();
        if (geolocation == null) {
            reject(new Error('Geolocation not available'));
            return;
        }
        geolocation.getCurrentPosition(resolve, reject);
    });
}
exports.default = { fetchWeather, useWeather, useEnhancedWeather };
//# sourceMappingURL=WeatherService.js.map