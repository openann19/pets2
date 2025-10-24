/**
 * 🛠️ ADMIN API SERVICE
 * Complete API service for admin panel functionality
 */
import { AdminStats, User, Pet, Match, SystemLog, NotificationRequest, SystemHealth, MemoryUsage, ApiResponse } from '@/types'
import { logger } from '@pawfectmatch/core';
;
// HTTP Client for Admin API
class AdminHttpClient {
    baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    token = null;
    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken');
        }
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...options.headers,
            },
        };
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            logger.error(`Admin API request failed: ${endpoint}`, { error });
            throw error;
        }
    }
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
class AdminApiService {
    http = new AdminHttpClient();
    baseUrl = '/admin';
    /**
     * Get comprehensive platform statistics
     */
    async getStats() {
        const response = await this.http.get(`${this.baseUrl}/stats`);
        return response.data;
    }
    /**
     * Get all users with pagination and filtering
     */
    async getUsers(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page)
            queryParams.append('page', params.page.toString());
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.search)
            queryParams.append('search', params.search);
        if (params.status)
            queryParams.append('status', params.status);
        const response = await this.http.get(`${this.baseUrl}/users?${queryParams}`);
        return response.data;
    }
    /**
     * Update user information
     */
    async updateUser(userId, updates) {
        const response = await this.http.put(`${this.baseUrl}/users/${userId}`, updates);
        return response.data;
    }
    /**
     * Delete user and all associated data
     */
    async deleteUser(userId) {
        await this.http.delete(`${this.baseUrl}/users/${userId}`);
    }
    /**
     * Get all pets with filtering
     */
    async getPets(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page)
            queryParams.append('page', params.page.toString());
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.species)
            queryParams.append('species', params.species);
        if (params.search)
            queryParams.append('search', params.search);
        const response = await this.http.get(`${this.baseUrl}/pets?${queryParams}`);
        return response.data;
    }
    /**
     * Get all matches with filtering
     */
    async getMatches(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page)
            queryParams.append('page', params.page.toString());
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.status)
            queryParams.append('status', params.status);
        const response = await this.http.get(`${this.baseUrl}/matches?${queryParams}`);
        return response.data;
    }
    /**
     * Get system metrics
     */
    async getMetrics() {
        const response = await this.http.get(`${this.baseUrl}/metrics`);
        return response.data;
    }
    /**
     * Reset system metrics
     */
    async resetMetrics() {
        await this.http.post(`${this.baseUrl}/metrics/reset`);
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const response = await this.http.get(`${this.baseUrl}/cache/stats`);
        return response.data;
    }
    /**
     * Clear all cache
     */
    async clearCache() {
        const response = await this.http.post(`${this.baseUrl}/cache/clear`);
        return response.data;
    }
    /**
     * Invalidate cache by pattern
     */
    async invalidateCache(pattern) {
        const response = await this.http.post(`${this.baseUrl}/cache/invalidate`, { pattern });
        return response.data;
    }
    /**
     * Get system information
     */
    async getSystemInfo() {
        const response = await this.http.get(`${this.baseUrl}/system/info`);
        return response.data;
    }
    /**
     * Send notification to users
     */
    async sendNotification(request) {
        const response = await this.http.post(`${this.baseUrl}/notifications/send`, request);
        return response.data;
    }
    /**
     * Get system logs
     */
    async getLogs(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.level)
            queryParams.append('level', params.level);
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.search)
            queryParams.append('search', params.search);
        const response = await this.http.get(`${this.baseUrl}/logs?${queryParams}`);
        return response.data;
    }
    /**
     * Restart system services
     */
    async restartSystem(service = 'all') {
        await this.http.post(`${this.baseUrl}/system/restart`, { service });
    }
    /**
     * Create database backup
     */
    async createBackup(type = 'full') {
        const response = await this.http.post(`${this.baseUrl}/database/backup`, { type });
        return response.data;
    }
    /**
     * Get API endpoint statistics
     */
    async getApiEndpoints() {
        // This would typically come from your monitoring system
        // For now, return mock data
        return [
            { method: 'GET', path: '/api/users', calls: 1250, avgTime: '45ms', errors: 2 },
            { method: 'POST', path: '/api/pets', calls: 890, avgTime: '120ms', errors: 5 },
            { method: 'GET', path: '/api/matches', calls: 2100, avgTime: '65ms', errors: 1 },
            { method: 'POST', path: '/api/auth/login', calls: 3400, avgTime: '85ms', errors: 12 },
            { method: 'GET', path: '/api/pets/discover', calls: 5600, avgTime: '95ms', errors: 8 },
            { method: 'POST', path: '/api/premium/subscribe', calls: 450, avgTime: '200ms', errors: 3 },
            { method: 'GET', path: '/api/analytics/user', calls: 1800, avgTime: '75ms', errors: 4 },
            { method: 'POST', path: '/api/messages/send', calls: 3200, avgTime: '55ms', errors: 6 },
        ];
    }
    /**
     * Get system health status
     */
    async getSystemHealth() {
        // This would typically come from your monitoring system
        // For now, return mock data
        return {
            status: 'healthy',
            services: [
                { name: 'Server', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
                { name: 'Database', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
                { name: 'Redis Cache', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
                { name: 'WebSocket', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
                { name: 'AI Service', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
                { name: 'CDN', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
            ]
        };
    }
    /**
     * Export user data
     */
    async exportUserData(userId) {
        const response = await fetch(`${this.baseUrl}/users/${userId}/export`, {
            headers: {
                ...(this.http['token'] && { Authorization: `Bearer ${this.http['token']}` }),
            },
        });
        return response.blob();
    }
    /**
     * Bulk user operations
     */
    async bulkUserOperation(operation, userIds, data) {
        const response = await this.http.post(`${this.baseUrl}/users/bulk`, {
            operation,
            userIds,
            data
        });
        return response.data;
    }
    /**
     * Get platform analytics
     */
    async getPlatformAnalytics(period = 'month') {
        const response = await this.http.get(`${this.baseUrl}/analytics/platform?period=${period}`);
        return response.data;
    }
    /**
     * Manage feature flags
     */
    async getFeatureFlags() {
        const response = await this.http.get(`${this.baseUrl}/features/flags`);
        return response.data;
    }
    async updateFeatureFlag(name, enabled) {
        await this.http.put(`${this.baseUrl}/features/flags/${name}`, { enabled });
    }
    /**
     * Security operations
     */
    async getSecurityAlerts() {
        const response = await this.http.get(`${this.baseUrl}/security/alerts`);
        return response.data;
    }
    async resolveSecurityAlert(alertId) {
        await this.http.put(`${this.baseUrl}/security/alerts/${alertId}/resolve`);
    }
    /**
     * Content moderation
     */
    async getModerationQueue() {
        const response = await this.http.get(`${this.baseUrl}/moderation/queue`);
        return response.data;
    }
    async moderateContent(contentId, action, reason) {
        await this.http.post(`${this.baseUrl}/moderation/${contentId}`, { action, reason });
    }
}
// Create singleton instance
const adminApiService = new AdminApiService();
export default adminApiService;
//# sourceMappingURL=adminApi.js.map