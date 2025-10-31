/**
 * Feed Geolocation Hook
 * Phase 3: Advanced Features
 * 
 * Location-based feed personalization with:
 * - Location-based prioritization
 * - Distance-based filtering
 * - Local match prioritization
 * - Location updates
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { logger } from '@pawfectmatch/core';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: number;
}

export interface LocationPreferences {
  /** Enable location-based features */
  enabled: boolean;
  /** Maximum distance in kilometers */
  maxDistance: number;
  /** Prioritize local matches */
  prioritizeLocal: boolean;
  /** Update location on app foreground */
  updateOnForeground: boolean;
  /** Location update interval (milliseconds) */
  updateInterval?: number;
}

export interface UseFeedGeolocationOptions {
  /** Location preferences */
  preferences?: Partial<LocationPreferences>;
  /** Callback when location updates */
  onLocationUpdate?: (location: UserLocation) => void;
  /** Callback when location error occurs */
  onLocationError?: (error: Error) => void;
}

export interface UseFeedGeolocationReturn {
  /** Current user location */
  location: UserLocation | null;
  /** Whether location is being tracked */
  isTracking: boolean;
  /** Location permission status */
  permissionStatus: Location.PermissionStatus | null;
  /** Error if location access fails */
  error: Error | null;
  /** Start tracking location */
  startTracking: () => Promise<void>;
  /** Stop tracking location */
  stopTracking: () => void;
  /** Request location permission */
  requestPermission: () => Promise<boolean>;
  /** Get distance between two coordinates (in km) */
  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  /** Check if pet is within max distance */
  isWithinRange: (petLat: number, petLon: number) => boolean;
  /** Sort pets by distance (closest first) */
  sortByDistance: <T extends { location?: { latitude?: number; longitude?: number } }>(
    pets: T[],
  ) => T[];
}

const DEFAULT_PREFERENCES: LocationPreferences = {
  enabled: true,
  maxDistance: 50, // kilometers
  prioritizeLocal: true,
  updateOnForeground: true,
  updateInterval: 5 * 60 * 1000, // 5 minutes
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Feed Geolocation Hook
 * 
 * Manages location-based feed features
 */
export function useFeedGeolocation(
  options: UseFeedGeolocationOptions = {},
): UseFeedGeolocationReturn {
  const {
    preferences: userPreferences,
    onLocationUpdate,
    onLocationError,
  } = options;

  const preferences: LocationPreferences = {
    ...DEFAULT_PREFERENCES,
    ...userPreferences,
  };

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status !== 'granted') {
        const err = new Error('Location permission denied');
        setError(err);
        onLocationError?.(err);
        return false;
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onLocationError?.(error);
      return false;
    }
  }, [onLocationError]);

  /**
   * Update location
   */
  const updateLocation = useCallback(async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation: UserLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy || undefined,
        altitude: currentLocation.coords.altitude || undefined,
        timestamp: Date.now(),
      };

      setLocation(userLocation);
      setError(null);
      onLocationUpdate?.(userLocation);

      logger.debug('Location updated', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onLocationError?.(error);
      logger.error('Failed to update location', { error });
    }
  }, [onLocationUpdate, onLocationError]);

  /**
   * Start tracking location
   */
  const startTracking = useCallback(async () => {
    if (isTracking) {
      logger.warn('Location tracking already active');
      return;
    }

    // Request permission
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      return;
    }

    // Get initial location
    await updateLocation();

    // Start watching location changes
    if (preferences.updateInterval) {
      trackingIntervalRef.current = setInterval(() => {
        void updateLocation();
      }, preferences.updateInterval);
    } else {
      // Use watchPositionAsync for continuous updates
      watchSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 100, // Update every 100 meters
        },
        (currentLocation) => {
          const userLocation: UserLocation = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || undefined,
            altitude: currentLocation.coords.altitude || undefined,
            timestamp: Date.now(),
          };

          setLocation(userLocation);
          onLocationUpdate?.(userLocation);
        },
      );
    }

    setIsTracking(true);
    logger.info('Location tracking started');
  }, [isTracking, requestPermission, updateLocation, preferences.updateInterval, onLocationUpdate]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }

    setIsTracking(false);
    logger.info('Location tracking stopped');
  }, []);

  /**
   * Get distance between two coordinates
   */
  const getDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      return calculateDistance(lat1, lon1, lat2, lon2);
    },
    [],
  );

  /**
   * Check if pet is within max distance
   */
  const isWithinRange = useCallback(
    (petLat: number, petLon: number): boolean => {
      if (!location) return false;
      const distance = getDistance(location.latitude, location.longitude, petLat, petLon);
      return distance <= preferences.maxDistance;
    },
    [location, getDistance, preferences.maxDistance],
  );

  /**
   * Sort pets by distance (closest first)
   */
  const sortByDistance = useCallback(
    <T extends { location?: { latitude?: number; longitude?: number } }>(pets: T[]): T[] => {
      if (!location) return pets;

      return [...pets].sort((a, b) => {
        const aLat = a.location?.latitude;
        const aLon = a.location?.longitude;
        const bLat = b.location?.latitude;
        const bLon = b.location?.longitude;

        if (!aLat || !aLon) return 1; // Pets without location go to end
        if (!bLat || !bLon) return -1;

        const distanceA = getDistance(location.latitude, location.longitude, aLat, aLon);
        const distanceB = getDistance(location.latitude, location.longitude, bLat, bLon);

        return distanceA - distanceB;
      });
    },
    [location, getDistance],
  );

  // Check permission status on mount
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    location,
    isTracking,
    permissionStatus,
    error,
    startTracking,
    stopTracking,
    requestPermission,
    getDistance,
    isWithinRange,
    sortByDistance,
  };
}

