import { type CommunityPost } from '@/services/apiClient';
export interface UseCommunityFeedReturn {
    posts: CommunityPost[];
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    hasNextPage: boolean;
    error: string | null;
    newPostContent: string;
    selectedPost: CommunityPost | null;
    commentInputs: Record<string, string>;
    isSubmittingPost: boolean;
    likeSubmitting: Record<string, boolean>;
    commentSubmitting: Record<string, boolean>;
    showReportDialog: boolean;
    reportingTarget: {
        type: 'post' | 'user' | 'comment';
        id: string;
        userId?: string;
    } | null;
    moderation: {
        blockedUsers: Set<string>;
        reportedContent: Set<string>;
        isReporting: boolean;
        reportReason: string;
        reportDetails: string;
    };
    setNewPostContent: (content: string) => void;
    setSelectedPost: (post: CommunityPost | null) => void;
    setCommentInput: (postId: string, comment: string) => void;
    handleCreatePost: () => Promise<void>;
    handleLike: (postId: string) => Promise<void>;
    handleComment: (postId: string) => Promise<void>;
    refreshFeed: () => Promise<void>;
    loadMorePosts: () => Promise<void>;
    handleReport: (type: 'post' | 'user' | 'comment', id: string, userId?: string) => void;
    submitReport: () => Promise<void>;
    handleBlockUser: (userId: string) => Promise<void>;
    setShowReportDialog: (show: boolean) => void;
    updateModeration: (updates: Partial<typeof moderation>) => void;
}
export declare const useCommunityFeed: () => UseCommunityFeedReturn;
//# sourceMappingURL=useCommunityFeed.d.ts.map