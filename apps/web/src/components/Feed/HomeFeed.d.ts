export default function HomeFeed({ posts, onLoadMore, onLike, onComment, onShare, onBookmark, className }: {
    posts: any;
    onLoadMore: any;
    onLike: any;
    onComment: any;
    onShare: any;
    onBookmark: any;
    className?: string | undefined;
}): JSX.Element;
export declare function useHomeFeed(): {
    posts: never[];
    isLoading: boolean;
    hasMore: boolean;
    loadMorePosts: () => Promise<any>;
    refreshFeed: () => Promise<void>;
};
//# sourceMappingURL=HomeFeed.d.ts.map