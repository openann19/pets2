export {};// Added to mark file as a module
/**
 * Admin WebSocket Service
 * Provides real-time synchronization for admin panel across web and mobile
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const logger = require('../utils/logger');

class AdminWebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server, 
      path: '/admin/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.clients = new Map(); // userId -> WebSocket connection
    this.adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];

    this.wss.on('connection', this.handleConnection.bind(this));
    
    logger.info('Admin WebSocket service initialized');
  }

  /**
   * Verify client connection (authentication)
   */
  verifyClient(info, callback) {
    try {
      const params = url.parse(info.req.url, true).query;
      const token = params.token;

      if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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
  async handleConnection(ws, req) {
    const userId = req.userId;
    
    if (!userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    // Verify user has admin role
    try {
      const User = require('../models/User');
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
  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
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
  sendToClient(userId, data) {
    const client = this.clients.get(userId);
    
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all connected admin clients
   */
  broadcast(event, data) {
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
  broadcastToRole(roles, event, data) {
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
  notifyUserUpdate(userId, action, userData) {
    this.broadcast('user_update', {
      userId,
      action,
      data: userData
    });
  }

  /**
   * Notify about new match
   */
  notifyNewMatch(matchData) {
    this.broadcast('new_match', matchData);
  }

  /**
   * Notify about new message
   */
  notifyNewMessage(messageData) {
    this.broadcast('new_message', messageData);
  }

  /**
   * Notify about security alert
   */
  notifySecurityAlert(alert) {
    // Only send to administrators and moderators
    this.broadcastToRole(['administrator', 'moderator'], 'security_alert', alert);
  }

  /**
   * Notify about system event
   */
  notifySystemEvent(eventType, eventData) {
    this.broadcast('system_event', {
      type: eventType,
      data: eventData
    });
  }

  /**
   * Notify about analytics update
   */
  notifyAnalyticsUpdate(analyticsData) {
    this.broadcast('analytics_update', analyticsData);
  }

  /**
   * Notify about billing event
   */
  notifyBillingEvent(eventType, eventData) {
    // Only send to administrators and billing admins
    this.broadcastToRole(['administrator', 'billing_admin'], 'billing_event', {
      type: eventType,
      data: eventData
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedCount() {
    return this.clients.size;
  }

  /**
   * Get connected clients by role
   */
  getConnectedByRole() {
    const roleCount = {};
    
    this.clients.forEach((client) => {
      roleCount[client.role] = (roleCount[client.role] || 0) + 1;
    });
    
    return roleCount;
  }

  /**
   * Close all connections
   */
  closeAll() {
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });
    
    this.clients.clear();
    logger.info('All admin WebSocket connections closed');
  }
}

module.exports = AdminWebSocketService;
