/**
 * PawfectMatch API Client
 * Production-ready API client for the PawfectMatch application
 */
// Base API URL from environment variable
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';

interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    [key: string]: unknown;
}

/**
 * Generic fetch wrapper with error handling and authorization
 */
async function fetchApi(endpoint: string, options: FetchOptions = {}): Promise<unknown> {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    const { headers: optionHeaders, ...restOptions } = options;
    const headers = new Headers(optionHeaders);
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (token !== null) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `API error: ${response.status.toString()}`);
    }
    if (response.status === 204) {
        return {};
    }
    return response.json();
}

interface FeedParams {
    page?: number;
    limit?: number;
    [key: string]: unknown;
}

interface CreatePostPayload {
    content: string;
    images?: string[];
    [key: string]: unknown;
}

export const communityApi = {
    getFeed: (params: FeedParams = {}): Promise<unknown> => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const query = searchParams.toString();
        return fetchApi(`/community/posts${query !== '' ? `?${query}` : ''}`);
    },
    createPost: (payload: CreatePostPayload): Promise<unknown> => fetchApi('/community/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    likePost: (postId: string): Promise<unknown> => fetchApi(`/community/posts/${postId}/like`, {
        method: 'POST',
    }),
    addComment: (postId: string, content: string): Promise<unknown> => fetchApi(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    }),
    getComments: (postId: string, params: FeedParams = {}): Promise<unknown> => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const query = searchParams.toString();
        return fetchApi(`/community/posts/${postId}/comments${query !== '' ? `?${query}` : ''}`);
    },
    reportContent: (payload: Record<string, unknown>): Promise<unknown> => fetchApi('/community/report', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    blockUser: (userId: string): Promise<unknown> => fetchApi(`/community/block/${userId}`, {
        method: 'POST',
    }),
    followUser: (userId: string): Promise<unknown> => fetchApi(`/community/follow/${userId}`, {
        method: 'POST',
    }),
    unfollowUser: (userId: string): Promise<unknown> => fetchApi(`/community/unfollow/${userId}`, {
        method: 'POST',
    }),
    // Notification subscription management
    subscribeToNotifications: (subscription: Record<string, unknown>): Promise<unknown> => fetchApi('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
    }),
    unsubscribeFromNotifications: (endpoint: string): Promise<unknown> => fetchApi('/notifications/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
    }),
};

/**
 * Pets API
 */
export const petsApi = {
    getAll: (): Promise<unknown> => fetchApi('/pets'),
    getById: (id: string): Promise<unknown> => fetchApi(`/pets/${id}`),
    create: (pet: Record<string, unknown>): Promise<unknown> => fetchApi('/pets', {
        method: 'POST',
        body: JSON.stringify(pet),
    }),
    update: (id: string, pet: Record<string, unknown>): Promise<unknown> => fetchApi(`/pets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pet),
    }),
    delete: (id: string): Promise<unknown> => fetchApi(`/pets/${id}`, {
        method: 'DELETE',
    }),
    uploadPhoto: async (id: string, photoBlob: Blob): Promise<unknown> => {
        const formData = new FormData();
        formData.append('photo', photoBlob);
        const response = await fetch(`${API_BASE_URL}/pets/${id}/photo`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload photo');
        }
        return response.json();
    },
};

/**
 * Reminders API
 */
export const remindersApi = {
    getAll: (): Promise<unknown> => fetchApi('/reminders'),
    getById: (id: string): Promise<unknown> => fetchApi(`/reminders/${id}`),
    create: (reminder: Record<string, unknown>): Promise<unknown> => fetchApi('/reminders', {
        method: 'POST',
        body: JSON.stringify(reminder),
    }),
    update: (id: string, reminder: Record<string, unknown>): Promise<unknown> => fetchApi(`/reminders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reminder),
    }),
    delete: (id: string): Promise<unknown> => fetchApi(`/reminders/${id}`, {
        method: 'DELETE',
    }),
    toggleComplete: (id: string, completed: boolean): Promise<unknown> => fetchApi(`/reminders/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
    }),
};

/**
 * Calendar API
 */
export const calendarApi = {
    getEvents: (): Promise<unknown> => fetchApi('/events'),
    getEventById: (id: string): Promise<unknown> => fetchApi(`/events/${id}`),
    createEvent: (event: Record<string, unknown>): Promise<unknown> => fetchApi('/events', {
        method: 'POST',
        body: JSON.stringify(event),
    }),
    updateEvent: (id: string, event: Record<string, unknown>): Promise<unknown> => fetchApi(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
    }),
    deleteEvent: (id: string): Promise<unknown> => fetchApi(`/events/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * Playgrounds API
 */
export const playgroundsApi = {
    getAll: (filters?: Record<string, unknown>): Promise<unknown> => fetchApi('/playgrounds', {
        method: 'POST',
        body: JSON.stringify(filters ?? {}),
    }),
    getById: (id: string): Promise<unknown> => fetchApi(`/playgrounds/${id}`),
    toggleFavorite: (id: string, isFavorite: boolean): Promise<unknown> => fetchApi(`/playgrounds/${id}/favorite`, {
        method: 'PUT',
        body: JSON.stringify({ isFavorite }),
    }),
};

/**
 * User API
 */
export const userApi = {
    getProfile: (): Promise<unknown> => fetchApi('/user/profile'),
    updateProfile: (profile: Record<string, unknown>): Promise<unknown> => fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
    }),
    getPreferences: (): Promise<unknown> => fetchApi('/user/preferences'),
    updatePreferences: (preferences: Record<string, unknown>): Promise<unknown> => fetchApi('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
    }),
};
const apiClient = {
    pets: petsApi,
    reminders: remindersApi,
    calendar: calendarApi,
    playgrounds: playgroundsApi,
    user: userApi,
    community: communityApi,
};
export default apiClient;
//# sourceMappingURL=apiClient.js.map