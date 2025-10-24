/**
 * Real Location Service
 * Handles actual location tracking, geocoding, and location-based features
 */
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
    address?: string;
    city?: string;
    country?: string;
}
export interface LocationSettings {
    trackingEnabled: boolean;
    updateInterval: number;
    accuracyThreshold: number;
    backgroundTracking: boolean;
}
declare class LocationService {
    private watchId;
    private currentLocation;
    private subscribers;
    private settings;
    /**
     * Initialize location service
     */
    initialize(): Promise<boolean>;
    /**
     * Get current location
     */
    getCurrentLocation(): Promise<LocationData | null>;
    /**
     * Start location tracking
     */
    startTracking(settings?: Partial<LocationSettings>): void;
    /**
     * Stop location tracking
     */
    stopTracking(): void;
    /**
     * Subscribe to location updates
     */
    subscribe(callback: (location: LocationData) => void): () => void;
    /**
     * Notify all subscribers of location update
     */
    private notifySubscribers;
    /**
     * Reverse geocode coordinates to address
     */
    private reverseGeocode;
    /**
     * Get nearby pets based on location
     */
    getNearbyPets(location: LocationData, radius?: number): Promise<unknown[]>;
    /**
     * Calculate distance between two points
     */
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
    private toRadians;
    /**
     * Get current location data
     */
    getCurrentLocationData(): LocationData | null;
    /**
     * Update settings
     */
    updateSettings(settings: Partial<LocationSettings>): void;
    /**
     * Get settings
     */
    getSettings(): LocationSettings;
}
export declare const locationService: LocationService;
export default locationService;
//# sourceMappingURL=LocationService.d.ts.map