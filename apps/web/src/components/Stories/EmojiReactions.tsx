/**
 * 😍 EMOJI REACTIONS OVERLAY
 * Interactive emoji reactions overlay for story viewing with tap-to-react
 */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
const EMOJI_CATEGORIES = {
    love: ['❤️', '😍', '🥰', '😘', '💕', '💖', '💗', '💘', '💝', '💞'],
    happy: ['😊', '😄', '😃', '😀', '😁', '😂', '🤣', '😆', '😅', '😄'],
    surprised: ['😮', '😲', '😯', '😱', '🤯', '😵', '😳', '😨', '😰', '😦'],
    sad: ['😢', '😭', '😿', '💔', '😞', '😔', '😟', '😕', '🙁', '☹️'],
    angry: ['😡', '😠', '🤬', '😤', '😾', '💢', '🔥', '⚡', '💥', '💣'],
    fun: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥳', '🤩', '😎', '🤗', '🤝'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    nature: ['🌹', '🌸', '🌺', '🌻', '🌷', '🌼', '🌿', '🍀', '🌱', '🌳']
};
export default function EmojiReactions({ isVisible, onReaction, onClose, className = '' }) {
    const [activeCategory, setActiveCategory] = useState('love');
    const [reactions, setReactions] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [tapPosition, setTapPosition] = useState(null);
    const containerRef = useRef(null);
    const pickerRef = useRef(null);
    // Gesture handling for tap-to-react
    const { onTouchStart, onTouchMove, onTouchEnd } = useAdvancedGestures({ tapThreshold: 10 }, {
        onTap: (event) => {
            if (isVisible && !showPicker) {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const position = {
                        x: ((event.position.x - rect.left) / rect.width) * 100,
                        y: ((event.position.y - rect.top) / rect.height) * 100
                    };
                    setTapPosition(position);
                    setShowPicker(true);
                }
            }
        }
    });
    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
                setTapPosition(null);
            }
        };
        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPicker]);
    const handleEmojiSelect = (emoji) => {
        if (tapPosition) {
            const reaction = {
                id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                emoji,
                position: tapPosition,
                timestamp: Date.now(),
                userId: 'current-user', // Replace with actual user ID
                userName: 'You' // Replace with actual user name
            };
            setReactions(prev => [...prev, reaction]);
            onReaction(emoji, tapPosition);
            // Auto-remove reaction after 3 seconds
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== reaction.id));
            }, 3000);
        }
        setShowPicker(false);
        setTapPosition(null);
    };
    const handleClose = () => {
        setShowPicker(false);
        setTapPosition(null);
        setReactions([]);
        onClose();
    };
    if (!isVisible)
        return null;
    return (<div ref={containerRef} className={`absolute inset-0 ${className}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={(e) => {
            if (!showPicker) {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const position = {
                        x: ((e.clientX - rect.left) / rect.width) * 100,
                        y: ((e.clientY - rect.top) / rect.height) * 100
                    };
                    setTapPosition(position);
                    setShowPicker(true);
                }
            }
        }}>
      {/* Active reactions */}
      <AnimatePresence>
        {reactions.map((reaction) => (<motion.div key={reaction.id} initial={{
                scale: 0,
                opacity: 0,
                x: reaction.position.x + '%',
                y: reaction.position.y + '%'
            }} animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1],
                y: (reaction.position.y - 10) + '%'
            }} exit={{
                scale: 0,
                opacity: 0,
                y: (reaction.position.y - 20) + '%'
            }} transition={{
                duration: 0.6,
                ease: "easeOut"
            }} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
                left: reaction.position.x + '%',
                top: reaction.position.y + '%'
            }}>
            <div className="text-4xl select-none">
              {reaction.emoji}
            </div>
            
            {/* Reaction trail */}
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 text-4xl text-white/30" style={{
                filter: 'blur(2px)'
            }}>
              {reaction.emoji}
            </motion.div>
          </motion.div>))}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showPicker && tapPosition && (<motion.div ref={pickerRef} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} className="absolute bg-black/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl" style={{
                left: `${Math.min(Math.max(tapPosition.x - 25, 5), 75)}%`,
                top: `${Math.min(Math.max(tapPosition.y - 15, 10), 80)}%`,
                transform: 'translate(-50%, -50%)'
            }}>
            {/* Category tabs */}
            <div className="flex space-x-2 mb-3 overflow-x-auto">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (<button key={category} onClick={() => setActiveCategory(category)} className={`
                    px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${activeCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'}
                  `}>
                  {category}
                </button>))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_CATEGORIES[activeCategory].map((emoji) => (<motion.button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="p-2 text-2xl hover:scale-110 transition-transform rounded-lg hover:bg-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  {emoji}
                </motion.button>))}
            </div>

            {/* Close button */}
            <button onClick={handleClose} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors">
              ×
            </button>
          </motion.div>)}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {!showPicker && reactions.length === 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/80 text-sm mb-2">
              👆 Tap anywhere to react
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
// Hook for managing emoji reactions
export function useEmojiReactions() {
    const [reactions, setReactions] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const showReactions = () => {
        setIsVisible(true);
    };
    const hideReactions = () => {
        setIsVisible(false);
        setReactions([]);
    };
    const addReaction = (emoji, position, userId, userName) => {
        const reaction = {
            id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            emoji,
            position,
            timestamp: Date.now(),
            userId,
            userName
        };
        setReactions(prev => [...prev, reaction]);
        // Auto-remove after 3 seconds
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
        return reaction.id;
    };
    const removeReaction = (reactionId) => {
        setReactions(prev => prev.filter(r => r.id !== reactionId));
    };
    const clearAllReactions = () => {
        setReactions([]);
    };
    return {
        reactions,
        isVisible,
        showReactions,
        hideReactions,
        addReaction,
        removeReaction,
        clearAllReactions
    };
}
//# sourceMappingURL=EmojiReactions.jsx.map