/**
 * Session Management Middleware
 * Handles admin session timeout and tracking
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express';
import { randomBytes } from 'crypto';
import logger from '../utils/logger';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Session metadata interface
 */
interface SessionMetadata {
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

/**
 * Session data structure
 */
interface Session {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  metadata: SessionMetadata;
}

/**
 * Session validation result
 */
interface SessionValidation {
  valid: boolean;
  reason?: string;
  session?: Session;
  timeRemaining?: number;
}

/**
 * Session statistics
 */
interface SessionStats {
  total: number;
  active: number;
  expiringSoon: number;
}

/**
 * Request with session
 */
interface RequestWithSession extends AuthRequest {
  session?: Session;
  sessionTimeRemaining?: number;
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
  getUserSessions(userId: string): Array<{
    sessionId: string;
    createdAt: number;
    lastActivity: number;
    metadata: SessionMetadata;
  }> {
    const userSessions: Array<{
      sessionId: string;
      createdAt: number;
      lastActivity: number;
      metadata: SessionMetadata;
    }> = [];
    
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
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

/**
 * Middleware to track session activity
 */
export const trackSession = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithSession = req as RequestWithSession;
  
  if (reqWithSession.user && req.headers['x-session-id']) {
    const sessionId = req.headers['x-session-id'] as string;
    const validation = sessionManager.validateSession(sessionId);

    if (!validation.valid) {
      res.status(401).json({
        success: false,
        error: 'Session expired',
        message: validation.reason
      });
      return;
    }

    // Attach session info to request
    reqWithSession.session = validation.session;
    reqWithSession.sessionTimeRemaining = validation.timeRemaining;
  }

  next();
};

/**
 * Middleware to require valid session
 */
export const requireSession = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithSession = req as RequestWithSession;
  
  const sessionId = req.headers['x-session-id'] as string | undefined;

  if (!sessionId) {
    res.status(401).json({
      success: false,
      error: 'No session',
      message: 'Session ID required'
    });
    return;
  }

  const validation = sessionManager.validateSession(sessionId);

  if (!validation.valid) {
    res.status(401).json({
      success: false,
      error: 'Session expired',
      message: validation.reason
    });
    return;
  }

  reqWithSession.session = validation.session;
  reqWithSession.sessionTimeRemaining = validation.timeRemaining;
  next();
};

export { sessionManager, SESSION_TIMEOUT };
export type { Session, SessionMetadata, SessionValidation, SessionStats };
