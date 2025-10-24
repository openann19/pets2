interface GeofenceZone {
    id: string;
    name: string;
    center: {
        lat: number;
        lng: number;
    };
    radius: number;
    type: 'safe' | 'popular' | 'restricted' | 'emergency';
    notifications: boolean;
    createdAt: string;
    userId: string;
}
interface GeofenceNotification {
    id: string;
    type: 'zone_enter' | 'zone_exit' | 'safety_alert' | 'match_nearby';
    title: string;
    message: string;
    zoneId?: string;
    location: {
        lat: number;
        lng: number;
    };
    timestamp: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
}
declare class GeofencingService {
    private zones;
    private watchId;
    private lastLocation;
    private callbacks;
    private notificationQueue;
    private isTracking;
    constructor();
    initialize(): Promise<boolean>;
    startTracking(): void;
    stopTracking(): void;
    private handleLocationUpdate;
    private isInsideZone;
    private calculateDistance;
    private toRadians;
    private handleZoneEntry;
    private handleZoneExit;
    private getZoneEntryMessage;
    private getZoneExitMessage;
    private triggerZoneActions;
    private checkNearbyMatches;
    private fetchNearbyMatches;
    private logEmergencyZoneEntry;
    addZone(zone: Omit<GeofenceZone, 'id' | 'createdAt'>): string;
    removeZone(zoneId: string): boolean;
    getZones(): GeofenceZone[];
    getZone(zoneId: string): GeofenceZone | undefined;
    private addNotification;
    private showBrowserNotification;
    getNotifications(): GeofenceNotification[];
    markNotificationRead(notificationId: string): void;
    clearNotifications(): void;
    subscribe(callbackId: string, callback: Function): void;
    unsubscribe(callbackId: string): void;
    private setupDefaultZones;
    private saveZones;
    private loadStoredZones;
    getCurrentLocation(): Promise<{
        lat: number;
        lng: number;
    } | null>;
    getCurrentZones(): GeofenceZone[];
    getDistanceToNearestZone(): {
        zone: GeofenceZone;
        distance: number;
    } | null;
    destroy(): void;
}
export declare const geofencingService: GeofencingService;
export default GeofencingService;
//# sourceMappingURL=GeofencingService.d.ts.map