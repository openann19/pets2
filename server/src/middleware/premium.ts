import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import logger from "../utils/logger";
import { createClient } from 'redis';

// Initialize Redis client
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (redisClient) return redisClient;
  
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis connection failed after 10 retries');
          return new Error('Max retries reached');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));
  redisClient.on('connect', () => logger.info('Redis Client Connected'));

  await redisClient.connect();
  return redisClient;
}

interface AuthRequest extends Request {
  user?: any;
}

export async function requirePremium(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const user = await User.findById(req.user?._id).select("premium");
    if (!user) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (user.premium?.isActive && 
        (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date())) {
      req.user.subscriptionActive = true;
      return next();
    }
    return res.status(402).json({ error: "premium_required" });
  } catch (error: any) {
    logger.error("Premium check error", { error: error.message });
    return res.status(500).json({ error: "internal_server_error" });
  }
}

type LimitKey = "likes" | "superlikes" | "rewinds" | "boosts";
const FREE_LIMITS: Record<LimitKey, number> = { likes: 100, superlikes: 1, rewinds: 0, boosts: 0 };
const PREMIUM_LIMITS: Record<LimitKey, number> = { likes: 500, superlikes: 5, rewinds: 10, boosts: 1 };

export async function enforceQuota(key: LimitKey) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = await User.findById(req.user?._id).select("premium");
      if (!user) {
        return res.status(401).json({ error: "unauthorized" });
      }

      const isPremium = !!user.premium?.isActive && 
                        (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
      const limit = (isPremium ? PREMIUM_LIMITS : FREE_LIMITS)[key];
      
      try {
        // Use Redis for quota tracking with distributed rate limiting
        const redis = await getRedisClient();
        const today = new Date().toISOString().slice(0, 10);
        const redisKey = `quota:${req.user._id}:${key}:${today}`;
        
        // Get current usage
        const usedStr = await redis.get(redisKey);
        const used = usedStr ? parseInt(usedStr, 10) : 0;
        
        if (used >= limit) {
          // Calculate seconds until midnight for TTL
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          const secondsUntilReset = Math.floor((midnight.getTime() - now.getTime()) / 1000);
          
          return res.status(429).json({ 
            error: "quota_exceeded", 
            key, 
            limit, 
            used,
            retryAfter: secondsUntilReset
          });
        }

        // Increment usage with expiration at midnight
        await redis.incr(redisKey);
        await redis.expire(redisKey, 86400); // Expire at midnight
      } catch (redisError: any) {
        logger.warn('Redis quota tracking failed, falling back to database', { 
          error: redisError.message,
          userId: req.user._id 
        });
        
        // Fallback to database tracking
        const usage = user.premium?.usage || {};
        const currentKey = `${key}Used` as keyof typeof usage;
        const used = usage[currentKey] as number || 0;
        
        if (used >= limit) {
          return res.status(429).json({ 
            error: "quota_exceeded", 
            key, 
            limit, 
            used,
            retryAfter: 86400
          });
        }

        const incrementKey = `premium.usage.${currentKey}`;
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { [incrementKey]: 1 }
        });
      }

      // Set subscriptionActive on req.user for subsequent middleware
      req.user.subscriptionActive = isPremium;
      
      next();
    } catch (error: any) {
      logger.error("Quota enforcement error", { error: error.message, key });
      return res.status(500).json({ error: "internal_server_error" });
    }
  };
}


