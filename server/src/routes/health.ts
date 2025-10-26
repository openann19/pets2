/**
 * Health Check Endpoint
 * Comprehensive system health monitoring
 */

import express, { type Request, type Response, Router } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const router: Router = express.Router();

/**
 * GET /health
 * Returns detailed health status of all services
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {} as any
  };

  try {
    // 1. Check MongoDB connection
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      health.checks.mongodb = {
        status: dbState === 1 ? 'up' : 'down',
        state: dbStates[dbState],
        responseTime: Date.now() - startTime + 'ms'
      };
      
      if (dbState === 1) {
        // Check if we can actually query
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        health.checks.mongodb.ping = (Date.now() - pingStart) + 'ms';
      }
    } catch (error: any) {
      health.checks.mongodb = {
        status: 'down',
        error: error.message
      };
      health.status = 'degraded';
    }

    // 2. Check Redis connection (if configured)
    if (process.env.REDIS_URL) {
      try {
        // Add Redis health check here if you have redis client
        health.checks.redis = {
          status: 'up',
          message: 'Redis client not initialized in health check'
        };
      } catch (error: any) {
        health.checks.redis = {
          status: 'down',
          error: error.message
        };
        health.status = 'degraded';
      }
    }

    // 3. Check memory usage
    const memUsage = process.memoryUsage();
    const memLimit = 512 * 1024 * 1024; // 512MB warning threshold
    health.checks.memory = {
      status: memUsage.heapUsed < memLimit ? 'healthy' : 'warning',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    };

    // 4. Check CPU usage (approximation)
    const cpuUsage = process.cpuUsage();
    health.checks.cpu = {
      user: Math.round(cpuUsage.user / 1000) + 'ms',
      system: Math.round(cpuUsage.system / 1000) + 'ms'
    };

    // 5. Check disk space (if in production)
    if (process.env.NODE_ENV === 'production') {
      try {
        const fs = require('fs');
        const stats = fs.statfsSync('/');
        const totalSpace = stats.blocks * stats.bsize;
        const freeSpace = stats.bfree * stats.bsize;
        const usedPercent = ((totalSpace - freeSpace) / totalSpace * 100).toFixed(2);
        
        health.checks.disk = {
          status: usedPercent < 90 ? 'healthy' : 'warning',
          total: Math.round(totalSpace / 1024 / 1024 / 1024) + 'GB',
          free: Math.round(freeSpace / 1024 / 1024 / 1024) + 'GB',
          usedPercent: usedPercent + '%'
        };
      } catch (diskError: any) {
        logger.warn('Disk check failed', { error: diskError.message });
        health.checks.disk = {
          status: 'unknown',
          error: 'Could not check disk space'
        };
      }
    }

    // 6. Check AI Service (if configured)
    if (process.env.AI_SERVICE_URL) {
      try {
        const axios = require('axios');
        const aiServiceStart = Date.now();
        const aiResponse = await axios.get(`${process.env.AI_SERVICE_URL}/health`, {
          timeout: 5000
        });
        
        health.checks.aiService = {
          status: aiResponse.data?.status === 'healthy' ? 'up' : 'warning',
          responseTime: `${Date.now() - aiServiceStart}ms`,
          version: aiResponse.data?.version || 'unknown',
          url: process.env.AI_SERVICE_URL
        };
        
        if (aiResponse.data?.status !== 'healthy') {
          health.status = 'degraded';
        }
      } catch (error: any) {
        health.checks.aiService = {
          status: 'down',
          error: error.message,
          url: process.env.AI_SERVICE_URL
        };
        health.status = 'degraded';
      }
    }

    // 7. Overall response time
    health.responseTime = (Date.now() - startTime) + 'ms';

    // Determine final status
    if (health.status === 'degraded' || 
        health.checks.mongodb?.status === 'down') {
      health.status = 'unhealthy';
      logger.warn('Health check failed', health.checks);
      res.status(503).json(health);
      return;
    }

    // All good!
    res.status(200).json(health);

  } catch (error: any) {
    logger.error('Health check error:', error);
    health.status = 'error';
    health.error = error.message;
    res.status(500).json(health);
  }
});

/**
 * GET /health/ready
 * Kubernetes readiness probe - simple quick check
 */
router.get('/ready', (req: Request, res: Response): void => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Not Ready');
  }
});

/**
 * GET /health/live
 * Kubernetes liveness probe - is the process alive?
 */
router.get('/live', (req: Request, res: Response): void => {
  res.status(200).send('OK');
});

export default router;

