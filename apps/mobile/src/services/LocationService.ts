/**
 * Location Service for PawfectMatch Mobile
 * Handles location permissions, tracking, and history
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import { api } from './api';

const LOCATION_TASK_NAME = 'LOCATION_TASK';
const LOCATION_HISTORY_KEY = 'location_history';
const MAX_HISTORY_ENTRIES = 1000;

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  foreground: 'granted' | 'denied' | 'undetermined';
  background: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export interface LocationTrackingConfig {
  accuracy: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
  enableBackground?: boolean;
}

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentLocation: LocationData | null = null;
  private subscribers: Set<(location: LocationData) => void> = new Set();
  private trackingConfig: LocationTrackingConfig = {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 30000, // 30 seconds
    distanceInterval: 10, // 10 meters
    enableBackground: false,
  };
  private isTracking = false;

  /**
   * Check location permission status
   */
  async getPermissionStatus(): Promise<LocationPermissionStatus> {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();

      return {
        granted: foreground.granted || false,
        foreground: foreground.granted ? 'granted' : foreground.canAskAgain ? 'undetermined' : 'denied',
        background: background.granted ? 'granted' : background.canAskAgain ? 'undetermined' : 'denied',
        canAskAgain: foreground.canAskAgain || false,
      };
    } catch (error) {
      logger.error('Failed to get location permission status', { error });
      return {
        granted: false,
        foreground: 'undetermined',
        background: 'undetermined',
        canAskAgain: false,
      };
    }
  }

  /**
   * Request foreground location permission
   */
  async requestForegroundPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        logger.info('Foreground location permission granted');
        return true;
      }

      if (status === 'denied') {
        Alert.alert(
          'Location Permission Required',
          'PawfectMatch needs location access to find nearby pets. Please enable location access in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }

      return false;
    } catch (error) {
      logger.error('Failed to request foreground location permission', { error });
      return false;
    }
  }

  /**
   * Request background location permission
   * 
   * NOTE: Background location is NOT currently used by the app.
   * The ACCESS_BACKGROUND_LOCATION permission has been removed from app.config.cjs
   * because the app only uses foreground location (enableBackground: false by default).
   * 
   * This method is kept for future use, but should NOT be called unless:
   * 1. ACCESS_BACKGROUND_LOCATION permission is re-added to app.config.cjs
   * 2. Strong justification is provided for Play Store review
   * 3. Foreground disclosure is implemented (Android requirement)
   */
  async requestBackgroundPermission(): Promise<boolean> {
    try {
      // First ensure foreground permission is granted
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      if (!foregroundStatus.granted) {
        const granted = await this.requestForegroundPermission();
        if (!granted) return false;
      }

      const { status } = await Location.requestBackgroundPermissionsAsync();

      if (status === 'granted') {
        logger.info('Background location permission granted');
        return true;
      }

      Alert.alert(
        'Background Location Required',
        'To track your pet activities when the app is closed, please enable "Always Allow" location access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ],
      );

      return false;
    } catch (error) {
      logger.error('Failed to request background location permission', { error });
      return false;
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const permissionStatus = await this.getPermissionStatus();
      if (!permissionStatus.granted) {
        const granted = await this.requestForegroundPermission();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      await this.saveLocationToHistory(locationData);
      this.notifySubscribers(locationData);

      return locationData;
    } catch (error) {
      logger.error('Failed to get current location', { error });
      return null;
    }
  }

  /**
   * Start location tracking
   */
  async startTracking(config?: Partial<LocationTrackingConfig>): Promise<boolean> {
    if (this.isTracking) {
      logger.warn('Location tracking already started');
      return true;
    }

    try {
      const permissionStatus = await this.getPermissionStatus();
      if (!permissionStatus.granted) {
        const granted = await this.requestForegroundPermission();
        if (!granted) return false;
      }

      const finalConfig = { ...this.trackingConfig, ...config };
      this.trackingConfig = finalConfig;

      // Start foreground tracking
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: finalConfig.accuracy,
          timeInterval: finalConfig.timeInterval,
          distanceInterval: finalConfig.distanceInterval,
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;
          await this.saveLocationToHistory(locationData);
          this.notifySubscribers(locationData);
        },
      );

      // Start background tracking if enabled
      if (finalConfig.enableBackground) {
        const backgroundGranted = await this.requestBackgroundPermission();
        if (backgroundGranted) {
          await this.startBackgroundTracking(finalConfig);
        }
      }

      this.isTracking = true;
      logger.info('Location tracking started', { config: finalConfig });

      return true;
    } catch (error) {
      logger.error('Failed to start location tracking', { error });
      return false;
    }
  }

  /**
   * Start background location tracking
   */
  private async startBackgroundTracking(config: LocationTrackingConfig): Promise<void> {
    try {
      // Define background task
      if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
        TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
          if (error) {
            logger.error('Background location task error', { error });
            return;
          }

          if (data) {
            const { locations } = data as { locations: Location.LocationObject[] };
            locations.forEach(async (location) => {
              const locationData: LocationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy ?? undefined,
                timestamp: location.timestamp,
              };

              await this.saveLocationToHistory(locationData);
              
              // Sync with backend if online
              await this.syncLocationToBackend(locationData).catch(() => {
                // Silently fail - will retry later
              });
            });
          }
        });
      }

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: config.accuracy,
        timeInterval: config.timeInterval,
        distanceInterval: config.distanceInterval,
        foregroundService: {
          notificationTitle: 'Tracking Pet Activity',
          notificationBody: 'PawfectMatch is tracking your location to show nearby pets',
          notificationColor: '#EC4899',
        },
      });

      logger.info('Background location tracking started');
    } catch (error) {
      logger.error('Failed to start background location tracking', { error });
      throw error;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) return;

    try {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      // Stop background tracking
      const isTaskDefined = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isTaskDefined) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      this.isTracking = false;
      logger.info('Location tracking stopped');
    } catch (error) {
      logger.error('Failed to stop location tracking', { error });
    }
  }

  /**
   * Subscribe to location updates
   */
  subscribe(callback: (location: LocationData) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately notify with current location if available
    if (this.currentLocation) {
      callback(this.currentLocation);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(location: LocationData): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(location);
      } catch (error) {
        logger.error('Error in location subscriber callback', { error });
      }
    });
  }

  /**
   * Get current location (cached)
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Save location to local history
   */
  private async saveLocationToHistory(location: LocationData): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      let history: LocationData[] = historyJson ? JSON.parse(historyJson) : [];

      // Add new location
      history.push(location);

      // Keep only last N entries
      if (history.length > MAX_HISTORY_ENTRIES) {
        history = history.slice(-MAX_HISTORY_ENTRIES);
      }

      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      logger.error('Failed to save location to history', { error });
    }
  }

  /**
   * Get location history
   */
  async getLocationHistory(limit?: number): Promise<LocationData[]> {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      const history: LocationData[] = historyJson ? JSON.parse(historyJson) : [];

      if (limit) {
        return history.slice(-limit);
      }

      return history;
    } catch (error) {
      logger.error('Failed to get location history', { error });
      return [];
    }
  }

  /**
   * Clear location history
   */
  async clearLocationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_HISTORY_KEY);
      logger.info('Location history cleared');
    } catch (error) {
      logger.error('Failed to clear location history', { error });
    }
  }

  /**
   * Sync location to backend
   */
  private async syncLocationToBackend(location: LocationData): Promise<void> {
    try {
      await api.post('/api/location/history', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: new Date(location.timestamp).toISOString(),
      });
    } catch (error) {
      logger.error('Failed to sync location to backend', { error });
      throw error;
    }
  }

  /**
   * Get location trail for pet activity
   */
  async getActivityTrail(startTime: number, endTime: number): Promise<LocationData[]> {
    const history = await this.getLocationHistory();
    return history.filter(
      (location) => location.timestamp >= startTime && location.timestamp <= endTime,
    );
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;

