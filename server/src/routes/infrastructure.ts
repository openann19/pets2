/**
 * Infrastructure Management Routes
 * Redis, WebSocket, CDN, and MongoDB monitoring
 */

import { Router, type Request, type Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getRedisClient, checkRedisHealth } from '../config/redis';
import { getCDNConfig, getCDNUrl, invalidateCDNCache as invalidateCDN } from '../config/cdn';
import logger from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/admin/infrastructure/status
 * Get overall infrastructure status
 */
router.get('/status', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check Redis
    const redisHealth = await checkRedisHealth();

    // Check WebSocket (would need access to socket instance)
    // For now, we'll assume it's active if server is running
    const websocketActive = true; // TODO: Get actual status from socket.io instance

    // Check CDN
    const cdnConfig = getCDNConfig();

    // Check MongoDB
    const mongoConnected = mongoose.connection.readyState === 1;
    const mongoResponseTime = Date.now();
    // Simple ping to measure response time
    try {
      await mongoose.connection.db?.admin().ping();
    } catch (error) {
      logger.warn('MongoDB ping failed', { error });
    }
    const mongoPingTime = Date.now() - mongoResponseTime;

    res.json({
      success: true,
      data: {
        redis: redisHealth,
        websocket: {
          active: websocketActive,
          adapter: process.env.NODE_ENV === 'production' && getRedisClient() ? 'redis' : 'memory',
        },
        cdn: cdnConfig,
        mongodb: {
          connected: mongoConnected,
          responseTime: mongoPingTime,
          database: mongoose.connection.db?.databaseName || 'pawfectmatch',
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get infrastructure status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch infrastructure status',
    });
  }
});

/**
 * GET /api/admin/infrastructure/redis/stats
 * Get Redis cache statistics
 */
router.get('/redis/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return res.status(503).json({
        success: false,
        error: 'Redis not available',
      });
    }

    // Get Redis info
    const info = await redis.info('stats');
    const memory = await redis.info('memory');

    // Parse info strings
    const parseInfo = (infoStr: string): Record<string, string> => {
      const result: Record<string, string> = {};
      infoStr.split('\r\n').forEach((line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = value;
        }
      });
      return result;
    };

    const statsInfo = parseInfo(info);
    const memoryInfo = parseInfo(memory);

    // Calculate hit rate
    const hits = parseInt(statsInfo.keyspace_hits || '0', 10);
    const misses = parseInt(statsInfo.keyspace_misses || '0', 10);
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    // Get key count (approximate)
    const dbSize = await redis.dbsize();

    // Get memory usage
    const usedMemory = parseInt(memoryInfo.used_memory || '0', 10);
    const usedMemoryPeak = parseInt(memoryInfo.used_memory_peak || '0', 10);

    res.json({
      success: true,
      data: {
        hits,
        misses,
        hitRate,
        keys: dbSize,
        memory: {
          used: usedMemory,
          peak: usedMemoryPeak,
        },
        operations: {
          sets: hits, // Approximate
          gets: misses, // Approximate
          deletes: 0, // Would need to track separately
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get Redis stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Redis statistics',
    });
  }
});

/**
 * POST /api/admin/infrastructure/redis/clear
 * Clear Redis cache by pattern
 */
router.post('/redis/clear', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { pattern } = req.body;
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({
        success: false,
        error: 'Redis not available',
      });
    }

    if (pattern) {
      // Clear by pattern using SCAN
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      });

      let deleted = 0;
      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          await redis.del(...keys);
          deleted += keys.length;
        }
      });

      await new Promise((resolve) => {
        stream.on('end', resolve);
      });

      res.json({
        success: true,
        message: `Cleared ${deleted} keys matching pattern: ${pattern}`,
        deleted,
      });
    } else {
      // Clear all (use FLUSHDB - be careful!)
      await redis.flushdb();
      res.json({
        success: true,
        message: 'All cache cleared',
      });
    }
  } catch (error: unknown) {
    logger.error('Failed to clear Redis cache', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

/**
 * GET /api/admin/infrastructure/websocket/stats
 * Get WebSocket statistics
 */
router.get('/websocket/stats', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get socket.io instance from global or request
    const io = (global as any).socketIO;

    if (!io) {
      return res.json({
        success: true,
        data: {
          connections: 0,
          rooms: 0,
          messagesSent: 0,
          messagesReceived: 0,
          adapter: 'unknown',
          uptime: 0,
          topRooms: [],
        },
      });
    }

    const sockets = await io.fetchSockets();
    const rooms = io.sockets.adapter.rooms;

    // Get top rooms by connection count
    const roomStats: Array<{ name: string; size: number }> = [];
    rooms.forEach((room: any, roomName: string) => {
      if (roomName.startsWith('/')) {
        roomStats.push({
          name: roomName,
          size: room.size,
        });
      }
    });

    roomStats.sort((a, b) => b.size - a.size);

    res.json({
      success: true,
      data: {
        connections: sockets.length,
        rooms: rooms.size,
        messagesSent: 0, // Would need to track
        messagesReceived: 0, // Would need to track
        adapter: io.sockets.adapter.constructor.name,
        uptime: process.uptime(),
        topRooms: roomStats.slice(0, 10),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get WebSocket stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch WebSocket statistics',
    });
  }
});

/**
 * POST /api/admin/infrastructure/cdn/test
 * Test CDN URL accessibility and latency
 */
router.post('/cdn/test', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    const startTime = Date.now();
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      const latency = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          success: response.ok,
          latency,
          status: response.status,
        },
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          success: false,
          latency: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  } catch (error: unknown) {
    logger.error('Failed to test CDN URL', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to test CDN URL',
    });
  }
});

/**
 * POST /api/admin/infrastructure/cdn/invalidate
 * Invalidate CDN cache for a path
 */
router.post('/cdn/invalidate', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path is required',
      });
    }

    const result = await invalidateCDN(path);

    res.json({
      success: result,
      message: result ? 'Cache invalidation requested' : 'Cache invalidation failed',
    });
  } catch (error: unknown) {
    logger.error('Failed to invalidate CDN cache', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate CDN cache',
    });
  }
});

/**
 * GET /api/admin/infrastructure/mongodb/analytics
 * Get MongoDB connection and query analytics
 */
router.get('/mongodb/analytics', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = mongoose.connection;

    // Get connection pool stats
    const pool = (connection.db as any)?.serverConfig?.pool;
    const connectionPool = {
      active: pool?.activeConnections || 0,
      idle: pool?.idleConnections || 0,
      total: pool?.totalConnections || 0,
    };

    // Get collections
    const collections = await connection.db?.listCollections().toArray() || [];
    const collectionStats = await Promise.all(
      collections.slice(0, 20).map(async (coll) => {
        const stats = await connection.db?.collection(coll.name).stats();
        return {
          name: coll.name,
          count: stats?.count || 0,
          size: stats?.size || 0,
        };
      })
    );

    // Get indexes (simplified)
    let totalIndexes = 0;
    let unusedIndexes = 0;
    for (const coll of collections.slice(0, 10)) {
      try {
        const indexes = await connection.db?.collection(coll.name).indexes();
        totalIndexes += (indexes?.length || 0) - 1; // Subtract 1 for _id index
      } catch (error) {
        // Collection might not exist
      }
    }

    res.json({
      success: true,
      data: {
        connectionPool,
        queries: {
          total: 0, // Would need to track
          avgTime: 0, // Would need to track
          slowQueries: 0, // Would need to track
        },
        collections: collectionStats,
        indexes: {
          total: totalIndexes,
          unused: unusedIndexes,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get MongoDB analytics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MongoDB analytics',
    });
  }
});

export default router;

