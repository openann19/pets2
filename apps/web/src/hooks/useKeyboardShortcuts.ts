import { useEffect, useCallback } from 'react';
export const useKeyboardShortcuts = (shortcuts) => {
    const handleKeyDown = useCallback((event) => {
        for (const shortcut of shortcuts) {
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
            const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatches = shortcut.alt ? event.altKey : !event.altKey;
            const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;
            if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
                event.preventDefault();
                shortcut.callback();
                break;
            }
        }
    }, [shortcuts]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
// Moderation dashboard shortcuts
export const useModerationShortcuts = (actions) => {
    useKeyboardShortcuts([
        {
            key: 'a',
            callback: () => actions.approve?.(),
            description: 'Approve selected item',
        },
        {
            key: 'r',
            callback: () => actions.reject?.(),
            description: 'Reject selected item',
        },
        {
            key: 'ArrowRight',
            callback: () => actions.next?.(),
            description: 'Next item',
        },
        {
            key: 'ArrowLeft',
            callback: () => actions.previous?.(),
            description: 'Previous item',
        },
        {
            key: 'a',
            ctrl: true,
            callback: () => actions.bulkSelect?.(),
            description: 'Select all',
        },
        {
            key: 'f',
            ctrl: true,
            callback: () => actions.search?.(),
            description: 'Focus search',
        },
    ]);
};
//# sourceMappingURL=useKeyboardShortcuts.js.map