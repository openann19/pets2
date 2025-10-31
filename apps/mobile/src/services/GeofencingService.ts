/**
 * Geofencing Service for PawfectMatch Mobile
 * Handles geofence zones and location-based notifications
 */
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import { locationService } from './LocationService';
import type { LocationData } from './LocationService';

const GEOFENCE_STORAGE_KEY = 'geofence_zones';

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'park' | 'vet' | 'groomer' | 'friend' | 'custom';
  enabled: boolean;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  createdAt: number;
}

export interface GeofenceNotification {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'entry' | 'exit';
  location: LocationData;
  timestamp: number;
  read: boolean;
}

class GeofencingService {
  private zones: Map<string, GeofenceZone> = new Map();
  private notifications: GeofenceNotification[] = [];
  private subscribers: Set<(notification: GeofenceNotification) => void> = new Set();
  private locationUnsubscribe: (() => void) | null = null;
  private lastKnownLocation: LocationData | null = null;

  /**
   * Initialize geofencing service
   */
  async initialize(): Promise<boolean> {
    try {
      // Load saved zones
      await this.loadZones();

      // Ensure location permission
      const permissionStatus = await locationService.getPermissionStatus();
      if (!permissionStatus.granted) {
        const granted = await locationService.requestForegroundPermission();
        if (!granted) {
          logger.warn('Geofencing requires location permission');
          return false;
        }
      }

      // Start location tracking
      await locationService.startTracking({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds
        distanceInterval: 50, // 50 meters
      });

      // Subscribe to location updates
      this.locationUnsubscribe = locationService.subscribe((location) => {
        this.handleLocationUpdate(location);
      });

      logger.info('Geofencing service initialized', { zoneCount: this.zones.size });

      return true;
    } catch (error) {
      logger.error('Failed to initialize geofencing service', { error });
      return false;
    }
  }

  /**
   * Add a geofence zone
   */
  async addZone(zone: Omit<GeofenceZone, 'id' | 'createdAt'>): Promise<string> {
    const zoneId = `geofence_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newZone: GeofenceZone = {
      ...zone,
      id: zoneId,
      createdAt: Date.now(),
    };

    this.zones.set(zoneId, newZone);
    await this.saveZones();

    logger.info('Geofence zone added', { zoneId, name: zone.name });
    return zoneId;
  }

  /**
   * Remove a geofence zone
   */
  async removeZone(zoneId: string): Promise<boolean> {
    const removed = this.zones.delete(zoneId);
    if (removed) {
      await this.saveZones();
      logger.info('Geofence zone removed', { zoneId });
    }
    return removed;
  }

  /**
   * Get all zones
   */
  getZones(): GeofenceZone[] {
    return Array.from(this.zones.values());
  }

  /**
   * Get enabled zones
   */
  getEnabledZones(): GeofenceZone[] {
    return Array.from(this.zones.values()).filter((zone) => zone.enabled);
  }

  /**
   * Update a zone
   */
  async updateZone(zoneId: string, updates: Partial<GeofenceZone>): Promise<boolean> {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const updatedZone = { ...zone, ...updates };
    this.zones.set(zoneId, updatedZone);
    await this.saveZones();

    logger.info('Geofence zone updated', { zoneId });
    return true;
  }

  /**
   * Handle location update
   */
  private handleLocationUpdate(location: LocationData): void {
    const previousLocation = this.lastKnownLocation;
    this.lastKnownLocation = location;

    if (!previousLocation) {
      // First location update - check all zones for entry
      this.checkZoneEntry(location);
      return;
    }

    // Check for zone entry/exit
    const previousZones = this.getZonesForLocation(previousLocation);
    const currentZones = this.getZonesForLocation(location);

    // Check for entries
    const enteredZones = currentZones.filter(
      (zone) => !previousZones.find((pz) => pz.id === zone.id) && zone.notifyOnEntry,
    );
    enteredZones.forEach((zone) => {
      this.handleZoneEntry(zone, location);
    });

    // Check for exits
    const exitedZones = previousZones.filter(
      (zone) => !currentZones.find((cz) => cz.id === zone.id) && zone.notifyOnExit,
    );
    exitedZones.forEach((zone) => {
      this.handleZoneExit(zone, location);
    });
  }

  /**
   * Get zones for a location
   */
  private getZonesForLocation(location: LocationData): GeofenceZone[] {
    const enabledZones = this.getEnabledZones();
    return enabledZones.filter((zone) => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude,
      );
      return distance <= zone.radius;
    });
  }

  /**
   * Check zone entry (for initial location)
   */
  private checkZoneEntry(location: LocationData): void {
    const zones = this.getZonesForLocation(location);
    zones.forEach((zone) => {
      if (zone.notifyOnEntry) {
        this.handleZoneEntry(zone, location);
      }
    });
  }

  /**
   * Handle zone entry
   */
  private async handleZoneEntry(zone: GeofenceZone, location: LocationData): Promise<void> {
    const notification: GeofenceNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      zoneId: zone.id,
      zoneName: zone.name,
      type: 'entry',
      location,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(notification);
    
    // Limit notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Notify subscribers
    this.notifySubscribers(notification);

    // Send push notification
    await this.sendPushNotification(notification);

    logger.info('Zone entry detected', { zoneId: zone.id, zoneName: zone.name });
  }

    /**
     * Handle zone exit
     */
    private async handleZoneExit(zone: GeofenceZone, location: LocationData): Promise<void> {
      const notification: GeofenceNotification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        zoneId: zone.id,
        zoneName: zone.name,
        type: 'exit',
        location,
        timestamp: Date.now(),
        read: false,
      };

      this.notifications.unshift(notification);
      
      // Limit notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }

      // Notify subscribers
      this.notifySubscribers(notification);

      // Send push notification
      await this.sendPushNotification(notification);

      logger.info('Zone exit detected', { zoneId: zone.id, zoneName: zone.name });
    }

    /**
     * Send push notification for geofence event
     */
    private async sendPushNotification(notification: GeofenceNotification): Promise<void> {
      try {
        const message = notification.type === 'entry' 
          ? `You entered ${notification.zoneName}`
          : `You left ${notification.zoneName}`;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Geofence Alert',
            body: message,
            sound: 'default',
            data: {
              type: 'geofence',
              notificationId: notification.id,
              zoneId: notification.zoneId,
            },
          },
        });
      } catch (error) {
        logger.error('Failed to send geofence push notification', { error });
      }
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371000; // Earth radius in meters
      const dLat = this.toRadians(lat2 - lat1);
      const dLon = this.toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(lat1)) *
          Math.cos(this.toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    /**
     * Convert degrees to radians
     */
    private toRadians(degrees: number): number {
      return degrees * (Math.PI / 180);
    }

    /**
     * Subscribe to geofence notifications
     */
    subscribe(callback: (notification: GeofenceNotification) => void): () => void {
      this.subscribers.add(callback);
      return () => {
        this.subscribers.delete(callback);
      };
    }

    /**
     * Notify all subscribers
     */
    private notifySubscribers(notification: GeofenceNotification): void {
      this.subscribers.forEach((callback) => {
        try {
          callback(notification);
        } catch (error) {
          logger.error('Error in geofence subscriber callback', { error });
        }
      });
    }

    /**
     * Get notifications
     */
    getNotifications(): GeofenceNotification[] {
      return this.notifications;
    }

    /**
     * Mark notification as read
     */
    markNotificationRead(notificationId: string): void {
      const notification = this.notifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }

    /**
     * Clear notifications
     */
    clearNotifications(): void {
      this.notifications = [];
    }

    /**
     * Save zones to storage
     */
    private async saveZones(): Promise<void> {
      try {
        const zonesArray = Array.from(this.zones.values());
        await AsyncStorage.setItem(GEOFENCE_STORAGE_KEY, JSON.stringify(zonesArray));
      } catch (error) {
        logger.error('Failed to save geofence zones', { error });
      }
    }

    /**
     * Load zones from storage
     */
    private async loadZones(): Promise<void> {
      try {
        const zonesJson = await AsyncStorage.getItem(GEOFENCE_STORAGE_KEY);
        if (zonesJson) {
          const zones: GeofenceZone[] = JSON.parse(zonesJson);
          zones.forEach((zone) => {
            this.zones.set(zone.id, zone);
          });
          logger.info('Geofence zones loaded', { count: zones.length });
        }
      } catch (error) {
        logger.error('Failed to load geofence zones', { error });
      }
    }

    /**
     * Stop geofencing
     */
    async stop(): Promise<void> {
      if (this.locationUnsubscribe) {
        this.locationUnsubscribe();
        this.locationUnsubscribe = null;
      }

      await locationService.stopTracking();
      logger.info('Geofencing service stopped');
    }

    /**
     * Destroy service
     */
    async destroy(): Promise<void> {
      await this.stop();
      this.zones.clear();
      this.notifications = [];
      this.subscribers.clear();
    }
  }

  // Export singleton instance
  export const geofencingService = new GeofencingService();
  export default geofencingService;

