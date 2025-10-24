/**
 * ULTRA PREMIUM Weather Type Definitions 🌟
 * Complete type system for the enhanced weather service
 */
export interface DataProviderInfo {
    name: string;
    priority: number;
    responseTime: number;
    accuracy: number;
    lastSuccess: string;
    failureCount: number;
    status: 'active' | 'degraded' | 'offline';
    dataContribution: string[];
}
export interface GeoPolygon {
    coordinates: [number, number][];
    center: {
        lat: number;
        lon: number;
    };
    area: number;
    perimeter: number;
}
export interface EvacuationRoute {
    id: string;
    name: string;
    distance: number;
    estimatedTime: number;
    waypoints: {
        lat: number;
        lon: number;
    }[];
    shelterInfo: EmergencyShelter;
    trafficStatus: 'clear' | 'moderate' | 'heavy';
    petFriendly: boolean;
}
export interface EmergencyShelter {
    name: string;
    address: string;
    capacity: number;
    currentOccupancy: number;
    acceptsPets: boolean;
    medicalFacilities: boolean;
    contactNumber: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}
export interface EmergencyContact {
    type: 'police' | 'fire' | 'medical' | 'veterinary' | 'animal_control' | 'weather_service';
    name: string;
    phone: string;
    address?: string;
    available24h: boolean;
    specializations?: string[];
}
export interface PetBreed {
    name: string;
    size: 'toy' | 'small' | 'medium' | 'large' | 'giant';
    coatType: 'hairless' | 'short' | 'medium' | 'long' | 'double';
    temperatureToleranceMin: number;
    temperatureToleranceMax: number;
    exerciseNeeds: 'minimal' | 'low' | 'moderate' | 'high' | 'very_high';
    weatherSensitivities: string[];
    specialConsiderations: string[];
}
export interface VetClinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    emergencyPhone?: string;
    coordinates: {
        lat: number;
        lon: number;
    };
    distance: number;
    isEmergency: boolean;
    is24Hour: boolean;
    specializations: string[];
    rating: number;
    estimatedWaitTime?: number;
    acceptsWalkIns: boolean;
    parkingAvailable: boolean;
    websiteUrl?: string;
}
export interface BreedWeatherAdvice {
    breed: string;
    currentAdvice: string;
    walkDuration: number;
    walkIntensity: 'light' | 'moderate' | 'vigorous';
    indoorActivities: string[];
    hydrationFrequency: number;
    specialPrecautions: string[];
    groomingTips: string[];
    comfortScore: number;
}
export interface PetActivitySchedule {
    morning: ActivityBlock;
    afternoon: ActivityBlock;
    evening: ActivityBlock;
    night: ActivityBlock;
    specialEvents?: SpecialActivity[];
}
export interface ActivityBlock {
    timeRange: {
        start: string;
        end: string;
    };
    activities: PlannedActivity[];
    weatherSuitability: number;
    notes: string[];
}
export interface PlannedActivity {
    type: 'walk' | 'play' | 'training' | 'grooming' | 'feeding' | 'rest';
    duration: number;
    location: 'indoor' | 'outdoor' | 'covered';
    intensity: 'low' | 'medium' | 'high';
    requirements: string[];
}
export interface SpecialActivity {
    name: string;
    time: string;
    duration: number;
    weatherDependent: boolean;
    alternativeIfBadWeather?: string;
}
export interface PlayWindow {
    start: string;
    end: string;
    suitableGames: string[];
    socializing: boolean;
    energyLevel: 'calm' | 'moderate' | 'energetic';
    surfaceType: 'grass' | 'sand' | 'concrete' | 'indoor';
}
export interface SolarPanelOutput {
    currentGeneration: number;
    dailyTotal: number;
    efficiency: number;
    peakHours: {
        start: string;
        end: string;
    };
    estimatedSavings: number;
    co2Offset: number;
    gridContribution: number;
}
export interface TransportMode {
    type: 'walking' | 'cycling' | 'driving' | 'public_transport' | 'flying';
    weatherImpact: 'none' | 'minor' | 'moderate' | 'severe';
    safetyRating: number;
    recommendations: string[];
    alternativeSuggested?: string;
    delayProbability: number;
}
export interface PollenData {
    tree: PollenLevel;
    grass: PollenLevel;
    weed: PollenLevel;
    mold: PollenLevel;
    overall: PollenLevel;
    dominantAllergen: string;
    forecast: PollenForecast[];
    medicationReminder?: string;
}
export interface PollenLevel {
    count: number;
    level: 'low' | 'moderate' | 'high' | 'very_high';
    index: number;
    color: string;
    affecting: string[];
}
export interface PollenForecast {
    date: string;
    levels: {
        tree: number;
        grass: number;
        weed: number;
        mold: number;
    };
    trend: 'improving' | 'stable' | 'worsening';
}
export interface AllergyRiskAssessment {
    overallRisk: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
    triggers: AllergyTrigger[];
    symptoms: string[];
    preventiveMeasures: string[];
    medicationAdvice: string[];
    indoorAirQuality: AirQualityMetric;
    outdoorExposureTime: number;
}
export interface AllergyTrigger {
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    presentToday: boolean;
    peakTimes: string[];
}
export interface AirQualityMetric {
    score: number;
    pollutants: {
        [key: string]: number;
    };
    recommendations: string[];
}
export interface SeismicData {
    recentActivity: SeismicEvent[];
    riskLevel: 'minimal' | 'low' | 'moderate' | 'elevated' | 'high';
    nearestFault: {
        name: string;
        distance: number;
        lastActivity: string;
    };
    preparednessScore: number;
    emergencyProtocol: string[];
}
export interface SeismicEvent {
    magnitude: number;
    depth: number;
    location: {
        lat: number;
        lon: number;
    };
    distance: number;
    time: string;
    intensity: string;
}
export interface AnomalyReport {
    id: string;
    type: 'temperature' | 'pressure' | 'precipitation' | 'wind' | 'other';
    severity: 'minor' | 'moderate' | 'significant' | 'extreme';
    description: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
    historicalContext: string;
    possibleCauses: string[];
    impact: string[];
    confidence: number;
}
export interface HistoricalAnalysis {
    comparisonPeriod: string;
    temperatureDelta: number;
    precipitationDelta: number;
    extremeEventsCount: number;
    trendsIdentified: WeatherPattern[];
    climateSummary: string;
    recordsApproached: WeatherRecord[];
    seasonalAlignment: 'early' | 'normal' | 'late';
}
export interface WeatherPattern {
    name: string;
    frequency: number;
    lastOccurrence: string;
    predictedNext: string;
    impact: string;
    confidence: number;
}
export interface WeatherRecord {
    type: string;
    currentValue: number;
    recordValue: number;
    recordDate: string;
    percentageOfRecord: number;
    likelihood: 'unlikely' | 'possible' | 'likely' | 'very_likely';
}
export interface WeeklyForecast {
    week: number;
    startDate: string;
    endDate: string;
    summary: string;
    dominantWeather: string;
    tempRange: {
        min: number;
        max: number;
        avg: number;
    };
    precipitationTotal: number;
    precipitationDays: number;
    sunnyDays: number;
    petActivityScore: number;
    highlights: string[];
    warnings: string[];
}
export interface MonthlyOutlook {
    month: string;
    year: number;
    temperatureTrend: 'below_normal' | 'normal' | 'above_normal';
    precipitationTrend: 'below_normal' | 'normal' | 'above_normal';
    extremeEventProbability: number;
    seasonalEvents: string[];
    longRangeConfidence: number;
    agriculturalImpact: string;
    tourismSuitability: number;
    petCareConsiderations: string[];
}
export interface SeasonalForecast {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    startDate: string;
    endDate: string;
    characterization: string;
    temperatureAnomaly: number;
    precipitationAnomaly: number;
    majorWeatherSystems: string[];
    seasonalHazards: string[];
    petPreparation: string[];
    healthConsiderations: string[];
}
export interface EnhancedAirQuality {
    aqi: number;
    aqiUs: number;
    aqiEu: number;
    aqiChina: number;
    pm1: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
    nh3: number;
    no: number;
    nox: number;
    benzene: number;
    toluene: number;
    xylene: number;
    formaldehyde: number;
    bc: number;
    category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
    dominantPollutant: string;
    healthImplications: HealthImplication[];
    sources: PollutionSource[];
    forecast: AirQualityForecast[];
    historicalComparison: string;
    petSpecificRisks: string[];
}
export interface HealthImplication {
    group: 'general' | 'children' | 'elderly' | 'respiratory' | 'cardiac' | 'pets';
    risk: string;
    recommendations: string[];
}
export interface PollutionSource {
    type: string;
    contribution: number;
    distance: number;
    direction: string;
}
export interface AirQualityForecast {
    time: string;
    aqi: number;
    trend: 'improving' | 'stable' | 'deteriorating';
    advisories: string[];
}
export interface EnhancedDailyForecast {
    date: string;
    dayOfWeek: string;
    tempMin: number;
    tempMax: number;
    tempAvg: number;
    tempMorn: number;
    tempDay: number;
    tempEve: number;
    tempNight: number;
    feelsLikeMorn: number;
    feelsLikeDay: number;
    feelsLikeEve: number;
    feelsLikeNight: number;
    condition: string;
    conditionCode: string;
    description: string;
    precipitation: number;
    precipitationProbability: number;
    precipitationType: string;
    snowAccumulation?: number;
    windSpeed: number;
    windGust: number;
    windDirection: number;
    humidity: number;
    pressure: number;
    cloudCover: number;
    visibility: number;
    uvIndex: number;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moonPhase: string;
    icon: string;
    animatedIcon: string;
    petWalkability: number;
    bestWalkTimes: string[];
    outdoorSafetyScore: number;
    groomingNeeds: string;
    morningActivity: string;
    afternoonActivity: string;
    eveningActivity: string;
    alerts: string[];
    petAlerts: string[];
    solarGeneration?: number;
    energyEfficiency: number;
    productivityIndex: number;
    pollenCount?: number;
    allergyRisk: string;
    arthritisIndex: number;
    migraineRisk: number;
    forecastConfidence: number;
    dataQuality: number;
}
export interface AlertThreshold {
    parameter: string;
    minValue?: number;
    maxValue?: number;
    action: 'notify' | 'alert' | 'emergency';
    cooldownMinutes: number;
    enabled: boolean;
    customMessage?: string;
}
export interface WearableDevice {
    id: string;
    type: 'collar' | 'tracker' | 'camera' | 'health_monitor';
    brand: string;
    model: string;
    batteryLevel: number;
    lastSync: string;
    metrics: DeviceMetric[];
    alerts: DeviceAlert[];
    connected: boolean;
}
export interface DeviceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    normal: boolean;
}
export interface DeviceAlert {
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    acknowledged: boolean;
}
//# sourceMappingURL=weather.d.ts.map