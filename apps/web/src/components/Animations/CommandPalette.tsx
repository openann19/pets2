'use client'

/**
 * 🔥 COMMAND PALETTE — P2
 * Full keyboard-driven command palette with search
 * ‑ Cmd/Ctrl+K to open • Fuzzy search • Keyboard navigation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from './Utilities';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string[];
  action: () => void;
  category?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  placeholder?: string;
  onClose?: () => void;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}

export function CommandPalette({ commands, placeholder = 'Search commands...', onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const haptics = useHaptics();

  // Fuzzy search
  const filteredCommands = commands.filter((cmd) => {
    const searchText = `${cmd.label} ${cmd.description || ''} ${cmd.category || ''}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (cmd: Command) => {
      haptics.tap();
      cmd.action();
      onClose?.();
      setQuery('');
    },
    [haptics, onClose]
  );

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-20" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Palette */}
      <motion.div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        {/* Search Input */}
        <div className="border-b border-gray-200 p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full text-lg outline-none"
            aria-label="Command search"
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-gray-500">No commands found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd, idx) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-purple-100 text-purple-900' : 'hover:bg-gray-100'
                      }`}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div className="flex items-center gap-3">
                        {cmd.icon && <span className="text-xl">{cmd.icon}</span>}
                        <div>
                          <div className="font-medium">{cmd.label}</div>
                          {cmd.description && <div className="text-sm text-gray-500">{cmd.description}</div>}
                        </div>
                      </div>
                      {cmd.shortcut && (
                        <div className="flex gap-1">
                          {cmd.shortcut.map((key) => (
                            <kbd
                              key={key}
                              className="px-2 py-1 text-xs font-semibold bg-gray-200 rounded"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Esc</kbd> Close
            </span>
          </div>
          <div>{filteredCommands.length} commands</div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Full CommandPalette wrapper with AnimatePresence
 */
export function CommandPaletteWrapper({ commands }: { commands: Command[] }) {
  const { isOpen, close } = useCommandPalette();

  return (
    <AnimatePresence>
      {isOpen && <CommandPalette commands={commands} onClose={close} />}
    </AnimatePresence>
  );
}
