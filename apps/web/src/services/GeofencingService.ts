import { logger } from '@pawfectmatch/core';

class GeofencingService {
    zones = new Map();
    watchId = null;
    lastLocation = null;
    callbacks = new Map();
    notificationQueue = [];
    isTracking = false;
    constructor() {
        this.loadStoredZones();
        this.setupDefaultZones();
    }
    // Initialize geofencing with user permission
    async initialize() {
        if (!navigator.geolocation) {
            logger.warn('Geolocation not supported', {
                component: 'GeofencingService',
                action: 'initialize'
            });
            return false;
        }
        try {
            // Request permission
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            if (permission.state === 'denied') {
                logger.warn('Geolocation permission denied', {
                    component: 'GeofencingService',
                    action: 'initialize'
                });
                return false;
            }
            // Start tracking
            this.startTracking();
            return true;
        }
        catch (error) {
            logger.error('Failed to initialize geofencing', error, {
                component: 'GeofencingService',
                action: 'initialize'
            });
            return false;
        }
    }
    // Start location tracking
    startTracking() {
        if (this.isTracking)
            return;
        this.watchId = navigator.geolocation.watchPosition((position) => {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            this.handleLocationUpdate(location, position.coords.accuracy);
        }, (error) => {
            // Handle geolocation errors with structured logging
            if (error.code === error.PERMISSION_DENIED) {
                logger.warn('Geolocation: Permission denied by user', {
                    component: 'GeofencingService',
                    action: 'startTracking',
                    metadata: { errorCode: error.code }
                });
            }
            else if (error.code === error.POSITION_UNAVAILABLE) {
                logger.warn('Geolocation: Position unavailable', {
                    component: 'GeofencingService',
                    action: 'startTracking',
                    metadata: { errorCode: error.code }
                });
            }
            else if (error.code === error.TIMEOUT) {
                logger.warn('Geolocation: Request timeout', {
                    component: 'GeofencingService',
                    action: 'startTracking',
                    metadata: { errorCode: error.code }
                });
            }
            // Fallback to default location
            const defaultLocation = {
                lat: 40.7128,
                lng: -74.0060
            };
            this.handleLocationUpdate(defaultLocation, 0);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        });
        this.isTracking = true;
        logger.info('Geofencing tracking started', {
            component: 'GeofencingService',
            action: 'startTracking'
        });
    }
    // Stop location tracking
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        logger.info('Geofencing tracking stopped', {
            component: 'GeofencingService',
            action: 'stopTracking'
        });
    }
    // Handle location updates
    handleLocationUpdate(location, accuracy) {
        const previousLocation = this.lastLocation;
        this.lastLocation = location;
        // Check all zones for entry/exit events
        this.zones.forEach((zone) => {
            const wasInside = previousLocation ? this.isInsideZone(previousLocation, zone) : false;
            const isInside = this.isInsideZone(location, zone);
            if (!wasInside && isInside) {
                // Entered zone
                this.handleZoneEntry(zone, location);
            }
            else if (wasInside && !isInside) {
                // Exited zone
                this.handleZoneExit(zone, location);
            }
        });
        // Trigger location update callbacks
        this.callbacks.forEach((callback) => {
            callback({ location, accuracy, zones: Array.from(this.zones.values()) });
        });
    }
    // Check if location is inside a zone
    isInsideZone(location, zone) {
        const distance = this.calculateDistance(location.lat, location.lng, zone.center.lat, zone.center.lng);
        return distance <= zone.radius;
    }
    // Calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    // Handle zone entry
    handleZoneEntry(zone, location) {
        logger.info(`Entered zone: ${zone.name}`, {
            component: 'GeofencingService',
            action: 'handleZoneEntry',
            metadata: { zoneId: zone.id, zoneName: zone.name, location }
        });
        if (zone.notifications) {
            const notification = {
                id: `entry-${zone.id}-${Date.now()}`,
                type: 'zone_enter',
                title: `Entered ${zone.name}`,
                message: this.getZoneEntryMessage(zone),
                zoneId: zone.id,
                location,
                timestamp: new Date().toISOString(),
                read: false,
                priority: zone.type === 'emergency' ? 'high' : 'medium'
            };
            this.addNotification(notification);
        }
        // Trigger zone-specific actions
        this.triggerZoneActions(zone, 'enter', location);
    }
    // Handle zone exit
    handleZoneExit(zone, location) {
        logger.info(`Exited zone: ${zone.name}`, {
            component: 'GeofencingService',
            action: 'handleZoneExit',
            metadata: { zoneId: zone.id, zoneName: zone.name, location }
        });
        if (zone.notifications) {
            const notification = {
                id: `exit-${zone.id}-${Date.now()}`,
                type: 'zone_exit',
                title: `Left ${zone.name}`,
                message: this.getZoneExitMessage(zone),
                zoneId: zone.id,
                location,
                timestamp: new Date().toISOString(),
                read: false,
                priority: 'low'
            };
            this.addNotification(notification);
        }
        this.triggerZoneActions(zone, 'exit', location);
    }
    // Get zone entry message
    getZoneEntryMessage(zone) {
        const messages = {
            safe: 'You\'re in a safe area for pets. Enjoy your time here!',
            popular: 'This is a popular spot for pet activities. Look out for potential matches!',
            restricted: 'Please be aware of local restrictions in this area.',
            emergency: 'Emergency services are nearby if needed.'
        };
        return messages[zone.type] || 'You\'ve entered a marked area.';
    }
    // Get zone exit message
    getZoneExitMessage(zone) {
        const messages = {
            safe: 'You\'ve left the safe zone. Stay alert!',
            popular: 'Thanks for visiting this popular pet area!',
            restricted: 'You\'ve left the restricted area.',
            emergency: 'You\'ve left the emergency services area.'
        };
        return messages[zone.type] || 'You\'ve left the marked area.';
    }
    // Trigger zone-specific actions
    triggerZoneActions(zone, action, location) {
        // Emit events for other services to handle
        window.dispatchEvent(new CustomEvent('geofence-event', {
            detail: { zone, action, location }
        }));
        // Zone-specific logic
        if (zone.type === 'popular' && action === 'enter') {
            // Check for nearby matches
            this.checkNearbyMatches(location);
        }
        if (zone.type === 'emergency' && action === 'enter') {
            // Log emergency zone entry for safety
            this.logEmergencyZoneEntry(zone, location);
        }
    }
    // Check for nearby matches
    async checkNearbyMatches(location) {
        try {
            // Simulate API call to check nearby matches
            const nearbyMatches = await this.fetchNearbyMatches(location);
            if (nearbyMatches.length > 0) {
                const notification = {
                    id: `matches-${Date.now()}`,
                    type: 'match_nearby',
                    title: 'Potential Matches Nearby!',
                    message: `${nearbyMatches.length} compatible pets are in this area.`,
                    location,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'high'
                };
                this.addNotification(notification);
            }
        }
        catch (error) {
            logger.error('Failed to check nearby matches', error, {
                component: 'GeofencingService',
                action: 'checkNearbyMatches',
                metadata: { location }
            });
        }
    }
    // Simulate fetching nearby matches
    async fetchNearbyMatches(location) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Return mock data
        return Math.random() > 0.7 ? [
            { id: '1', name: 'Buddy', distance: 150 },
            { id: '2', name: 'Luna', distance: 230 }
        ] : [];
    }
    // Log emergency zone entry
    logEmergencyZoneEntry(zone, location) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            zoneId: zone.id,
            zoneName: zone.name,
            location,
            type: 'emergency_zone_entry'
        };
        // Store in local storage for safety
        const logs = JSON.parse(localStorage.getItem('emergency_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('emergency_logs', JSON.stringify(logs.slice(-50))); // Keep last 50 entries
    }
    // Add a new geofence zone
    addZone(zone) {
        const id = `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newZone = {
            ...zone,
            id,
            createdAt: new Date().toISOString()
        };
        this.zones.set(id, newZone);
        this.saveZones();
        logger.info(`Added geofence zone: ${zone.name}`, {
            component: 'GeofencingService',
            action: 'addZone',
            metadata: { zoneId: id, zoneName: zone.name }
        });
        return id;
    }
    // Remove a geofence zone
    removeZone(zoneId) {
        const removed = this.zones.delete(zoneId);
        if (removed) {
            this.saveZones();
            logger.info(`Removed geofence zone: ${zoneId}`, {
                component: 'GeofencingService',
                action: 'removeZone',
                metadata: { zoneId }
            });
        }
        return removed;
    }
    // Get all zones
    getZones() {
        return Array.from(this.zones.values());
    }
    // Get zone by ID
    getZone(zoneId) {
        return this.zones.get(zoneId);
    }
    // Add notification
    addNotification(notification) {
        this.notificationQueue.push(notification);
        // Show browser notification if permitted
        this.showBrowserNotification(notification);
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('geofence-notification', {
            detail: notification
        }));
    }
    // Show browser notification
    async showBrowserNotification(notification) {
        if (!('Notification' in window))
            return;
        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        if (permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/icons/paw-icon.png',
                badge: '/icons/paw-badge.png',
                tag: notification.type,
                requireInteraction: notification.priority === 'high'
            });
        }
    }
    // Get notifications
    getNotifications() {
        return this.notificationQueue.slice().reverse(); // Most recent first
    }
    // Mark notification as read
    markNotificationRead(notificationId) {
        const notification = this.notificationQueue.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }
    // Clear all notifications
    clearNotifications() {
        this.notificationQueue = [];
    }
    // Subscribe to location updates
    subscribe(callbackId, callback) {
        this.callbacks.set(callbackId, callback);
    }
    // Unsubscribe from location updates
    unsubscribe(callbackId) {
        this.callbacks.delete(callbackId);
    }
    // Setup default zones (popular pet areas, emergency services, etc.)
    setupDefaultZones() {
        // Example default zones - these would typically come from a backend service
        const defaultZones = [
            {
                name: 'Central Park Dog Run',
                center: { lat: 40.7829, lng: -73.9654 },
                radius: 200,
                type: 'popular',
                notifications: true,
                userId: 'system'
            },
            {
                name: 'Emergency Vet Clinic',
                center: { lat: 40.7505, lng: -73.9934 },
                radius: 100,
                type: 'emergency',
                notifications: true,
                userId: 'system'
            }
        ];
        defaultZones.forEach(zone => {
            if (!Array.from(this.zones.values()).some(z => z.name === zone.name)) {
                this.addZone(zone);
            }
        });
    }
    // Save zones to localStorage
    saveZones() {
        const zonesArray = Array.from(this.zones.values());
        localStorage.setItem('geofence_zones', JSON.stringify(zonesArray));
    }
    // Load zones from localStorage
    loadStoredZones() {
        try {
            const stored = localStorage.getItem('geofence_zones');
            if (stored) {
                const zonesArray = JSON.parse(stored);
                zonesArray.forEach(zone => {
                    this.zones.set(zone.id, zone);
                });
                logger.info(`Loaded ${zonesArray.length} stored geofence zones`, {
                    component: 'GeofencingService',
                    action: 'loadStoredZones',
                    metadata: { zoneCount: zonesArray.length }
                });
            }
        }
        catch (error) {
            logger.error('Failed to load stored zones', error, {
                component: 'GeofencingService',
                action: 'loadStoredZones'
            });
        }
    }
    // Get current location
    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                logger.error('Failed to get current location', error, {
                    component: 'GeofencingService',
                    action: 'getCurrentLocation'
                });
                resolve(null);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }
    // Check if currently inside any zones
    getCurrentZones() {
        if (!this.lastLocation)
            return [];
        return Array.from(this.zones.values()).filter(zone => this.isInsideZone(this.lastLocation, zone));
    }
    // Get distance to nearest zone
    getDistanceToNearestZone() {
        if (!this.lastLocation || this.zones.size === 0)
            return null;
        let nearest = null;
        this.zones.forEach(zone => {
            const distance = this.calculateDistance(this.lastLocation.lat, this.lastLocation.lng, zone.center.lat, zone.center.lng);
            if (!nearest || distance < nearest.distance) {
                nearest = { zone, distance };
            }
        });
        return nearest;
    }
    // Cleanup
    destroy() {
        this.stopTracking();
        this.callbacks.clear();
        this.zones.clear();
        this.notificationQueue = [];
    }
}
// Export singleton instance
export const geofencingService = new GeofencingService();
export default GeofencingService;
//# sourceMappingURL=GeofencingService.js.map