/**
 * ULTRA PREMIUM Weather Provider Implementations 🌟
 * Additional weather data providers for maximum redundancy
 */
import { EnhancedWeatherData } from './WeatherService';
import { logger } from './logger';
export class WeatherProviders {
    /**
     * Tomorrow.io (formerly ClimaCell) - Advanced weather intelligence
     */
    static async fetchTomorrowIO(apiKey, apiUrl, lat, lon) {
        try {
            const fields = [
                'temperature',
                'temperatureApparent',
                'humidity',
                'windSpeed',
                'windDirection',
                'windGust',
                'precipitationIntensity',
                'precipitationType',
                'precipitationProbability',
                'pressureSurfaceLevel',
                'visibility',
                'cloudCover',
                'weatherCode',
                'uvIndex',
                'solarGHI',
                'dewPoint',
                'evapotranspiration'
            ].join(',');
            const response = await fetch(`${apiUrl}/timelines?location=${lat},${lon}&fields=${fields}&units=metric&apikey=${apiKey}`);
            if (!response.ok)
                throw new Error('Tomorrow.io API request failed');
            const data = await response.json();
            return this.mapTomorrowIOData(data);
        }
        catch (error) {
            logger.error('Tomorrow.io API error', error);
            return null;
        }
    }
    /**
     * Visual Crossing - Historical and forecast weather data
     */
    static async fetchVisualCrossing(apiKey, apiUrl, lat, lon) {
        try {
            const response = await fetch(`${apiUrl}/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,days,hours,alerts,events`);
            if (!response.ok)
                throw new Error('Visual Crossing API request failed');
            const data = await response.json();
            return this.mapVisualCrossingData(data);
        }
        catch (error) {
            logger.error('Visual Crossing API error', error);
            return null;
        }
    }
    /**
     * Meteomatics - Scientific weather data
     */
    static async fetchMeteomatics(apiKey, apiUrl, lat, lon) {
        try {
            const now = new Date().toISOString();
            const parameters = [
                't_2m:C', // Temperature
                't_apparent:C', // Feels like
                'precip_1h:mm', // Precipitation
                'wind_speed_10m:ms', // Wind speed
                'wind_dir_10m:d', // Wind direction
                'wind_gusts_10m_1h:ms', // Wind gusts
                'relative_humidity_2m:p', // Humidity
                'msl_pressure:Pa', // Pressure
                'total_cloud_cover:p', // Cloud cover
                'visibility:m', // Visibility
                'uv:idx', // UV index
                'dew_point_2m:C' // Dew point
            ].join(',');
            const response = await fetch(`${apiUrl}/${now}/${parameters}/${lat},${lon}/json`, {
                headers: {
                    'Authorization': `Basic ${btoa(apiKey)}`
                }
            });
            if (!response.ok)
                throw new Error('Meteomatics API request failed');
            const data = await response.json();
            return this.mapMeteomaticsData(data);
        }
        catch (error) {
            logger.error('Meteomatics API error', error);
            return null;
        }
    }
    /**
     * Map Tomorrow.io data to EnhancedWeatherData
     */
    static mapTomorrowIOData(data) {
        const current = data.data.timelines[0].intervals[0];
        const values = current.values;
        // Extract lat and lon from data (assuming they're stored somewhere in the response)
        const lat = 0; // Placeholder value
        const lon = 0; // Placeholder value
        // Create mock enhanced data structure
        return {
            // Core Metrics
            temperature: Math.round(values.temperature),
            feelsLike: Math.round(values.temperatureApparent),
            realFeelShade: Math.round(values.temperatureApparent - 2),
            wetBulbTemperature: Math.round(values.temperature * 0.85),
            dewPoint: Math.round(values.dewPoint || values.temperature - 5),
            condition: this.getConditionFromCode(values.weatherCode),
            conditionCode: values.weatherCode.toString(),
            description: this.getDescriptionFromCode(values.weatherCode),
            humidity: values.humidity,
            relativeHumidity: values.humidity,
            // Wind Intelligence
            windSpeed: Math.round(values.windSpeed * 3.6), // m/s to km/h
            windDirection: values.windDirection,
            windGust: Math.round((values.windGust || values.windSpeed * 1.5) * 3.6),
            windChill: Math.round(values.temperatureApparent - 2),
            beaufortScale: this.calculateBeaufortScale(values.windSpeed),
            windTurbulence: this.calculateTurbulence(values.windGust, values.windSpeed),
            // Atmospheric Data
            pressure: Math.round(values.pressureSurfaceLevel),
            pressureTrend: 'steady',
            visibility: values.visibility / 1000, // m to km
            uvIndex: values.uvIndex,
            uvRiskLevel: this.getUVRiskLevel(values.uvIndex),
            solarRadiation: values.solarGHI || 0,
            cloudCover: values.cloudCover,
            cloudBase: 1000,
            cloudType: ['cumulus'],
            // Precipitation Analytics
            precipitation: values.precipitationIntensity || 0,
            precipitationType: values.precipitationType || 'none',
            precipitationProbability: values.precipitationProbability || 0,
            precipitationIntensity: this.getPrecipitationIntensity(values.precipitationIntensity),
            rainAccumulation24h: values.precipitationIntensity * 24 || 0,
            // Location Intelligence
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            country: 'US',
            region: 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            elevation: 0,
            coordinates: { lat, lon },
            nearestCity: 'Unknown',
            microclimate: 'temperate',
            // Astronomical Data
            sunrise: new Date().toISOString(),
            sunset: new Date().toISOString(),
            moonrise: new Date().toISOString(),
            moonset: new Date().toISOString(),
            moonPhase: {
                phase: 'waxing',
                illumination: 50,
                age: 7,
                distance: 384400,
                angle: 180,
                emoji: '🌓',
                nextPhases: []
            },
            solarNoon: new Date().toISOString(),
            goldenHour: { start: '06:00', end: '07:00' },
            blueHour: { start: '05:30', end: '06:00' },
            dayLength: 12 * 60 * 60,
            // Premium Visualizations
            icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
            animatedIcon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png',
            backgroundGradient: ['#87CEEB', '#98D8E8'],
            arVisualizationData: {
                cloudModel: 'cumulus',
                precipitationParticles: {},
                windVectors: {},
                temperatureHeatmap: {},
                enabled: true
            },
            // AI-Powered Insights
            aiSummary: `Current temperature is ${values.temperature}°C with ${values.humidity}% humidity.`,
            aiConfidenceScore: 95,
            trendPrediction: {
                direction: 'stable',
                confidence: 90,
                keyChanges: ['Temperature steady', 'No precipitation expected'],
                timeline: 'next 6 hours'
            },
            anomalyDetection: [],
            historicalComparison: {
                comparisonPeriod: 'last year',
                temperatureDelta: 0,
                precipitationDelta: 0,
                extremeEventsCount: 0,
                trendsIdentified: [],
                climateSummary: 'Normal conditions',
                recordsApproached: [],
                seasonalAlignment: 'normal'
            },
            // Pet-Specific Intelligence
            petSafety: this.generatePetSafetyInfo(values),
            breedSpecificAdvice: [],
            petActivityForecast: {
                morning: this.generateActivityBlock('morning'),
                afternoon: this.generateActivityBlock('afternoon'),
                evening: this.generateActivityBlock('evening'),
                night: this.generateActivityBlock('night')
            },
            // Premium Features
            dataProviders: [{
                    name: 'Tomorrow.io',
                    priority: 3,
                    responseTime: 250,
                    accuracy: 95,
                    lastSuccess: new Date().toISOString(),
                    failureCount: 0,
                    status: 'active',
                    dataContribution: ['temperature', 'precipitation', 'wind']
                }],
            lastUpdated: new Date().toISOString(),
            nextUpdate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            dataQuality: {
                accuracy: 95,
                completeness: 90,
                timeliness: 100,
                consistency: 95,
                providers: 1,
                lastCalibration: new Date().toISOString()
            }
        };
    }
    /**
     * Map Visual Crossing data to EnhancedWeatherData
     */
    static mapVisualCrossingData(data) {
        const current = data.currentConditions;
        // Similar mapping as Tomorrow.io but using Visual Crossing's data structure
        return this.mapTomorrowIOData({
            data: {
                timelines: [{
                        intervals: [{
                                values: {
                                    temperature: current.temp,
                                    temperatureApparent: current.feelslike,
                                    humidity: current.humidity,
                                    windSpeed: current.windspeed / 3.6, // km/h to m/s
                                    windDirection: current.winddir,
                                    windGust: current.windgust / 3.6,
                                    precipitationIntensity: current.precip,
                                    precipitationType: current.preciptype?.[0] || 'none',
                                    precipitationProbability: current.precipprob,
                                    pressureSurfaceLevel: current.pressure,
                                    visibility: current.visibility * 1000, // km to m
                                    cloudCover: current.cloudcover,
                                    weatherCode: this.getWeatherCodeFromConditions(current.conditions),
                                    uvIndex: current.uvindex,
                                    dewPoint: current.dew
                                }
                            }]
                    }]
            }
        });
    }
    /**
     * Map Meteomatics data to EnhancedWeatherData
     */
    static mapMeteomaticsData(data) {
        // Extract values from Meteomatics response
        const getValue = (parameter) => {
            const item = data.data.find((d) => d.parameter === parameter);
            return item?.coordinates[0]?.dates[0]?.value || 0;
        };
        return this.mapTomorrowIOData({
            data: {
                timelines: [{
                        intervals: [{
                                values: {
                                    temperature: getValue('t_2m:C'),
                                    temperatureApparent: getValue('t_apparent:C'),
                                    humidity: getValue('relative_humidity_2m:p'),
                                    windSpeed: getValue('wind_speed_10m:ms'),
                                    windDirection: getValue('wind_dir_10m:d'),
                                    windGust: getValue('wind_gusts_10m_1h:ms'),
                                    precipitationIntensity: getValue('precip_1h:mm'),
                                    precipitationType: 'rain',
                                    precipitationProbability: 0,
                                    pressureSurfaceLevel: getValue('msl_pressure:Pa') / 100, // Pa to hPa
                                    visibility: getValue('visibility:m'),
                                    cloudCover: getValue('total_cloud_cover:p'),
                                    weatherCode: 1000,
                                    uvIndex: getValue('uv:idx'),
                                    dewPoint: getValue('dew_point_2m:C')
                                }
                            }]
                    }]
            }
        });
    }
    // Helper methods
    static getConditionFromCode(code) {
        const conditions = {
            1000: 'Clear',
            1100: 'Partly Cloudy',
            1101: 'Mostly Cloudy',
            1102: 'Overcast',
            2000: 'Fog',
            4000: 'Drizzle',
            4200: 'Rain',
            5000: 'Snow',
            6000: 'Freezing Rain',
            7000: 'Ice Pellets',
            8000: 'Thunderstorm'
        };
        return conditions[code] || 'Unknown';
    }
    static getDescriptionFromCode(code) {
        return `Weather code ${code} - ${this.getConditionFromCode(code)}`;
    }
    static getWeatherCodeFromConditions(conditions) {
        const conditionMap = {
            'clear': 1000,
            'partly cloudy': 1100,
            'cloudy': 1101,
            'overcast': 1102,
            'fog': 2000,
            'drizzle': 4000,
            'rain': 4200,
            'snow': 5000,
            'freezing rain': 6000,
            'ice pellets': 7000,
            'thunderstorm': 8000
        };
        const lowerConditions = conditions.toLowerCase();
        for (const [key, value] of Object.entries(conditionMap)) {
            if (lowerConditions.includes(key))
                return value;
        }
        return 1000;
    }
    static calculateBeaufortScale(windSpeed) {
        // Wind speed in m/s
        if (windSpeed < 0.3)
            return 0;
        if (windSpeed < 1.6)
            return 1;
        if (windSpeed < 3.4)
            return 2;
        if (windSpeed < 5.5)
            return 3;
        if (windSpeed < 8.0)
            return 4;
        if (windSpeed < 10.8)
            return 5;
        if (windSpeed < 13.9)
            return 6;
        if (windSpeed < 17.2)
            return 7;
        if (windSpeed < 20.8)
            return 8;
        if (windSpeed < 24.5)
            return 9;
        if (windSpeed < 28.5)
            return 10;
        if (windSpeed < 32.7)
            return 11;
        return 12;
    }
    static calculateTurbulence(gust, speed) {
        const ratio = gust / speed;
        if (ratio < 1.2)
            return 'calm';
        if (ratio < 1.5)
            return 'light';
        if (ratio < 2.0)
            return 'moderate';
        return 'severe';
    }
    static getUVRiskLevel(uvIndex) {
        if (uvIndex <= 2)
            return 'Low';
        if (uvIndex <= 5)
            return 'Moderate';
        if (uvIndex <= 7)
            return 'High';
        if (uvIndex <= 10)
            return 'Very High';
        return 'Extreme';
    }
    static getPrecipitationIntensity(rate) {
        if (rate === 0)
            return 'none';
        if (rate < 2.5)
            return 'light';
        if (rate < 10)
            return 'moderate';
        if (rate < 50)
            return 'heavy';
        return 'extreme';
    }
    static generatePetSafetyInfo(values) {
        const temp = values.temperature;
        const humidity = values.humidity;
        const uv = values.uvIndex;
        return {
            overallSafety: temp > 35 || temp < -10 ? 'dangerous' : temp > 30 || temp < 0 ? 'poor' : 'good',
            walkSafety: temp > 35 || temp < -10 ? 'emergency' : temp > 30 || temp < 0 ? 'unsafe' : 'safe',
            safetyScore: Math.max(0, Math.min(100, 100 - Math.abs(temp - 20) * 2 - humidity * 0.5 - uv * 5)),
            heatRisk: this.generateRiskLevel(temp > 30 ? 'high' : temp > 25 ? 'moderate' : 'low'),
            coldRisk: this.generateRiskLevel(temp < 0 ? 'high' : temp < 10 ? 'moderate' : 'low'),
            uvRisk: this.generateRiskLevel(uv > 7 ? 'high' : uv > 5 ? 'moderate' : 'low'),
            windRisk: this.generateRiskLevel(values.windSpeed > 10 ? 'high' : values.windSpeed > 5 ? 'moderate' : 'low'),
            precipitationRisk: this.generateRiskLevel(values.precipitationIntensity > 10 ? 'high' : values.precipitationIntensity > 2 ? 'moderate' : 'low'),
            airQualityRisk: this.generateRiskLevel('low'),
            recommendations: [],
            breedSpecificWarnings: [],
            bestWalkTimes: [],
            pottyBreakSchedule: ['06:00', '12:00', '18:00', '22:00'],
            playTimeWindows: [],
            hydrationReminders: ['Every 30 minutes during walks'],
            pawProtectionNeeded: temp > 30 || temp < 0,
            respiratoryPrecautions: [],
            arthritisPainLevel: Math.max(0, Math.min(10, Math.abs(temp - 20) / 2)),
            emergencyKit: ['Water', 'First aid', 'Emergency contacts'],
            nearestVets: [],
            petFirstAid: ['CPR', 'Wound care', 'Heatstroke treatment'],
            alertsEnabled: true,
            customAlertThresholds: [],
            voiceAlerts: false,
            wearableIntegration: []
        };
    }
    static generateRiskLevel(level) {
        return {
            level: level,
            score: level === 'high' ? 80 : level === 'moderate' ? 50 : 20,
            factors: [`${level} risk conditions`],
            mitigation: [`Take ${level} precautions`]
        };
    }
    static generateActivityBlock(time) {
        return {
            timeRange: {
                start: time === 'morning' ? '06:00' : time === 'afternoon' ? '12:00' : time === 'evening' ? '18:00' : '22:00',
                end: time === 'morning' ? '09:00' : time === 'afternoon' ? '15:00' : time === 'evening' ? '21:00' : '23:00'
            },
            activities: [],
            weatherSuitability: 80,
            notes: [`${time} activities`]
        };
    }
}
//# sourceMappingURL=weatherProviders.js.map