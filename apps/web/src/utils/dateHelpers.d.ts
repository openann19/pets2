/**
 * Date Formatting Utilities for Chat & Messages
 */
export declare function formatMessageTime(timestamp: string | Date): string;
export declare function getDateSeparatorLabel(timestamp: string | Date): string;
export declare function shouldShowDateSeparator(currentMessage: {
    timestamp: string | Date;
}, previousMessage?: {
    timestamp: string | Date;
}): boolean;
export declare function formatLastSeen(lastSeen: string | Date | null | undefined): string;
//# sourceMappingURL=dateHelpers.d.ts.map