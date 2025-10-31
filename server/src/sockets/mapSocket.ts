import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import logger from '../utils/logger';
import type {
  SocketIOServer,
  AuthenticatedSocket,
  JoinMapData,
  LeaveMapData,
  LocationUpdateData,
  RequestInitialPinsData,
  ActivityStartData,
  ActivityEndData,
  NearbyRequestData,
  MatchNotifyData,
  MapPin,
  UserSession,
  ActivityCount,
} from '../types/socket';

export default class MapSocketServer {
  private io: SocketIOServer;
  private activePins: Map<string, MapPin>;
  private userSessions: Map<string, UserSession>;
  private demoMode: boolean;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    this.activePins = new Map(); // Store active pet locations
    this.userSessions = new Map(); // Track connected users
    this.demoMode = process.env['MAP_DEMO_MODE'] === 'true'; // Enable demo pins only if configured
    this.setupSocketHandlers();
    
    if (this.demoMode) {
      logger.warn('Map demo mode is enabled - simulated pins will be generated');
      this.startLocationSimulation();
    }
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info('Map client connected', { socketId: socket.id });

      // Authenticate user (optional - can use join_map instead)
      socket.on('authenticate', async (_token: string) => {
        try {
          // Note: JWT verification can be added if needed
          // For now, authentication is handled via join_map with userId
          logger.warn('Authenticate event received but JWT verification not implemented');
          socket.emit('authenticated', { success: false, message: 'Use join_map instead' });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('Map socket authentication failed', { error: errorMessage });
          socket.emit('auth_error', { message: 'Invalid token' });
        }
      });

      // Handle join_map event (alternative to authenticate)
      socket.on('join_map', (data: JoinMapData) => {
        const { userId } = data;
        if (userId) {
          socket.userId = userId;
          this.userSessions.set(userId, {
            socketId: socket.id,
            lastSeen: new Date(),
            location: null
          });
          logger.info('User joined map', { userId });
        }
      });

      // Handle leave_map event
      socket.on('leave_map', (data: LeaveMapData) => {
        const { userId } = data;
        if (userId && this.userSessions.has(userId)) {
          this.userSessions.delete(userId);
          logger.info('User left map', { userId });
        }
      });

      // Handle location updates from users
      socket.on('location:update', (data: LocationUpdateData) => {
        if (!socket.userId) return;

        const { latitude, longitude, activity, message } = data;
        
        if (!latitude || !longitude) {
          logger.warn('Location update missing coordinates', { userId: socket.userId });
          return;
        }
        
        // Normalize activity to standard categories
        const activityCategories = ['walking', 'playing', 'feeding', 'resting', 'training', 'grooming', 'vet', 'park', 'other'];
        const normalizedActivity = activity && activityCategories.includes(activity.toLowerCase()) 
          ? activity.toLowerCase() 
          : 'other';
        
        const pin: MapPin = {
          _id: `${socket.userId}-${Date.now()}`,
          petId: data.petId || `pet-${socket.userId}`,
          ownerId: socket.userId,
          coordinates: [longitude, latitude] as [number, number],
          activity: normalizedActivity,
          activityCategory: normalizedActivity,
          message: message || null,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        this.activePins.set(pin._id, pin);
        
        // Broadcast to all connected clients
        this.io.emit('pin:update', pin);
        this.io.emit('pulse_update', pin); // backward compatibility
        
        logger.info('Location update', { userEmail: socket.userEmail, activity, latitude, longitude });
      });

      // Send initial pins when requested with filtering support
      socket.on('request:initial-pins', (data: RequestInitialPinsData = {}) => {
        const { location, radius, timeRange, activityTypes } = data;
        const now = new Date();
        let timeCutoff = new Date(0); // All time
        
        // Calculate time cutoff based on timeRange
        if (timeRange) {
          switch (timeRange) {
            case 'last_hour':
              timeCutoff = new Date(now.getTime() - 60 * 60 * 1000);
              break;
            case 'today':
              const todayStart = new Date();
              todayStart.setHours(0, 0, 0, 0);
              timeCutoff = todayStart;
              break;
            case 'this_week':
              const weekStart = new Date();
              weekStart.setDate(weekStart.getDate() - weekStart.getDay());
              weekStart.setHours(0, 0, 0, 0);
              timeCutoff = weekStart;
              break;
            case 'this_month':
              const monthStart = new Date();
              monthStart.setDate(1);
              monthStart.setHours(0, 0, 0, 0);
              timeCutoff = monthStart;
              break;
            case 'all':
            default:
              timeCutoff = new Date(0);
              break;
          }
        }
        
        // Filter pins
        let pins = Array.from(this.activePins.values())
          .filter(pin => {
            // Check expiration
            if (new Date(pin.expiresAt) <= now) return false;
            
            // Check time range
            if (timeRange && timeRange !== 'all') {
              const pinTime = new Date(pin.createdAt);
              if (pinTime < timeCutoff) return false;
            }
            
            // Check activity types
            if (activityTypes && Array.isArray(activityTypes) && activityTypes.length > 0) {
              if (!activityTypes.includes(pin.activity)) return false;
            }
            
            // Check radius if location provided
            if (location && radius) {
              const distance = this.calculateDistance(
                location.latitude,
                location.longitude,
                pin.coordinates[1],
                pin.coordinates[0]
              );
              if (distance > radius) return false;
            }
            
            return true;
          });
        
        // Sort by most recent and limit
        pins = pins
          .sort((a: MapPin, b: MapPin) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 100); // Increased limit for better UX

        socket.emit('pins:initial', pins);
        logger.info('Sent initial pins', { 
          socketId: socket.id, 
          count: pins.length,
          timeRange,
          activityTypes: activityTypes?.length || 0,
          radius: radius || 'none'
        });
      });

      // Handle pet activity updates
      socket.on('activity:start', (data: ActivityStartData) => {
        if (!socket.userId) return;

        const { petId, activity, location, message } = data;
        
        // Normalize activity to standard categories
        const activityCategories = ['walking', 'playing', 'feeding', 'resting', 'training', 'grooming', 'vet', 'park', 'other'];
        const normalizedActivity = activityCategories.includes(activity?.toLowerCase()) 
          ? activity.toLowerCase() 
          : 'other';
        
        const pin: MapPin = {
          _id: `activity-${petId || socket.userId}-${Date.now()}`,
          petId: petId || `pet-${socket.userId}`,
          ownerId: socket.userId,
          coordinates: [location.longitude, location.latitude] as [number, number],
          activity: normalizedActivity,
          activityCategory: normalizedActivity,
          message: message || `Started ${normalizedActivity}`,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        };

        this.activePins.set(pin._id, pin);
        this.io.emit('pin:update', pin);
        this.io.emit('pulse_update', pin); // backward compatibility
        
        logger.info('Activity started', { activity, petId });
      });

      socket.on('activity:end', (data: ActivityEndData) => {
        const pinId = data.pinId || data.activityId;
        
        if (pinId && this.activePins.has(pinId)) {
          this.activePins.delete(pinId);
          this.io.emit('pin:remove', pinId);
          logger.info('Activity ended', { pinId });
        } else {
          logger.warn('Activity end called without valid pinId or activityId', { data });
        }
      });

      // Handle nearby pet requests
      socket.on('nearby:request', (data: NearbyRequestData) => {
        const { latitude, longitude, radius = 5 } = data;
        
        const nearbyPins = Array.from(this.activePins.values())
          .filter(pin => {
            const distance = this.calculateDistance(
              latitude, longitude,
              pin.coordinates[1], pin.coordinates[0]
            );
            return distance <= radius && new Date(pin.expiresAt) > new Date();
          })
          .sort((a: MapPin, b: MapPin) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        socket.emit('nearby:response', nearbyPins);
        logger.info('Found nearby pets', { count: nearbyPins.length, radius });
      });

      // Handle match notifications on map
      socket.on('match:notify', (data: MatchNotifyData) => {
        const { matchId, targetUserId, location } = data;
        
        const targetSession = this.userSessions.get(targetUserId);
        if (targetSession) {
          this.io.to(targetSession.socketId).emit('match:map-notification', {
            matchId,
            location: location || undefined,
            message: 'You have a new match nearby!',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSessions.delete(socket.userId);
          
          // Remove user's pins after 5 minutes
          setTimeout(() => {
            const userPins = Array.from(this.activePins.entries())
              .filter(([, pin]: [string, MapPin]) => pin.ownerId === socket.userId);

            userPins.forEach(([pinId]: [string, MapPin]) => {
              this.activePins.delete(pinId);
              this.io.emit('pin:remove', pinId);
            });
          }, 5 * 60 * 1000);
        }
        
        logger.info('Map client disconnected', { socketId: socket.id });
      });
    });
  }

  startLocationSimulation() {
    if (!this.demoMode) return;
    
    logger.warn('Starting location simulation - DEMO MODE ONLY');
    
    setInterval(() => {
      if (this.userSessions.size === 0 && this.activePins.size > 0) {
        return;
      }

      const activities = ['walking', 'playing', 'feeding', 'resting', 'training', 'grooming', 'vet', 'park', 'other'];
      const messages = [
        'Having a great time!',
        'Beautiful weather today',
        'Made a new friend',
        'Feeling energetic',
        'Love this spot!',
        'Perfect day for a walk',
        'Playing with new friends',
        'Enjoying the sunshine'
      ];

      const numPins = Math.min(Math.floor(Math.random() * 2) + 1, 2);
      for (let i = 0; i < numPins; i++) {
        const activityIndex = Math.floor(Math.random() * activities.length);
        const activity = activities[activityIndex] || 'other';
        const message = Math.random() > 0.4 ? messages[Math.floor(Math.random() * messages.length)] : null;
        
        const baseLat = 40.7589 + (Math.random() - 0.5) * 0.1;
        const baseLng = -73.9851 + (Math.random() - 0.5) * 0.1;
        
        const pin: MapPin = {
          _id: `demo-${Date.now()}-${i}`,
          petId: `demo-pet-${Math.floor(Math.random() * 100)}`,
          ownerId: `demo-user-${Math.floor(Math.random() * 50)}`,
          coordinates: [baseLng, baseLat] as [number, number],
          activity,
          activityCategory: activity,
          message: message || null,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString()
        };

        this.activePins.set(pin._id, pin);
        this.io.emit('pin:update', pin);
        this.io.emit('pulse_update', pin);
      }

      const now = new Date();
      const expiredPins = Array.from(this.activePins.entries())
        .filter(([, pin]: [string, MapPin]) => new Date(pin.expiresAt) <= now);

      expiredPins.forEach(([pinId]: [string, MapPin]) => {
        this.activePins.delete(pinId);
        this.io.emit('pin:remove', pinId);
      });

      if (expiredPins.length > 0) {
        logger.info('Cleaned up expired pins', { count: expiredPins.length, isDemo: true });
      }

    }, 15000);

    setInterval(() => {
      const heatmapData = this.generateHeatmapData();
      this.io.emit('heatmap:update', heatmapData);
    }, 30000);
  }

  generateHeatmapData(): Array<{ lat: number; lng: number; w: number }> {
    const pins = Array.from(this.activePins.values())
      .filter((pin: MapPin) => {
        if (pin.expiresAt) {
          return new Date(pin.expiresAt) > new Date();
        }
        // If no expiration, include pins from last 24 hours
        const createdAt = new Date(pin.createdAt || pin.timestamp || Date.now());
        return Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000;
      });

    if (pins.length === 0) return [];

    const gridSize = 0.005; // ~500m grid for better granularity
    const heatGrid = new Map<string, { count: number; lat: number; lng: number; weight: number }>();

    pins.forEach((pin: MapPin) => {
      // MapPin always has coordinates as [longitude, latitude] tuple
      const lat = pin.coordinates[1];
      const lng = pin.coordinates[0];
      
      if (!lat || !lng) return;

      const gridX = Math.floor(lng / gridSize);
      const gridY = Math.floor(lat / gridSize);
      const key = `${gridX},${gridY}`;

      if (!heatGrid.has(key)) {
        heatGrid.set(key, { count: 0, lat: 0, lng: 0, weight: 0 });
      }

      const cell = heatGrid.get(key)!;
      cell.count++;
      cell.lat += lat;
      cell.lng += lng;
      // Weight based on activity recency
      const pinAge = pin.timestamp 
        ? Date.now() - new Date(pin.timestamp).getTime() 
        : pin.createdAt 
        ? Date.now() - new Date(pin.createdAt).getTime()
        : 0;
      const recencyWeight = Math.max(0, 1 - pinAge / (24 * 60 * 60 * 1000)); // Decay over 24h
      cell.weight += recencyWeight;
    });

    const heatmap: Array<{ lat: number; lng: number; w: number }> = [];
    heatGrid.forEach((cell) => {
      if (cell.count >= 2) {
        // Normalize weight to 0-1 range
        const normalizedWeight = Math.min(cell.weight / cell.count, 1);
        heatmap.push({
          lat: cell.lat / cell.count,
          lng: cell.lng / cell.count,
          w: normalizedWeight,
        });
      }
    });

    return heatmap;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  getStats() {
    const now = new Date();
    const activePins = Array.from(this.activePins.values())
      .filter((pin: MapPin) => new Date(pin.expiresAt) > now);

    return {
      connectedUsers: this.userSessions.size,
      activePins: activePins.length,
      totalPinsToday: this.activePins.size,
      activitiesByType: this.getActivityCounts(activePins)
    };
  }

  getActivityCounts(pins: MapPin[]): ActivityCount {
    const counts: Partial<ActivityCount> = {};
    pins.forEach((pin: MapPin) => {
      const activity = pin.activity as keyof ActivityCount;
      counts[activity] = ((counts[activity] || 0) + 1) as number;
    });
    return {
      walking: counts.walking || 0,
      playing: counts.playing || 0,
      feeding: counts.feeding || 0,
      resting: counts.resting || 0,
      training: counts.training || 0,
      grooming: counts.grooming || 0,
      vet: counts.vet || 0,
      park: counts.park || 0,
      other: counts.other || 0,
    };
  }
}

