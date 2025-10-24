'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { enhancedWeatherService } from '../services/WeatherService';
import { useAuthStore } from '@/lib/auth-store';
import { logger } from '../services/logger';

interface WeatherContextType {
  weather: unknown | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  getWeatherForLocation: (lat: number, lon: number) => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType>({
    weather: null,
    loading: false,
    error: null,
    refreshWeather: async () => { },
    getWeatherForLocation: async () => { },
});

export const useWeather = () => useContext(WeatherContext);

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider = ({ children }: WeatherProviderProps) => {
    const [weather, setWeather] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const getWeatherForLocation = useCallback(async (lat: number, lon: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await enhancedWeatherService.getCurrentWeather(lat, lon);
            if (data) {
                setWeather(data);
                logger.info('Weather updated', { location: data.location });
            }
            else {
                setError('Unable to fetch weather data');
            }
        }
        catch (err) {
            logger.error('Weather fetch error', err instanceof Error ? err : new Error('Unknown error'));
            setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const refreshWeather = useCallback(async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                getWeatherForLocation(position.coords.latitude, position.coords.longitude);
            }, (error) => {
                logger.error('Geolocation error', error);
                // Fallback to user's profile location or default
                if (user && user.location) {
                    const location = user.location;
                    getWeatherForLocation(location.latitude, location.longitude);
                }
                else {
                    // Default to San Francisco
                    getWeatherForLocation(37.7749, -122.4194);
                }
            });
        }
        else {
            // Fallback for browsers without geolocation
            if (user && user.location) {
                const location = user.location;
                getWeatherForLocation(location.latitude, location.longitude);
            }
            else {
                getWeatherForLocation(37.7749, -122.4194);
            }
        }
    }, [user, getWeatherForLocation]);
    // Fetch weather on mount and every 10 minutes
    useEffect(() => {
        refreshWeather();
        const interval = setInterval(refreshWeather, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshWeather]);
    return (<WeatherContext.Provider value={{ weather, loading, error, refreshWeather, getWeatherForLocation }}>
      {children}
    </WeatherContext.Provider>);
};
//# sourceMappingURL=WeatherProvider.jsx.map