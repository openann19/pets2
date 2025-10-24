/**
 * Realtime domain types shared across web, mobile and backend.
 * These are used by Socket.io events for Phase-3/4 features.
 */
export interface PulsePin {
    _id: string;
    petId: string;
    ownerId: string;
    coordinates: [number, number];
    activity: 'walking' | 'playing' | 'grooming' | 'vet' | 'park' | 'other';
    message?: string;
    createdAt: string;
}
export interface MemoryNode {
    _id: string;
    matchId: string;
    summary: string;
    highlights: string[];
    imageUrl?: string;
    createdAt: string;
}
export interface SuggestionEvent {
    matchId: string;
    senderId: string;
    suggestionType: 'schedule_playdate' | 'share_photo' | 'share_location';
    payload: Record<string, string | number | boolean>;
}
//# sourceMappingURL=realtime.d.ts.map