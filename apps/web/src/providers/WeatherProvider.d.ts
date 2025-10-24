export declare const useWeather: () => {
    weather: null;
    loading: boolean;
    error: null;
    refreshWeather: () => Promise<void>;
    getWeatherForLocation: () => Promise<void>;
};
export declare const WeatherProvider: ({ children }: {
    children: any;
}) => JSX.Element;
//# sourceMappingURL=WeatherProvider.d.ts.map