/**
 * Story Types
 * 
 * Shared types for ephemeral stories feature
 */

export interface StoryView {
    userId: string;
    viewedAt: string;
}

export interface StoryReply {
    _id?: string;
    userId: string;
    message: string;
    createdAt: string;
}

export interface Story {
    _id: string;
    userId: string;
    mediaType: 'photo' | 'video';
    mediaUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    duration: number; // seconds
    views: StoryView[];
    viewCount: number;
    replies: StoryReply[];
    replyCount: number;
    createdAt: string;
    expiresAt: string;
    updatedAt?: string;
    isActive?: boolean;
    timeRemaining?: number;
}

export interface StoryUser {
    _id: string;
    name: string;
    username: string;
    profilePhoto?: string;
}

export interface StoryGroup {
    userId: string;
    user: StoryUser;
    stories: Story[];
    storyCount: number;
    hasUnseen: boolean;
    latestStoryTime: string;
}

export interface CreateStoryPayload {
    mediaType: 'photo' | 'video';
    media: File | Blob;
    caption?: string;
    duration?: number;
}

export interface CreateStoryResponse {
    success: boolean;
    story: Story;
}

export interface StoriesFeedResponse {
    success: boolean;
    stories: StoryGroup[];
}

export interface UserStoriesResponse {
    success: boolean;
    stories: Story[];
}

export interface ViewStoryPayload {
    storyId: string;
}

export interface ViewStoryResponse {
    success: boolean;
    isNewView: boolean;
    viewCount: number;
}

export interface ReplyToStoryPayload {
    storyId: string;
    message: string;
}

export interface ReplyToStoryResponse {
    success: boolean;
    replyCount: number;
}

export interface StoryViewsResponse {
    success: boolean;
    views: Array<{
        userId: StoryUser;
        viewedAt: string;
    }>;
    viewCount: number;
}

// ============================================================================
// Socket.io Events
// ============================================================================

export interface StoryCreatedEvent {
    userId: string;
    storyId: string;
    userName: string;
}

export interface StoryViewedEvent {
    storyId: string;
    viewerId: string;
    viewerName: string;
    viewCount: number;
}

export interface StoryReplyEvent {
    storyId: string;
    replierId: string;
    replierName: string;
    message: string;
}

export interface StoryDeletedEvent {
    storyId: string;
    userId: string;
}

// ============================================================================
// Client State
// ============================================================================

export interface StoryViewerState {
    currentStoryGroupIndex: number;
    currentStoryIndex: number;
    isPaused: boolean;
    isMuted: boolean;
}

export interface StoriesBarState {
    isLoading: boolean;
    storyGroups: StoryGroup[];
    error: string | null;
}
