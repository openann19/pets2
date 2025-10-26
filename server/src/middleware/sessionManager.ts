/**
 * Session Management Middleware
 * Handles admin session timeout and tracking
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import crypto from 'crypto';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface SessionMetadata {
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

interface Session {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  metadata: SessionMetadata;
}

interface SessionValidation {
  valid: boolean;
  reason?: string;
  session?: Session;
  timeRemaining?: number;
}

interface SessionStats {
  total: number;
  active: number;
  expiringSoon: number;
}

class SessionManager {
  private sessions: Map<string, Session>;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.sessions = new Map();
    // Avoid starting background intervals during test runs to prevent open handle hangs
    if (process.env.NODE_ENV !== 'test') {
      this.startCleanup();
    }
  }

  /**
   * Create a new session
   */
  createSession(userId: string, metadata: SessionMetadata = {}): string {
    const sessionId = this.generateSessionId();
    const session: Session = {
      userId,
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      metadata: {
        ...metadata,
        userAgent: metadata.userAgent || 'unknown',
        ip: metadata.ip || 'unknown'
      }
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Validate and refresh session
   */
  validateSession(sessionId: string): SessionValidation {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    // Check if session has timed out
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Update last activity
    session.lastActivity = now;
    this.sessions.set(sessionId, session);

    return {
      valid: true,
      session,
      timeRemaining: SESSION_TIMEOUT - timeSinceLastActivity
    };
  }

  /**
   * Destroy a session
   */
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Destroy all sessions for a user
   */
  destroyUserSessions(userId: string): number {
    let count = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): Array<Omit<Session, 'userId'>> {
    const userSessions: Array<Omit<Session, 'userId'>> = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        userSessions.push({
          sessionId,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          metadata: session.metadata
        });
      }
    }
    return userSessions;
  }

  /**
   * Get session statistics
   */
  getStats(): SessionStats {
    const now = Date.now();
    let activeSessions = 0;
    let expiringSoon = 0;

    for (const session of this.sessions.values()) {
      const timeSinceLastActivity = now - session.lastActivity;

      if (timeSinceLastActivity < SESSION_TIMEOUT) {
        activeSessions++;

        // Expiring in next 5 minutes
        if (timeSinceLastActivity > SESSION_TIMEOUT - 5 * 60 * 1000) {
          expiringSoon++;
        }
      }
    }

    return {
      total: this.sessions.size,
      active: activeSessions,
      expiringSoon
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now - session.lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} expired sessions`);
    }

    return cleaned;
  }

  /**
   * Start automatic cleanup
   */
  startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Generate secure session ID
   */
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

interface SessionRequest extends Request {
  user?: any;
  session?: Session;
  sessionTimeRemaining?: number;
}

/**
 * Middleware to track session activity
 */
export const trackSession = (req: SessionRequest, res: Response, next: NextFunction): Response | void => {
  if (req.user && req.headers['x-session-id']) {
    const sessionId = req.headers['x-session-id'] as string;
    const validation = sessionManager.validateSession(sessionId);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        message: validation.reason
      });
    }

    // Attach session info to request
    req.session = validation.session;
    req.sessionTimeRemaining = validation.timeRemaining;
  }

  next();
};

/**
 * Middleware to require valid session
 */
export const requireSession = (req: SessionRequest, res: Response, next: NextFunction): Response | void => {
  const sessionId = req.headers['x-session-id'] as string | undefined;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: 'No session',
      message: 'Session ID required'
    });
  }

  const validation = sessionManager.validateSession(sessionId);

  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      error: 'Session expired',
      message: validation.reason
    });
  }

  req.session = validation.session;
  req.sessionTimeRemaining = validation.timeRemaining;
  next();
};

export { SESSION_TIMEOUT };
