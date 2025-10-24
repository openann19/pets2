/**
 * PawfectMatch API Client
 * Production-ready API client for the PawfectMatch application
 */
// Base API URL from environment variable
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';
/**
 * Generic fetch wrapper with error handling and authorization
 */
async function fetchApi(endpoint, options = {}) {
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
export const communityApi = {
    getFeed: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const query = searchParams.toString();
        return fetchApi(`/community/posts${query !== '' ? `?${query}` : ''}`);
    },
    createPost: (payload) => fetchApi('/community/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    likePost: (postId) => fetchApi(`/community/posts/${postId}/like`, {
        method: 'POST',
    }),
    addComment: (postId, content) => fetchApi(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    }),
    getComments: (postId, params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const query = searchParams.toString();
        return fetchApi(`/community/posts/${postId}/comments${query !== '' ? `?${query}` : ''}`);
    },
    reportContent: (payload) => fetchApi('/community/report', {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    blockUser: (userId) => fetchApi(`/community/block/${userId}`, {
        method: 'POST',
    }),
    followUser: (userId) => fetchApi(`/community/follow/${userId}`, {
        method: 'POST',
    }),
    unfollowUser: (userId) => fetchApi(`/community/unfollow/${userId}`, {
        method: 'POST',
    }),
    // Notification subscription management
    subscribeToNotifications: (subscription) => fetchApi('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
    }),
    unsubscribeFromNotifications: (endpoint) => fetchApi('/notifications/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
    }),
};
/**
 * Pets API
 */
export const petsApi = {
    getAll: () => fetchApi('/pets'),
    getById: (id) => fetchApi(`/pets/${id}`),
    create: (pet) => fetchApi('/pets', {
        method: 'POST',
        body: JSON.stringify(pet),
    }),
    update: (id, pet) => fetchApi(`/pets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pet),
    }),
    delete: (id) => fetchApi(`/pets/${id}`, {
        method: 'DELETE',
    }),
    uploadPhoto: async (id, photoBlob) => {
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
    getAll: () => fetchApi('/reminders'),
    getById: (id) => fetchApi(`/reminders/${id}`),
    create: (reminder) => fetchApi('/reminders', {
        method: 'POST',
        body: JSON.stringify(reminder),
    }),
    update: (id, reminder) => fetchApi(`/reminders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reminder),
    }),
    delete: (id) => fetchApi(`/reminders/${id}`, {
        method: 'DELETE',
    }),
    toggleComplete: (id, completed) => fetchApi(`/reminders/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
    }),
};
/**
 * Calendar API
 */
export const calendarApi = {
    getEvents: () => fetchApi('/events'),
    getEventById: (id) => fetchApi(`/events/${id}`),
    createEvent: (event) => fetchApi('/events', {
        method: 'POST',
        body: JSON.stringify(event),
    }),
    updateEvent: (id, event) => fetchApi(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
    }),
    deleteEvent: (id) => fetchApi(`/events/${id}`, {
        method: 'DELETE',
    }),
};
/**
 * Playgrounds API
 */
export const playgroundsApi = {
    getAll: (filters) => fetchApi('/playgrounds', {
        method: 'POST',
        body: JSON.stringify(filters ?? {}),
    }),
    getById: (id) => fetchApi(`/playgrounds/${id}`),
    toggleFavorite: (id, isFavorite) => fetchApi(`/playgrounds/${id}/favorite`, {
        method: 'PUT',
        body: JSON.stringify({ isFavorite }),
    }),
};
/**
 * User API
 */
export const userApi = {
    getProfile: () => fetchApi('/user/profile'),
    updateProfile: (profile) => fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
    }),
    getPreferences: () => fetchApi('/user/preferences'),
    updatePreferences: (preferences) => fetchApi('/user/preferences', {
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