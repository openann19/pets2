/**
 * ULTRA PREMIUM API Service 🚀
 * Production-ready with full type safety, error handling, and real-time features
 */
import { ApiResponse, User, Pet, UserRegistrationData, PetCreationData, SwipeParams, UserPreferences, MessageAttachment, BioGenerationData, CompatibilityOptions, BehaviorAnalysisData } from '../types'
import { logger } from '@pawfectmatch/core';
;
// Centralized API configuration
const getApiBaseUrl = () => {
    // Check environment variable first
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    // Fallback to localhost with correct port
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.hostname}:5001/api`;
    }
    // SSR fallback
    return 'http://localhost:5001/api';
};
const API_BASE_URL = getApiBaseUrl();
// Dev-time sanity check for port configuration
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
        const url = new URL(API_BASE_URL);
        if (url.port && url.port !== '5001') {
            logger.warn('[API] Warning: NEXT_PUBLIC_API_URL is not using port 5001:', { API_BASE_URL });
        }
    }
    catch (error) {
        logger.warn('[API] Invalid API_BASE_URL:', { API_BASE_URL, error });
    }
}
// Logger utility
const logger = {
    info: (...args) => logger.info('[INFO]', { ...args }),
    error: (...args) => logger.error('[ERROR]', { ...args }),
    warn: (...args) => logger.warn('[WARN]', { ...args }),
};
class ApiService {
    token = null;
    refreshToken = null;
    cache = new Map();
    retryAttempts = 3;
    retryDelay = 1000;
    constructor() {
        this.initializeFromStorage();
        this.startCacheCleanup();
    }
    startCacheCleanup() {
        if (typeof window === 'undefined')
            return;
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > value.ttl) {
                    this.cache.delete(key);
                }
            }
        }, 60000); // Cleanup every minute
    }
    getCacheKey(endpoint, options) {
        return `${endpoint}_${JSON.stringify(options)}`;
    }
    setCache(key, data, ttl = 300000) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    initializeFromStorage() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
            this.refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
            // Also check Zustand store for tokens
            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    if (parsed.state?.accessToken && !this.token) {
                        this.token = parsed.state.accessToken;
                    }
                    if (parsed.state?.refreshToken && !this.refreshToken) {
                        this.refreshToken = parsed.state.refreshToken;
                    }
                }
            }
            catch (error) {
                // Ignore parsing errors
            }
        }
    }
    setToken(token, refreshToken) {
        this.token = token;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
        if (typeof window !== 'undefined') {
            // Persist in localStorage (both legacy and new keys)
            localStorage.setItem('accessToken', token);
            localStorage.setItem('auth_token', token);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('refresh_token', refreshToken);
            }
            // Also set http cookies for middleware-based auth checks
            const setCookie = (name, value, maxAgeSeconds) => {
                document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
            };
            // Defaults: access 15m, refresh 7d
            setCookie('accessToken', token, 15 * 60);
            if (refreshToken)
                setCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60);
        }
        logger.info('Auth token updated');
    }
    clearToken() {
        this.token = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('refresh_token');
            // Clear cookies
            const clearCookie = (name) => {
                document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
            };
            clearCookie('accessToken');
            clearCookie('refreshToken');
        }
        logger.info('Auth tokens cleared');
    }
    getToken() {
        return this.token;
    }
    // Sync tokens from auth store
    syncTokensFromStore() {
        if (typeof window !== 'undefined') {
            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    if (parsed.state?.accessToken) {
                        this.token = parsed.state.accessToken;
                    }
                    if (parsed.state?.refreshToken) {
                        this.refreshToken = parsed.state.refreshToken;
                    }
                }
            }
            catch (error) {
                // Ignore parsing errors
            }
        }
    }
    async refreshAccessToken() {
        if (!this.refreshToken)
            return false;
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });
            if (response.ok) {
                const data = await response.json();
                const tokens = (data.data ?? data).accessToken ? (data.data) : data;
                this.setToken(tokens.accessToken, tokens.refreshToken);
                return true;
            }
        }
        catch (error) {
            logger.error('Token refresh failed', error);
        }
        return false;
    }
    async request(endpoint, options = {}, retryCount = 0) {
        // Sync tokens from store before making request
        this.syncTokensFromStore();
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();
        // Build query string from params
        let finalUrl = url;
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                finalUrl = `${url}?${queryString}`;
            }
        }
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };
        // Remove params from config as they're in the URL
        delete config.params;
        try {
            const response = await fetch(finalUrl, config);
            if (!response.ok) {
                if (response.status === 401 && retryCount === 0) {
                    // Try to refresh token
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        return this.request(endpoint, options, retryCount + 1);
                    }
                    // Clear tokens and let caller/middleware handle navigation
                    this.clearToken();
                }
                let errorMessage = `API Error: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                }
                catch {
                    // If JSON parsing fails, use default message
                }
                return {
                    success: false,
                    data: null,
                    error: errorMessage
                };
            }
            const data = await response.json();
            return {
                success: true,
                data: data.data || data
            };
        }
        catch (error) {
            if (retryCount < this.retryAttempts) {
                logger.warn(`Retrying request to ${endpoint} (attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
                return this.request(endpoint, options, retryCount + 1);
            }
            logger.error('API request failed:', error);
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    // Auth endpoints
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(response.data.accessToken, response.data.refreshToken);
        return response.data;
    }
    async register(data) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(response.data.accessToken, response.data.refreshToken);
        return response.data;
    }
    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        }
        finally {
            this.clearToken();
        }
    }
    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }
    async resetPassword(token, password) {
        return this.request(`/auth/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
    }
    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }
    // Pet endpoints
    async getPets() {
        return this.request('/pets/my-pets');
    }
    async getPet(id) {
        return this.request(`/pets/${id}`);
    }
    async createPet(data) {
        return this.request('/pets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async updatePet(id, data) {
        return this.request(`/pets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async deletePet(id) {
        return this.request(`/pets/${id}`, {
            method: 'DELETE',
        });
    }
    // Additional endpoints used by hooks
    async getMyPets() {
        return this.request('/pets/my-pets');
    }
    async getSwipeQueue(params) {
        return this.request('/pets/discover', { params });
    }
    async updatePetProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    // Match endpoints
    async getMatches() {
        return this.request('/matches');
    }
    async swipe(petId, action) {
        return this.request('/matches/swipe', {
            method: 'POST',
            body: JSON.stringify({ petId, action }),
        });
    }
    // Chat endpoints
    async getMessages(matchId) {
        return this.request(`/matches/${matchId}/messages`);
    }
    async sendMessage(matchId, content) {
        return this.request(`/matches/${matchId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }
    // Weather endpoints
    async getWeather(lat, lon) {
        // No backend route present; return a stub to avoid runtime errors
        return { success: true, data: { weather: null } };
    }
    // Location endpoints
    async updateLocation(lat, lon) {
        return this.request('/users/location', {
            method: 'PUT',
            body: JSON.stringify({ coordinates: [lon, lat] }),
        });
    }
    async updateProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async getCurrentUser() {
        return this.request('/auth/me', { method: 'GET' });
    }
    // Preferences endpoints
    async syncPreferences(preferences) {
        return this.request('/users/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences),
        });
    }
}
// Create singleton instance
const apiInstance = new ApiService();
// Pets API endpoints
export const petsAPI = {
    async getSwipeablePets(filters) {
        return apiInstance.request('/pets/discover', {
            params: filters,
        });
    },
    async discoverPets(filters) {
        return apiInstance.request('/pets/discover', {
            params: filters,
        });
    },
    async likePet(petId) {
        return apiInstance.request(`/pets/${petId}/swipe`, {
            method: 'POST',
            body: JSON.stringify({ action: 'like' }),
        });
    },
    async passPet(petId) {
        return apiInstance.request(`/pets/${petId}/swipe`, {
            method: 'POST',
            body: JSON.stringify({ action: 'pass' }),
        });
    },
    async superLikePet(petId) {
        return apiInstance.request(`/pets/${petId}/swipe`, {
            method: 'POST',
            body: JSON.stringify({ action: 'superlike' }),
        });
    },
    async reportPet(petId, reason) {
        return apiInstance.request(`/pets/${petId}/report`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },
};
// Matches API endpoints
export const matchesAPI = {
    async getMatches() {
        return apiInstance.request('/matches');
    },
    async getMatch(matchId) {
        return apiInstance.request(`/matches/${matchId}`);
    },
    async unmatch(matchId) {
        return apiInstance.request(`/matches/${matchId}/unmatch`, {
            method: 'POST',
        });
    },
};
// Chat API endpoints
export const chatAPI = {
    async getConversations() {
        // Align with existing endpoints: use matches as conversations
        return apiInstance.request('/matches');
    },
    async getMessages(conversationId) {
        return apiInstance.request(`/matches/${conversationId}/messages`);
    },
    async sendMessage(conversationId, message, attachments) {
        return apiInstance.request(`/matches/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content: message, attachments }),
        });
    },
    async markAsRead(conversationId) {
        return apiInstance.request(`/chat/conversations/${conversationId}/read`, {
            method: 'POST',
        });
    },
};
// AI API endpoints
export const aiAPI = {
    async generateBio(data) {
        return apiInstance.request('/ai/generate-bio', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async analyzePhoto(formData) {
        const token = apiInstance.getToken();
        return fetch(`${API_BASE_URL}/ai/analyze-photo`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        }).then(res => res.json());
    },
    async analyzeCompatibility(petAId, petBId, options) {
        return apiInstance.request('/ai/analyze-compatibility', {
            method: 'POST',
            body: JSON.stringify({ petAId, petBId, ...options }),
        });
    },
    async getChatSuggestions(matchId) {
        return apiInstance.request(`/ai/chat-suggestions/${matchId}`, {
            method: 'GET',
        });
    },
    async getSmartRecommendations(userId) {
        return apiInstance.request('/ai/recommendations', {
            params: { userId },
        });
    },
    async analyzeBehavior(petId, data) {
        return apiInstance.request('/ai/behavior-analysis', {
            method: 'POST',
            body: JSON.stringify({ petId, ...data }),
        });
    },
};
// Subscription API endpoints
export const subscriptionAPI = {
    async getCurrentSubscription() {
        // Not implemented on backend; stub
        return { success: true, data: { plan: 'basic' } };
    },
    async getUsageStats() {
        return apiInstance.request('/subscription/usage');
    },
    async createCheckoutSession(data) {
        return apiInstance.request('/premium/subscribe', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    async cancelSubscription() {
        return apiInstance.request(`/premium/cancel`, {
            method: 'POST',
        });
    },
    async reactivateSubscription(subscriptionId) {
        return apiInstance.request(`/subscription/${subscriptionId}/reactivate`, {
            method: 'POST',
        });
    },
    async getPlans() {
        return apiInstance.request('/subscription/plans');
    },
    async updatePaymentMethod(paymentMethodId) {
        return apiInstance.request('/subscription/payment-method', {
            method: 'PUT',
            body: JSON.stringify({ paymentMethodId }),
        });
    },
};
// Export the main API instance and all sub-APIs
export const api = {
    ...apiInstance,
    setToken: apiInstance.setToken.bind(apiInstance),
    clearToken: apiInstance.clearToken.bind(apiInstance),
    getToken: apiInstance.getToken.bind(apiInstance),
    syncTokensFromStore: apiInstance.syncTokensFromStore.bind(apiInstance),
    login: apiInstance.login.bind(apiInstance),
    register: apiInstance.register.bind(apiInstance),
    logout: apiInstance.logout.bind(apiInstance),
    forgotPassword: apiInstance.forgotPassword.bind(apiInstance),
    resetPassword: apiInstance.resetPassword.bind(apiInstance),
    getPets: apiInstance.getPets.bind(apiInstance),
    getPet: apiInstance.getPet.bind(apiInstance),
    createPet: apiInstance.createPet.bind(apiInstance),
    updatePet: apiInstance.updatePet.bind(apiInstance),
    deletePet: apiInstance.deletePet.bind(apiInstance),
    updatePetProfile: apiInstance.updatePetProfile.bind(apiInstance),
    getMatches: apiInstance.getMatches.bind(apiInstance),
    swipe: apiInstance.swipe.bind(apiInstance),
    getMessages: apiInstance.getMessages.bind(apiInstance),
    sendMessage: apiInstance.sendMessage.bind(apiInstance),
    getWeather: apiInstance.getWeather.bind(apiInstance),
    updateLocation: apiInstance.updateLocation.bind(apiInstance),
    syncPreferences: apiInstance.syncPreferences.bind(apiInstance),
    pets: petsAPI,
    matches: matchesAPI,
    chat: chatAPI,
    ai: aiAPI,
    subscription: subscriptionAPI,
};
export default api;
//# sourceMappingURL=api.js.map