export default function NotificationBell({ count, hasUnread, onClick, size, variant, className, showBadge, bounceOnNew }: {
    count?: number | undefined;
    hasUnread?: boolean | undefined;
    onClick: any;
    size?: string | undefined;
    variant?: string | undefined;
    className?: string | undefined;
    showBadge?: boolean | undefined;
    bounceOnNew?: boolean | undefined;
}): JSX.Element;
export declare function useNotificationBell(): {
    notifications: never[];
    unreadCount: number;
    hasUnread: boolean;
    addNotification: (notification: any) => void;
    markAsRead: (notificationId: any) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
};
//# sourceMappingURL=NotificationBell.d.ts.map