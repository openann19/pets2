interface Post {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    likes?: number;
}
interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
}
interface FeedUpdate {
    type: 'new_post' | 'like' | 'comment' | 'delete';
    postId?: string;
    post?: Post;
    userId?: string;
    comment?: Comment;
}
interface UseRealtimeFeedOptions {
    onUpdate: (data: FeedUpdate) => void;
    userId?: string;
    autoConnect?: boolean;
}
export declare const useRealtimeFeed: ({ onUpdate, userId, autoConnect, }: UseRealtimeFeedOptions) => {
    connect: () => void;
    disconnect: () => void;
    emit: (event: string, data: unknown) => void;
    isConnected: boolean;
};
export declare const useFeedActions: (userId?: string) => {
    createPost: (post: Post) => void;
    likePost: (postId: string) => void;
    commentOnPost: (postId: string, comment: string) => void;
    deletePost: (postId: string) => void;
};
export {};
//# sourceMappingURL=useRealtimeFeed.d.ts.map