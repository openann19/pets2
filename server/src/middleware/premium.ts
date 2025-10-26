import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import logger from "../utils/logger";

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
      const today = new Date().toISOString().slice(0,10);
      
      // Using user's usage tracking (not Redis for now to keep it simple)
      const usage = user.premium?.usage || {};
      const currentKey = `${key}Used` as keyof typeof usage;
      const used = usage[currentKey] as number || 0;
      
      if (used >= limit) {
        return res.status(429).json({ 
          error: "quota_exceeded", 
          key, 
          limit, 
          used,
          retryAfter: 86400 // seconds until reset
        });
      }

      // Increment usage
      const incrementKey = `premium.usage.${currentKey}`;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { [incrementKey]: 1 }
      });

      // Set subscriptionActive on req.user for subsequent middleware
      req.user.subscriptionActive = isPremium;
      
      next();
    } catch (error: any) {
      logger.error("Quota enforcement error", { error: error.message, key });
      return res.status(500).json({ error: "internal_server_error" });
    }
  };
}


