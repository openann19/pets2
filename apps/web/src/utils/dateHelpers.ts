/**
 * Date Formatting Utilities for Chat & Messages
 */
export function formatMessageTime(timestamp) {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) {
        return '';
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = today.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    // Time part
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    // Today: just show time
    if (diffDays === 0) {
        return timeStr;
    }
    // Yesterday
    if (diffDays === 1) {
        return `Yesterday ${timeStr}`;
    }
    // Within the last week: show day name
    if (diffDays < 7) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${dayName} ${timeStr}`;
    }
    // Older: show date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
export function getDateSeparatorLabel(timestamp) {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) {
        return '';
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = today.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        return 'Today';
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
}
export function shouldShowDateSeparator(currentMessage, previousMessage) {
    if (!previousMessage) {
        return true; // Always show for first message
    }
    const currentDate = typeof currentMessage.timestamp === 'string'
        ? new Date(currentMessage.timestamp)
        : currentMessage.timestamp;
    const prevDate = typeof previousMessage.timestamp === 'string'
        ? new Date(previousMessage.timestamp)
        : previousMessage.timestamp;
    if (isNaN(currentDate.getTime()) || isNaN(prevDate.getTime())) {
        return false;
    }
    // Show separator if messages are on different days
    return currentDate.toDateString() !== prevDate.toDateString();
}
export function formatLastSeen(lastSeen) {
    if (!lastSeen) {
        return 'Offline';
    }
    const date = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
    if (isNaN(date.getTime())) {
        return 'Offline';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) {
        return 'Just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}
//# sourceMappingURL=dateHelpers.js.map