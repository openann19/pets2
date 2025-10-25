/**
 * Rate Limiting Service for PawfectMatch
 * Advanced rate limiting with multiple strategies
 */

import logger from '../utils/logger';

class RateLimitingService {
  private limits: Map<string, { count: number; resetTime: number }>;
  private defaultLimit: number;
  private defaultWindow: number;

  constructor() {
    this.limits = new Map();
    this.defaultLimit = 100; // requests
    this.defaultWindow = 60; // seconds
  }

  /**
   * Check if request is within rate limit
   */
  async checkRateLimit(identifier: string, limit?: number, window?: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const requestLimit = limit || this.defaultLimit;
      const windowMs = (window || this.defaultWindow) * 1000;
      const now = Date.now();
      const key = `${identifier}:${Math.floor(now / windowMs)}`;

      const current = this.limits.get(key);
      
      if (!current || current.resetTime <= now) {
        // New window or expired
        this.limits.set(key, {
          count: 1,
          resetTime: now + windowMs
        });

        return {
          allowed: true,
          remaining: requestLimit - 1,
          resetTime: now + windowMs
        };
      }

      if (current.count >= requestLimit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: current.resetTime
        };
      }

      // Increment count
      current.count++;
      this.limits.set(key, current);

      return {
        allowed: true,
        remaining: requestLimit - current.count,
        resetTime: current.resetTime
      };
    } catch (error) {
      logger.error('Error checking rate limit', { error, identifier });
      return {
        allowed: true,
        remaining: 0,
        resetTime: 0
      };
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.limits.entries()) {
      if (value.resetTime <= now) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  getStats(): any {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of this.limits.entries()) {
      if (value.resetTime > now) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.limits.size,
      activeEntries,
      expiredEntries
    };
  }
}

export default new RateLimitingService();
