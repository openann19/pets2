/**
 * Admin WebSocket Service for PawfectMatch
 * Provides real-time synchronization for admin panel across web and mobile
 */

import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import type { IUser } from '../models/User';
import logger from '../utils/logger';

// Type definitions
interface WebSocketClient {
  ws: WebSocket;
  role: string;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

interface BroadcastMessage {
  type: string;
  message: string;
  timestamp: string;
}

interface AdminInfo {
  userId: string;
  role: string;
  isActive: boolean;
}

class AdminWebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocketClient>;
  private readonly adminRoles: string[];

  constructor(server: HTTPServer) {
    this.clients = new Map();
    this.adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];

    this.wss = new WebSocket.Server({ 
      server, 
      path: '/admin/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    logger.info('Admin WebSocket service initialized');
  }

  /**
   * Verify client connection (authentication)
   */
  private verifyClient(info: any, callback: (result: boolean, code?: number, reason?: string) => void): void {
    try {
      const params = url.parse(info.req.url!, true).query;
      const token = params.token as string;

      if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      if (!decoded || !decoded.userId) {
        callback(false, 401, 'Invalid token');
        return;
      }

      // Store user info for later use
      info.req.userId = decoded.userId;
      callback(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('WebSocket verification error', { error: errorMessage });
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
      const User = require('../models/User').default;
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
      ws.on('message', (message: WebSocket.Data) => {
        this.handleMessage(userId, message);
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(userId);
        logger.info(`Admin WebSocket disconnected: ${userId}`);
      });

      // Handle errors
      ws.on('error', (error: Error) => {
        logger.error('WebSocket error', { userId, error });
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error setting up WebSocket connection', { userId, error: errorMessage });
      ws.close(1008, 'Connection error');
    }
  }

  /**
   * Handle messages from client
   */
  private handleMessage(userId: string, message: WebSocket.Data): void {
    try {
      const data = JSON.parse(message.toString()) as WebSocketMessage;
      
      logger.info('Received WebSocket message', { userId, type: data.type });

      // Handle different message types
      switch (data.type) {
        case 'ping':
          this.sendToClient(userId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        
        case 'subscribe':
          // Handle subscription to specific events
          this.sendToClient(userId, { 
            type: 'subscribed', 
            message: 'Subscribed to updates',
            timestamp: new Date().toISOString()
          });
          break;

        case 'unsubscribe':
          // Handle unsubscription
          this.sendToClient(userId, { 
            type: 'unsubscribed', 
            message: 'Unsubscribed from updates',
            timestamp: new Date().toISOString()
          });
          break;

        default:
          logger.warn('Unknown message type', { userId, type: data.type });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling WebSocket message', { userId, error: errorMessage });
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(userId: string, message: WebSocketMessage): void {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all connected admins
   */
  broadcast(message: BroadcastMessage): void {
    const messageToSend = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, userId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageToSend);
        } catch (error) {
          logger.error('Error sending broadcast message', { userId, error });
        }
      }
    });
  }

  /**
   * Broadcast to specific admin roles
   */
  broadcastToRole(role: string, message: BroadcastMessage): void {
    const messageToSend = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, userId) => {
      if (client.role === role && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(messageToSend);
        } catch (error) {
          logger.error('Error sending role-specific broadcast', { userId, error });
        }
      }
    });
  }

  /**
   * Notify all admins of new report
   */
  notifyNewReport(report: any): void {
    this.broadcast({
      type: 'new-report',
      message: 'New report submitted',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify all admins of content flagged
   */
  notifyContentFlagged(data: any): void {
    this.broadcast({
      type: 'content-flagged',
      message: 'Content has been flagged',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify all admins of user action
   */
  notifyUserAction(data: any): void {
    this.broadcast({
      type: 'user-action',
      message: 'User action performed',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get connected admin count
   */
  getConnectedAdminCount(): number {
    return this.clients.size;
  }

  /**
   * Get list of connected admins (without sensitive info)
   */
  getConnectedAdmins(): Array<AdminInfo> {
    return Array.from(this.clients.entries()).map(([userId, client]) => ({
      userId,
      role: client.role,
      isActive: client.ws.readyState === WebSocket.OPEN
    }));
  }

  /**
   * Close all connections gracefully
   */
  closeAllConnections(): void {
    logger.info('Closing all WebSocket connections');
    this.clients.forEach((client, userId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1000, 'Server shutting down');
      }
    });
    this.clients.clear();
  }

  /**
   * Dispose of the service
   */
  dispose(): void {
    this.closeAllConnections();
    this.wss.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}

export default AdminWebSocketService;
