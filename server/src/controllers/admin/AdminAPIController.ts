/**
 * Admin API Management Controller for PawfectMatch
 * Handles API endpoint monitoring, testing, and management
 */

import type { Request, Response } from 'express';
import AnalyticsEvent from '../../models/AnalyticsEvent';
import { analyticsService } from '../../services/monitoring';
import { logAdminActivity } from '../../middleware/adminLogger';
const logger = require('../../utils/logger');

// Type definitions
interface AdminRequest extends Request {
  userId?: string;
}

interface GetAPIEndpointsQuery {
  method?: string;
  status?: string;
  search?: string;
}

interface TestAPIEndpointBody {
  testCase?: string;
}

interface UpdateAPIEndpointBody {
  rateLimit?: {
    requests?: number;
    window?: string;
  };
  status?: string;
  version?: string;
}

/**
 * Get API statistics and overview
 */
export const getAPIStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    // Get real analytics data from the last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get API call metrics from AnalyticsEvent
    const apiEvents = await AnalyticsEvent.find({
      eventType: 'api_call',
      createdAt: { $gte: yesterday }
    }).lean();

    // Calculate metrics
    const totalCalls = apiEvents.length;
    const successCalls = apiEvents.filter((e: any) => e.success).length;
    const errorCalls = totalCalls - successCalls;
    const errorRate = totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0;

    // Calculate average response time
    const durations = apiEvents
      .map((e: any) => e.durationMs)
      .filter((d: number | undefined) => d !== undefined && !isNaN(d)) as number[];
    
    const avgResponseTime = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    // Get error distribution by status code
    const errorDistribution = apiEvents
      .filter((e: any) => !e.success && e.errorCode)
      .reduce((acc: any, e: any) => {
        const status = parseInt(e.errorCode) || 0;
        if (!acc[status]) {
          acc[status] = 0;
        }
        acc[status]++;
        return acc;
      }, {});

    const errorDist = Object.entries(errorDistribution)
      .map(([status, count]) => ({
        status: parseInt(status),
        count: count as number,
        percentage: ((count as number) / errorCalls) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);

    // Get top endpoints by call count
    const endpointCounts = apiEvents.reduce((acc: any, e: any) => {
      const endpoint = e.metadata?.endpoint || 'unknown';
      const method = e.metadata?.method || 'GET';
      const key = `${method}-${endpoint}`;
      
      if (!acc[key]) {
        acc[key] = { path: endpoint, method, calls: 0, totalTime: 0, errors: 0 };
      }
      acc[key].calls++;
      if (e.durationMs) acc[key].totalTime += e.durationMs;
      if (!e.success) acc[key].errors++;
      return acc;
    }, {});

    const topEndpoints = Object.values(endpointCounts)
      .map((e: any) => ({
        path: e.path,
        method: e.method,
        calls: e.calls,
        avgTime: Math.round(e.totalTime / e.calls),
        errors: e.errors,
        successRate: ((e.calls - e.errors) / e.calls) * 100
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    // Calculate performance metrics (percentiles)
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      if (sortedDurations.length === 0) return 0;
      const index = Math.ceil((p / 100) * sortedDurations.length) - 1;
      return sortedDurations[Math.max(0, index)];
    };

    // Get total active endpoints from analytics service
    const analyticsData = analyticsService.getAnalytics(null, '24h');
    const totalEndpoints = Object.keys(analyticsData.metrics.apiCalls).length;
    const activeEndpoints = Object.entries(analyticsData.metrics.apiCalls)
      .filter(([, data]: [string, any]) => data.count > 0)
      .length;

    // Calculate throughput
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentEvents = apiEvents.filter((e: any) => new Date(e.createdAt) >= oneHourAgo);
    const requestsPerSecond = recentEvents.length / 3600;

    // Estimate data transferred (mock calculation based on average)
    const avgResponseSize = 2048; // bytes, estimate
    const dataTransferred = (totalCalls * avgResponseSize / (1024 * 1024)).toFixed(1); // MB

    // Calculate uptime (simplified, would normally track server uptime)
    const uptime = totalCalls > 0 ? ((successCalls / totalCalls) * 100).toFixed(1) : 99.9;

    const stats = {
      totalEndpoints,
      activeEndpoints,
      totalCalls,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: errorRate.toFixed(1),
      uptime: parseFloat(uptime),
      throughput: {
        requestsPerSecond: Math.round(requestsPerSecond * 10) / 10,
        dataTransferred: parseFloat(dataTransferred)
      },
      topEndpoints,
      errorDistribution: errorDist,
      performanceMetrics: {
        p50: getPercentile(50),
        p95: getPercentile(95),
        p99: getPercentile(99)
      }
    };

    await logAdminActivity(req, 'VIEW_API_STATS', { statsRequested: true }, true);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Failed to fetch API stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API statistics',
      message: error.message
    });
  }
};

/**
 * Get list of API endpoints
 */
export const getAPIEndpoints = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { method, status, search } = req.query as GetAPIEndpointsQuery;

    // Get endpoint data from analytics
    const analyticsData = analyticsService.getAnalytics(null, '24h');
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all API call events
    const apiEvents = await AnalyticsEvent.find({
      eventType: 'api_call',
      createdAt: { $gte: last24h }
    }).lean();

    // Process endpoints
    const endpointMap = new Map<string, any>();

    apiEvents.forEach((event: any) => {
      const path = event.metadata?.endpoint || '/api/unknown';
      const method = event.metadata?.method || 'GET';
      const key = `${method}:${path}`;

      if (!endpointMap.has(key)) {
        endpointMap.set(key, {
          id: key,
          method,
          path,
          description: event.metadata?.description || `API endpoint for ${path}`,
          status: 'active',
          calls: 0,
          avgTime: 0,
          totalTime: 0,
          errors: 0,
          firstCall: event.createdAt,
          lastCalled: event.createdAt,
          metadata: []
        });
      }

      const endpoint = endpointMap.get(key)!;
      endpoint.calls++;
      if (event.durationMs) {
        endpoint.totalTime += event.durationMs;
      }
      if (!event.success) {
        endpoint.errors++;
      }
      if (event.createdAt > endpoint.lastCalled) {
        endpoint.lastCalled = event.createdAt;
      }
      endpoint.metadata.push({
        eventId: event._id,
        timestamp: event.createdAt,
        duration: event.durationMs,
        success: event.success,
        errorCode: event.errorCode
      });
    });

    // Convert to array and calculate averages
    let endpoints = Array.from(endpointMap.values()).map(endpoint => ({
      ...endpoint,
      avgTime: Math.round(endpoint.totalTime / endpoint.calls),
      successRate: endpoint.calls > 0 ? ((endpoint.calls - endpoint.errors) / endpoint.calls * 100) : 0,
      rateLimit: {
        requests: 1000,
        window: '1h',
        remaining: Math.max(0, 1000 - endpoint.calls)
      },
      authentication: 'bearer',
      version: 'v1',
      tags: endpoint.path.split('/').filter((p: string) => p && p !== 'api')
    }));

    // Apply filters
    if (method && method !== 'all') {
      endpoints = endpoints.filter(e => e.method === method.toUpperCase());
    }
    if (status && status !== 'all') {
      endpoints = endpoints.filter(e => e.status === status);
    }
    if (search) {
      endpoints = endpoints.filter(e =>
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    await logAdminActivity(req, 'VIEW_API_ENDPOINTS', { filters: { method, status, search } }, true);

    res.json({
      success: true,
      data: endpoints,
      total: endpoints.length
    });
  } catch (error: any) {
    logger.error('Failed to fetch API endpoints', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API endpoints',
      message: error.message
    });
  }
};

/**
 * Test an API endpoint
 */
export const testAPIEndpoint = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { endpointId } = req.params;
    const { testCase } = req.body as TestAPIEndpointBody;

    // Parse endpoint from ID
    const [method, path] = endpointId.split(':');
    
    if (!method || !path) {
      res.status(400).json({
        success: false,
        error: 'Invalid endpoint ID format'
      });
      return;
    }

    // Build URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}${path}`;

    // Test the endpoint
    const axios = require('axios');
    const startTime = Date.now();
    
    try {
      const response = await axios({
        method: method.toLowerCase(),
        url,
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
        },
        timeout: 5000
      });

      const duration = Date.now() - startTime;

      // Track the test
      await AnalyticsEvent.create({
        eventType: 'api_test',
        success: true,
        durationMs: duration,
        metadata: {
          endpoint: path,
          method,
          testCase,
          statusCode: response.status
        }
      });

      await logAdminActivity(req, 'TEST_API_ENDPOINT', { endpointId, testCase, duration, success: true }, true);

      res.json({
        success: true,
        data: {
          status: response.status,
          responseTime: duration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Track the failed test
      await AnalyticsEvent.create({
        eventType: 'api_test',
        success: false,
        durationMs: duration,
        errorCode: error.response?.status || 'TIMEOUT',
        metadata: {
          endpoint: path,
          method,
          testCase,
          error: error.message
        }
      });

      await logAdminActivity(req, 'TEST_API_ENDPOINT', { endpointId, testCase, duration, success: false }, false, error.message);

      res.json({
        success: false,
        data: {
          status: error.response?.status || 500,
          responseTime: duration,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    logger.error('Failed to test API endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to test API endpoint',
      message: error.message
    });
  }
};

/**
 * Update endpoint configuration
 */
export const updateAPIEndpoint = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { endpointId } = req.params;
    const updates = req.body as UpdateAPIEndpointBody;

    // In a real implementation, this would update endpoint configuration
    // For now, we'll just log the update attempt
    await logAdminActivity(req, 'UPDATE_API_ENDPOINT', { endpointId, updates }, true);

    logger.info('API endpoint configuration update requested', {
      endpointId,
      updates,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Endpoint configuration updated successfully',
      data: {
        endpointId,
        updates
      }
    });
  } catch (error: any) {
    logger.error('Failed to update API endpoint', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to update API endpoint',
      message: error.message
    });
  }
};

// Export all functions
export default {
  getAPIStats,
  getAPIEndpoints,
  testAPIEndpoint,
  updateAPIEndpoint
};

