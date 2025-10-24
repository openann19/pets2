export declare function EmptyState({ type, title, description, action, secondaryAction, illustration, className, }: {
    type: any;
    title: any;
    description: any;
    action: any;
    secondaryAction: any;
    illustration: any;
    className?: string | undefined;
}): JSX.Element;
export declare function DiscoverEmptyState({ scenario, onRefresh, onStartSwiping, onAdjustFilters, }: {
    scenario?: string | undefined;
    onRefresh: any;
    onStartSwiping: any;
    onAdjustFilters: any;
}): JSX.Element;
export declare function ChatEmptyState({ scenario, onStartSwiping, onSendMessage, }: {
    scenario?: string | undefined;
    onStartSwiping: any;
    onSendMessage: any;
}): JSX.Element;
export declare function NotificationsEmptyState({ onRefresh, }: {
    onRefresh: any;
}): JSX.Element;
export declare function LoadingEmptyState({ type, className, }: {
    type?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function ErrorEmptyState({ title, description, onRetry, onGoBack, }: {
    title?: string | undefined;
    description?: string | undefined;
    onRetry: any;
    onGoBack: any;
}): JSX.Element;
//# sourceMappingURL=EmptyState.d.ts.map