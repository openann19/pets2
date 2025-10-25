/**
 * Analytics and Monitoring Service for PawfectMatch
 * Provides comprehensive tracking, error monitoring, and performance analytics
 */

const winston = require('winston');
const path = require('path');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pawfectmatch' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    }),
  ],
});

// If we're not in production then log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Analytics service
class AnalyticsService {
  constructor() {
    this.events = new Map();
    this.metrics = {
      userActions: new Map(),
      apiCalls: new Map(),
      performance: new Map(),
      errors: new Map()
    };
  }

  // Track user actions
  trackUserAction(userId, action, metadata = {}) {
    const event = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
      sessionId: metadata.sessionId || this.generateSessionId()
    };

    // Store in memory (in production, this would go to a database)
    if (!this.events.has(userId)) {
      this.events.set(userId, []);
    }
    this.events.get(userId).push(event);

    // Update metrics
    this.updateMetrics('userActions', action);

    logger.info('User action tracked', { userId, action, metadata });
  }

  // Track API calls
  trackApiCall(endpoint, method, statusCode, duration, metadata = {}) {
    this.updateMetrics('apiCalls', `${method}-${endpoint}`, { statusCode, duration });

    logger.info('API call tracked', {
      endpoint,
      method,
      statusCode,
      duration,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, metadata = {}) {
    this.updateMetrics('performance', metric, { value });

    logger.info('Performance metric tracked', {
      metric,
      value,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  // Track errors
  trackError(error, context = {}) {
    const errorEvent = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent: context.userAgent,
      url: context.url,
      userId: context.userId
    };

    // Update error metrics
    this.updateMetrics('errors', error.name);

    logger.error('Error tracked', errorEvent);
  }

  // Update metrics
  updateMetrics(category, key, data = {}) {
    if (!this.metrics[category].has(key)) {
      this.metrics[category].set(key, {
        count: 0,
        total: 0,
        average: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    const metric = this.metrics[category].get(key);
    metric.count++;
    metric.total += data.value || 1;
    metric.average = metric.total / metric.count;
    metric.lastUpdated = new Date().toISOString();

    // Store additional data if provided
    if (data.statusCode) metric.lastStatusCode = data.statusCode;
    if (data.duration) metric.lastDuration = data.duration;
  }

  // Generate session ID
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  // Get analytics data
  getAnalytics(userId = null, timeframe = '24h') {
    const data = {
      userEvents: userId ? this.events.get(userId) || [] : Array.from(this.events.values()).flat(),
      metrics: {},
      summary: {}
    };

    // Calculate time range
    const now = new Date();
    const timeRange = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const range = timeRange[timeframe] || timeRange['24h'];
    const cutoff = new Date(now.getTime() - range);

    // Filter events by timeframe
    if (userId) {
      data.userEvents = data.userEvents.filter(event =>
        new Date(event.timestamp) > cutoff
      );
    }

    // Get metrics for each category
    Object.keys(this.metrics).forEach(category => {
      data.metrics[category] = Object.fromEntries(this.metrics[category]);
    });

    // Generate summary
    data.summary = {
      totalUsers: this.events.size,
      totalEvents: Array.from(this.events.values()).flat().length,
      totalApiCalls: this.metrics.apiCalls.size,
      totalErrors: this.metrics.errors.size,
      timeframe,
      generatedAt: now.toISOString()
    };

    return data;
  }

  // Export data for external analytics services
  exportForAnalytics(analyticsService = 'google') {
    const data = this.getAnalytics(null, '24h');

    switch (analyticsService) {
      case 'google':
        return this.formatForGoogleAnalytics(data);
      case 'mixpanel':
        return this.formatForMixpanel(data);
      case 'segment':
        return this.formatForSegment(data);
      default:
        return data;
    }
  }

  formatForGoogleAnalytics(data) {
    return {
      events: data.userEvents.map(event => ({
        name: 'user_action',
        params: {
          action: event.action,
          user_id: event.userId,
          session_id: event.sessionId,
          timestamp: event.timestamp,
          ...event.metadata
        }
      })),
      metrics: data.metrics
    };
  }

  formatForMixpanel(data) {
    return {
      events: data.userEvents.map(event => ({
        event: event.action,
        properties: {
          distinct_id: event.userId,
          session_id: event.sessionId,
          time: new Date(event.timestamp).getTime() / 1000,
          ...event.metadata
        }
      }))
    };
  }

  formatForSegment(data) {
    return {
      batch: data.userEvents.map(event => ({
        type: 'track',
        event: event.action,
        userId: event.userId,
        timestamp: event.timestamp,
        properties: {
          session_id: event.sessionId,
          ...event.metadata
        }
      }))
    };
  }
}

// Health check service
class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.lastHealthStatus = 'healthy';
  }

  // Register a health check
  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      check: checkFunction,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      lastResult: null,
      lastCheck: null
    });
  }

  // Run all health checks
  async runHealthChecks() {
    const results = {};
    const promises = [];

    for (const [name, config] of this.checks.entries()) {
      const checkPromise = this.runSingleCheck(name, config)
        .then(result => {
          results[name] = result;
        })
        .catch(error => {
          results[name] = {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          };
        });

      promises.push(checkPromise);
    }

    await Promise.all(promises);

    // Determine overall health
    const overallStatus = this.determineOverallHealth(results);
    this.lastHealthStatus = overallStatus;

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date().toISOString()
    };
  }

  async runSingleCheck(name, config) {
    const startTime = Date.now();
    let timeoutId;

    try {
      const result = await Promise.race([
        Promise.resolve().then(() => config.check()),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Health check timeout')), config.timeout);
        })
      ]);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      const duration = Date.now() - startTime;

      const checkResult = {
        status: 'healthy',
        result,
        duration,
        timestamp: new Date().toISOString()
      };

      config.lastResult = checkResult;
      config.lastCheck = new Date().toISOString();

      return checkResult;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      const duration = Date.now() - startTime;

      const checkResult = {
        status: 'unhealthy',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      };

      config.lastResult = checkResult;
      config.lastCheck = new Date().toISOString();

      throw error;
    }
  }

  determineOverallHealth(results) {
    const criticalChecks = Array.from(this.checks.values()).filter(c => c.critical);
    const criticalResults = criticalChecks.map(checkConfig => {
      const entry = Array.from(this.checks.entries()).find(([, config]) => config === checkConfig);
      const checkName = entry ? entry[0] : undefined;
      return checkName ? results[checkName] : undefined;
    }).filter(Boolean);

    // If any critical check is unhealthy, overall status is unhealthy
    if (criticalResults.some(r => r.status === 'unhealthy')) {
      return 'unhealthy';
    }

    // If any check has errors, overall status is degraded
    if (Object.values(results).some(r => r.status === 'error')) {
      return 'degraded';
    }

    return 'healthy';
  }

  // Get health status
  getHealthStatus() {
    return {
      status: this.lastHealthStatus,
      lastCheck: new Date().toISOString(),
      checks: Object.fromEntries(
        Array.from(this.checks.entries()).map(([name, config]) => [
          name,
          config.lastResult || { status: 'unknown' }
        ])
      )
    };
  }
}

// Create instances
const analyticsService = new AnalyticsService();
const healthCheckService = new HealthCheckService();

// Register default health checks
healthCheckService.registerCheck('database', async () => {
  // Check database connection
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
  return { status: 'connected', state: mongoose.connection.readyState };
}, { critical: true });

healthCheckService.registerCheck('redis', async () => {
  // Check Redis connection
  const redis = require('redis');
  const client = redis.createClient();
  try {
    await client.connect();
    await client.ping();
    await client.quit();
    return { status: 'connected' };
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    throw new Error('Redis connection failed');
  }
});

healthCheckService.registerCheck('ai-service', async () => {
  // Check AI service availability
  const axios = require('axios');
  try {
    const response = await axios.get(`${process.env.AI_SERVICE_URL}/health`, { timeout: 3000 });
    return { status: 'available', responseTime: response.headers['response-time'] };
  } catch (error) {
    logger.error('AI service health check failed', { error: error.message });
    throw new Error('AI service unavailable');
  }
});

module.exports = {
  logger,
  analyticsService,
  healthCheckService,
  AnalyticsService,
  HealthCheckService
};
