import type { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

// Default daily cap, can be overridden via env
const DAILY_CAP = parseInt(process.env.STORY_DAILY_CAP || '10', 10);

/**
 * Redis client interface for type safety
 */
interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
}

/**
 * Middleware: limit story creations per-user per-day using Redis counters
 */
export async function storyDailyLimiter(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const redis = getRedisClient();
        if (!redis || typeof (redis as unknown as RedisClient).incr !== 'function') {
            // Redis not configured; skip limiting but log
            logger.warn('Redis not available; skipping story daily limiter');
            return next();
        }

        const today = new Date();
        const keyDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const key = `story:dailycount:${userId}:${keyDate}`;

        const redisClient = redis as unknown as RedisClient;
        const count = await redisClient.incr(key);
        if (count === 1) {
            // Set expiry to end of day (UTC)
            const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
            const ttl = Math.ceil((endOfDay.getTime() - today.getTime()) / 1000);
            await redisClient.expire(key, ttl);
        }

        if (count > DAILY_CAP) {
            return res.status(429).json({
                success: false,
                message: `Daily story limit reached (${DAILY_CAP}). Try again tomorrow.`,
                code: 'DAILY_LIMIT_EXCEEDED',
                limit: DAILY_CAP,
            });
        }

        return next();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Story daily limiter error', { error: errorMessage });
        // Fail-open to avoid blocking content creation on limiter failure
        return next();
    }
}

