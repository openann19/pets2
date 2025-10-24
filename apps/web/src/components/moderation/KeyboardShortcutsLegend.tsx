'use client';
import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const shortcuts = [
    { key: 'A', description: 'Approve current photo', category: 'Actions' },
    { key: 'R', description: 'Reject current photo', category: 'Actions' },
    { key: 'F', description: 'Flag for review', category: 'Actions' },
    { key: 'U', description: 'Undo last action', category: 'Actions' },
    { key: '←', description: 'Previous photo', category: 'Navigation' },
    { key: '→', description: 'Next photo', category: 'Navigation' },
    { key: 'Space', description: 'Toggle filters', category: 'Navigation' },
    { key: '/', description: 'Focus search', category: 'Navigation' },
    { key: '?', description: 'Show this help', category: 'Help' },
    { key: 'Esc', description: 'Close modals', category: 'Help' },
];
export default function KeyboardShortcutsLegend() {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '?' && !e.shiftKey) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen]);
    const categories = Array.from(new Set(shortcuts.map(s => s.category)));
    return (<>
      {/* Floating help button */}
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 z-40" aria-label="Show keyboard shortcuts">
        <Keyboard className="w-6 h-6"/>
      </button>

      {/* Legend overlay */}
      <AnimatePresence>
        {isOpen && (<>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"/>

            {/* Legend panel */}
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-6 h-6 text-purple-600"/>
                    <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors" aria-label="Close">
                    <X className="w-5 h-5 text-gray-600"/>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                  {categories.map(category => (<div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts
                    .filter(s => s.category === category)
                    .map(shortcut => (<div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="text-gray-700">{shortcut.description}</span>
                              <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm min-w-[3rem] text-center">
                                {shortcut.key}
                              </kbd>
                            </div>))}
                      </div>
                    </div>))}

                  {/* Tip */}
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>💡 Pro Tip:</strong> Press <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-purple-300 rounded">?</kbd> anytime to toggle this help panel.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </>);
}
//# sourceMappingURL=KeyboardShortcutsLegend.jsx.map