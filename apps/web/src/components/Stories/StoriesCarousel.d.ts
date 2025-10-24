import React from 'react';
export default function StoriesCarousel({ stories, currentStoryIndex, onClose, onStoryChange, onReply, onReaction, onShare, className }: {
    stories: any;
    currentStoryIndex: any;
    onClose: any;
    onStoryChange: any;
    onReply: any;
    onReaction: any;
    onShare: any;
    className?: string | undefined;
}): JSX.Element | null;
export declare function useStories(): {
    stories: never[];
    currentStoryIndex: number;
    isOpen: boolean;
    openStories: (storyIndex?: number) => void;
    closeStories: () => void;
    nextStory: () => void;
    prevStory: () => void;
    addStory: (story: any) => any;
    markAsViewed: (storyId: any) => void;
    addReaction: (storyId: any) => void;
    addReply: (storyId: any) => void;
    setCurrentStoryIndex: React.Dispatch<React.SetStateAction<number>>;
};
//# sourceMappingURL=StoriesCarousel.d.ts.map