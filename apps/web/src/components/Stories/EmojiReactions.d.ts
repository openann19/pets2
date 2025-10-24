export default function EmojiReactions({ isVisible, onReaction, onClose, className }: {
    isVisible: any;
    onReaction: any;
    onClose: any;
    className?: string | undefined;
}): JSX.Element | null;
export declare function useEmojiReactions(): {
    reactions: never[];
    isVisible: boolean;
    showReactions: () => void;
    hideReactions: () => void;
    addReaction: (emoji: any, position: any, userId: any, userName: any) => string;
    removeReaction: (reactionId: any) => void;
    clearAllReactions: () => void;
};
//# sourceMappingURL=EmojiReactions.d.ts.map