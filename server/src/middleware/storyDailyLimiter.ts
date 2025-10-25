const redis = require('../config/redis');
const logger = require('../utils/logger');

// Default daily cap, can be overridden via env
const DAILY_CAP = parseInt(process.env.STORY_DAILY_CAP || '10', 10);

/**
 * Middleware: limit story creations per-user per-day using Redis counters
 */
async function storyDailyLimiter(req, res, next) {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        if (!redis || !redis.incr) {
            // Redis not configured; skip limiting but log
            logger.warn('Redis not available; skipping story daily limiter');
            return next();
        }

        const today = new Date();
        const keyDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const key = `story:dailycount:${userId}:${keyDate}`;

        const count = await redis.incr(key);
        if (count === 1) {
            // Set expiry to end of day (UTC)
            const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
            const ttl = Math.ceil((endOfDay - today) / 1000);
            await redis.expire(key, ttl);
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
    } catch (error) {
        logger.error('Story daily limiter error', { error: error?.message });
        // Fail-open to avoid blocking content creation on limiter failure
        return next();
    }
}

module.exports = { storyDailyLimiter };
