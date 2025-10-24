export default function StoryComposer({ isOpen, onClose, onPublish, petId, petName, className }: {
    isOpen: any;
    onClose: any;
    onPublish: any;
    petId: any;
    petName: any;
    className?: string | undefined;
}): JSX.Element | null;
export declare function useStoryComposer(): {
    isOpen: boolean;
    isComposing: boolean;
    openComposer: () => void;
    closeComposer: () => void;
    publishStory: (storyData: any) => Promise<any>;
};
//# sourceMappingURL=StoryComposer.d.ts.map