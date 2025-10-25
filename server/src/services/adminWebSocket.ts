/**
 * Admin WebSocket Service for PawfectMatch
 * Real-time synchronization for admin panel across web and mobile
 */

import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { URL } from 'url';
import User from '../models/User';
import logger from '../utils/logger';

interface WebSocketClient {
  ws: WebSocket;
  role: string;
}

interface WebSocketMessage {
  type: string;
  events?: string[];
  [key: string]: any;
}

class AdminWebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocketClient>;
  private adminRoles: string[];

  constructor(server: any) {
    this.wss = new WebSocket.Server({ 
      server, 
      path: '/admin/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.clients = new Map();
    this.adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];

    this.wss.on('connection', this.handleConnection.bind(this));
    
    logger.info('Admin WebSocket service initialized');
  }

  /**
   * Verify client connection (authentication)
   */
  private verifyClient(info: any, callback: (result: boolean, code?: number, reason?: string) => void): void {
    try {
      const params = new URL(info.req.url!, `http://${info.req.headers.host}`).searchParams;
      const token = params.get('token');

      if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || '') as any;
      
      if (!decoded || !decoded.userId) {
        callback(false, 401, 'Invalid token');
        return;
      }

      // Store user info for later use
      info.req.userId = decoded.userId;
      callback(true);
    } catch (error) {
      logger.error('WebSocket verification error', { error });
      callback(false, 401, 'Authentication failed');
    }
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: WebSocket, req: any): Promise<void> {
    const userId = req.userId;
    
    if (!userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    // Verify user has admin role
    try {
      const user = await User.findById(userId).select('role');
      
      if (!user || !this.adminRoles.includes(user.role)) {
        ws.close(1008, 'Admin access required');
        return;
      }

      // Store connection
      this.clients.set(userId, { ws, role: user.role });
      
      logger.info(`Admin WebSocket connected: ${userId} (${user.role})`);

      // Send welcome message
      this.sendToClient(userId, {
        type: 'connected',
        message: 'Admin WebSocket connected',
        timestamp: new Date().toISOString()
      });

      // Handle messages from client
      ws.on('message', (message) => {
        this.handleMessage(userId, message);
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(userId);
        logger.info(`Admin WebSocket disconnected: ${userId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for user ${userId}`, { error });
      });

    } catch (error) {
      logger.error('Error handling WebSocket connection', { error });
      ws.close(1011, 'Internal server error');
    }
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(userId: string, message: Buffer): void {
    try {
      const data: WebSocketMessage = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'ping':
          this.sendToClient(userId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        
        case 'subscribe':
          // Handle subscription to specific events
          logger.info(`User ${userId} subscribed to:`, { events: data.events });
          break;
        
        default:
          logger.warn(`Unknown message type from ${userId}`, { type: data.type });
      }
    } catch (error) {
      logger.error('Error handling message', { error });
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(userId: string, data: any): void {
    const client = this.clients.get(userId);
    
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all connected admin clients
   */
  broadcast(event: string, data: any): void {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    logger.info(`Broadcasted ${event} to ${this.clients.size} admin clients`);
  }

  /**
   * Broadcast to clients with specific role
   */
  broadcastToRole(roles: string | string[], event: string, data: any): void {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (allowedRoles.includes(client.role) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  /**
   * Notify about user update
   */
  notifyUserUpdate(userId: string, action: string, userData: any): void {
    this.broadcast('user_update', {
      userId,
      action,
      data: userData
    });
  }

  /**
   * Notify about new match
   */
  notifyNewMatch(matchData: any): void {
    this.broadcast('new_match', matchData);
  }

  /**
   * Notify about new message
   */
  notifyNewMessage(messageData: any): void {
    this.broadcast('new_message', messageData);
  }

  /**
   * Notify about security alert
   */
  notifySecurityAlert(alert: any): void {
    // Only send to administrators and moderators
    this.broadcastToRole(['administrator', 'moderator'], 'security_alert', alert);
  }

  /**
   * Notify about system event
   */
  notifySystemEvent(eventType: string, eventData: any): void {
    this.broadcast('system_event', {
      type: eventType,
      data: eventData
    });
  }

  /**
   * Notify about analytics update
   */
  notifyAnalyticsUpdate(analyticsData: any): void {
    this.broadcast('analytics_update', analyticsData);
  }

  /**
   * Notify about billing event
   */
  notifyBillingEvent(eventType: string, eventData: any): void {
    // Only send to administrators and billing admins
    this.broadcastToRole(['administrator', 'billing_admin'], 'billing_event', {
      type: eventType,
      data: eventData
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected clients by role
   */
  getConnectedByRole(): Record<string, number> {
    const roleCount: Record<string, number> = {};
    
    this.clients.forEach((client) => {
      roleCount[client.role] = (roleCount[client.role] || 0) + 1;
    });
    
    return roleCount;
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });
    
    this.clients.clear();
    logger.info('All admin WebSocket connections closed');
  }
}

export default AdminWebSocketService;
