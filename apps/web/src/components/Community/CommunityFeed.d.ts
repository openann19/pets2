import React from 'react';
interface CommunityFeedProps {
    userId?: string;
    onCreatePost?: (content: string) => void;
    onLikePost?: (postId: string) => void;
    onCommentOnPost?: (postId: string, content: string) => void;
    onSharePost?: (postId: string) => void;
    onJoinActivity?: (activityId: string) => void;
}
export declare const CommunityFeed: React.FC<CommunityFeedProps>;
export {};
//# sourceMappingURL=CommunityFeed.d.ts.map