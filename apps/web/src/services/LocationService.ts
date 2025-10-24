/**
 * Real Location Service
 * Handles actual location tracking, geocoding, and location-based features
 */
import { logger } from './logger';
class LocationService {
    watchId = null;
    currentLocation = null;
    subscribers = new Set();
    settings = {
        trackingEnabled: false,
        updateInterval: 30000, // 30 seconds
        accuracyThreshold: 100, // 100 meters
        backgroundTracking: false,
    };
    /**
     * Initialize location service
     */
    async initialize() {
        if (!navigator.geolocation) {
            logger.error('Geolocation is not supported by this browser');
            return false;
        }
        try {
            // Get initial location
            const location = await this.getCurrentLocation();
            if (location) {
                this.currentLocation = location;
                logger.info('Location service initialized', { location });
                return true;
            }
        }
        catch (error) {
            logger.error('Failed to initialize location service', error);
        }
        return false;
    }
    /**
     * Get current location
     */
    async getCurrentLocation() {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now(),
                };
                // Reverse geocode to get address
                try {
                    const address = await this.reverseGeocode(location.latitude, location.longitude);
                    location.address = address.address;
                    location.city = address.city;
                    location.country = address.country;
                }
                catch (error) {
                    logger.warn('Reverse geocoding failed', error);
                }
                this.currentLocation = location;
                resolve(location);
            }, (error) => {
                logger.error('Failed to get current location', error);
                resolve(null);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            });
        });
    }
    /**
     * Start location tracking
     */
    startTracking(settings) {
        if (this.watchId) {
            logger.warn('Location tracking already started');
            return;
        }
        this.settings = { ...this.settings, ...settings };
        if (!this.settings.trackingEnabled) {
            logger.info('Location tracking disabled in settings');
            return;
        }
        this.watchId = navigator.geolocation.watchPosition(async (position) => {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now(),
            };
            // Check accuracy threshold
            if (position.coords.accuracy &&
                position.coords.accuracy > this.settings.accuracyThreshold) {
                logger.warn('Location accuracy below threshold', {
                    accuracy: position.coords.accuracy,
                    threshold: this.settings.accuracyThreshold,
                });
                return;
            }
            // Reverse geocode
            try {
                const address = await this.reverseGeocode(location.latitude, location.longitude);
                location.address = address.address;
                location.city = address.city;
                location.country = address.country;
            }
            catch (error) {
                logger.warn('Reverse geocoding failed', error);
            }
            this.currentLocation = location;
            this.notifySubscribers(location);
        }, (error) => {
            logger.error('Location tracking error', error);
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: this.settings.updateInterval,
        });
        logger.info('Location tracking started', this.settings);
    }
    /**
     * Stop location tracking
     */
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            logger.info('Location tracking stopped');
        }
    }
    /**
     * Subscribe to location updates
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }
    /**
     * Notify all subscribers of location update
     */
    notifySubscribers(location) {
        this.subscribers.forEach((callback) => {
            try {
                callback(location);
            }
            catch (error) {
                logger.error('Error in location subscriber', error);
            }
        });
    }
    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(lat, lng) {
        try {
            // Use a real geocoding service (Google Maps, Mapbox, etc.)
            // For now, we'll use a mock implementation
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            if (!response.ok) {
                throw new Error('Geocoding API failed');
            }
            const data = await response.json();
            return {
                address: data.locality || 'Unknown Address',
                city: data.city || data.locality || 'Unknown City',
                country: data.countryName || 'Unknown Country',
            };
        }
        catch (error) {
            logger.error('Reverse geocoding failed', error);
            return {
                address: 'Unknown Address',
                city: 'Unknown City',
                country: 'Unknown Country',
            };
        }
    }
    /**
     * Get nearby pets based on location
     */
    async getNearbyPets(location, radius = 5) {
        try {
            const response = await fetch('/api/pets/nearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radius: radius * 1000, // Convert to meters
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to fetch nearby pets');
            }
            const data = await response.json();
            return data.pets || [];
        }
        catch (error) {
            logger.error('Failed to get nearby pets', error);
            return [];
        }
    }
    /**
     * Calculate distance between two points
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Get current location data
     */
    getCurrentLocationData() {
        return this.currentLocation;
    }
    /**
     * Update settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        // Restart tracking if settings changed
        if (this.watchId) {
            this.stopTracking();
            this.startTracking();
        }
    }
    /**
     * Get settings
     */
    getSettings() {
        return { ...this.settings };
    }
}
// Export singleton instance
export const locationService = new LocationService();
export default locationService;
//# sourceMappingURL=LocationService.js.map