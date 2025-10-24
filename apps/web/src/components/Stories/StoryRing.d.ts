export default function StoryRing({ petId, petName, petAvatar, hasUnseenStories, storyCount, onClick, size, className, showCount }: {
    petId: any;
    petName: any;
    petAvatar: any;
    hasUnseenStories: any;
    storyCount: any;
    onClick: any;
    size?: string | undefined;
    className?: string | undefined;
    showCount?: boolean | undefined;
}): JSX.Element;
export declare function StoriesRow({ stories, onStoryClick, className }: {
    stories: any;
    onStoryClick: any;
    className?: string | undefined;
}): JSX.Element;
export declare function useStoryRings(): {
    storyRings: never[];
    updateStoryRing: any;
    markStoriesAsSeen: any;
    addStoryRing: any;
};
//# sourceMappingURL=StoryRing.d.ts.map