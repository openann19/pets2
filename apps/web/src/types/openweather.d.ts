/**
 * OpenWeather API response types
 * Used for type-safe weather data mapping
 */
export interface OpenWeatherWeatherCondition {
    id: number;
    main: string;
    description: string;
    icon: string;
}
export interface OpenWeatherMainData {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
}
export interface OpenWeatherWindData {
    speed: number;
    deg: number;
    gust?: number;
}
export interface OpenWeatherCloudsData {
    all: number;
}
export interface OpenWeatherRainData {
    '1h'?: number;
    '3h'?: number;
}
export interface OpenWeatherSnowData {
    '1h'?: number;
    '3h'?: number;
}
export interface OpenWeatherSysData {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
}
export interface OpenWeatherCurrentResponse {
    coord: {
        lon: number;
        lat: number;
    };
    weather: OpenWeatherWeatherCondition[];
    base: string;
    main: OpenWeatherMainData;
    visibility: number;
    wind: OpenWeatherWindData;
    clouds: OpenWeatherCloudsData;
    rain?: OpenWeatherRainData;
    snow?: OpenWeatherSnowData;
    dt: number;
    sys: OpenWeatherSysData;
    timezone: number;
    id: number;
    name: string;
    cod: number;
}
export interface OpenWeatherForecastResponse {
    cod: string;
    message: number;
    cnt: number;
    list: OpenWeatherForecastItem[];
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}
export interface OpenWeatherForecastItem {
    dt: number;
    main: OpenWeatherMainData;
    weather: OpenWeatherWeatherCondition[];
    clouds: OpenWeatherCloudsData;
    wind: OpenWeatherWindData;
    visibility: number;
    pop: number;
    rain?: OpenWeatherRainData;
    snow?: OpenWeatherSnowData;
    sys: {
        pod: string;
    };
    dt_txt: string;
}
export interface OpenWeatherHourlyData {
    dt: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number;
    visibility: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: OpenWeatherWeatherCondition[];
    pop: number;
    rain?: OpenWeatherRainData;
    snow?: OpenWeatherSnowData;
}
export interface OpenWeatherDailyData {
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;
    temp: {
        day: number;
        min: number;
        max: number;
        night: number;
        eve: number;
        morn: number;
    };
    feels_like: {
        day: number;
        night: number;
        eve: number;
        morn: number;
    };
    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    weather: OpenWeatherWeatherCondition[];
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
    uvi: number;
}
export interface OpenWeatherAlertData {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
}
export interface OpenWeatherOneCallResponse {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: {
        dt: number;
        sunrise: number;
        sunset: number;
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        dew_point: number;
        uvi: number;
        clouds: number;
        visibility: number;
        wind_speed: number;
        wind_deg: number;
        wind_gust?: number;
        weather: OpenWeatherWeatherCondition[];
        rain?: OpenWeatherRainData;
        snow?: OpenWeatherSnowData;
    };
    hourly?: OpenWeatherHourlyData[];
    daily?: OpenWeatherDailyData[];
    alerts?: OpenWeatherAlertData[];
}
//# sourceMappingURL=openweather.d.ts.map