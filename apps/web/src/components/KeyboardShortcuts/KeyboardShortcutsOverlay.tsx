/**
 * 🎹 KEYBOARD SHORTCUTS OVERLAY
 * Global keyboard shortcuts reference panel
 * Press '?' to toggle display
 */
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
const shortcuts = [
    // Navigation
    { keys: ['?'], description: 'Show/hide shortcuts', category: 'General' },
    { keys: ['Esc'], description: 'Close modal or cancel', category: 'General' },
    { keys: ['Tab'], description: 'Navigate to next element', category: 'Navigation' },
    { keys: ['Shift', 'Tab'], description: 'Navigate to previous element', category: 'Navigation' },
    // Swipe Actions
    { keys: ['←'], description: 'Pass on current pet', category: 'Actions' },
    { keys: ['→'], description: 'Like current pet', category: 'Actions' },
    { keys: ['↑'], description: 'Super like current pet', category: 'Actions' },
    { keys: ['Space'], description: 'Activate focused button', category: 'Actions' },
    { keys: ['Enter'], description: 'Activate focused button', category: 'Actions' },
    // Chat
    { keys: ['Ctrl', 'Enter'], description: 'Send message (Mac: Cmd+Enter)', category: 'Chat' },
    { keys: ['↑', '↓'], description: 'Navigate messages', category: 'Chat' },
    // Admin
    { keys: ['Ctrl', 'K'], description: 'Quick search (Mac: Cmd+K)', category: 'Admin' },
    { keys: ['Ctrl', 'R'], description: 'Refresh data (Mac: Cmd+R)', category: 'Admin' },
];
export const KeyboardShortcutsOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);
    /**
     * Toggle overlay visibility
     */
    const toggleOverlay = useCallback(() => {
        setIsVisible((prev) => !prev);
    }, []);
    /**
     * Handle keyboard events
     */
    const handleKeyDown = useCallback((event) => {
        // Toggle with '?' key (Shift + /)
        if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            toggleOverlay();
        }
        // Close with Escape
        if (event.key === 'Escape' && isVisible) {
            event.preventDefault();
            setIsVisible(false);
        }
    }, [isVisible, toggleOverlay]);
    /**
     * Setup keyboard listener
     */
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); };
    }, [handleKeyDown]);
    /**
     * Group shortcuts by category
     */
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        const category = acc[shortcut.category];
        if (category) {
            category.push(shortcut);
        }
        return acc;
    }, {});
    return (<AnimatePresence>
            {isVisible && (<>
                    {/* Backdrop */}
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsVisible(false); }} aria-hidden="true"/>

                    {/* Overlay Panel */}
                    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <h2 id="shortcuts-title" className="text-2xl font-bold">
                                        ⌨️ Keyboard Shortcuts
                                    </h2>
                                    <button onClick={() => { setIsVisible(false); }} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close shortcuts overlay">
                                        <XMarkIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                                <p className="mt-2 text-white/80 text-sm">
                                    Use these keyboard shortcuts to navigate faster
                                </p>
                            </div>

                            {/* Shortcuts Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (<div key={category} className="mb-6 last:mb-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            {category === 'Navigation' && '🧭'}
                                            {category === 'Actions' && '⚡'}
                                            {category === 'Chat' && '💬'}
                                            {category === 'Admin' && '⚙️'}
                                            {category === 'General' && '🎯'}
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {categoryShortcuts.map((shortcut, index) => (<div key={`${category}-${index}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <span className="text-gray-700">{shortcut.description}</span>
                                                    <div className="flex items-center gap-1">
                                                        {shortcut.keys.map((key, keyIndex) => (<React.Fragment key={keyIndex}>
                                                                <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono text-gray-900 shadow-sm min-w-[40px] text-center">
                                                                    {key}
                                                                </kbd>
                                                                {keyIndex < shortcut.keys.length - 1 && (<span className="text-gray-400 text-sm">+</span>)}
                                                            </React.Fragment>))}
                                                    </div>
                                                </div>))}
                                        </div>
                                    </div>))}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 text-center">
                                    Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">?</kbd> anytime to toggle this panel
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>)}
        </AnimatePresence>);
};
export default KeyboardShortcutsOverlay;
//# sourceMappingURL=KeyboardShortcutsOverlay.jsx.map
//# sourceMappingURL=KeyboardShortcutsOverlay.jsx.map