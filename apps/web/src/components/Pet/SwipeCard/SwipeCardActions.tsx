/**
 * 🎮 SWIPE CARD ACTIONS COMPONENT
 * Action buttons and haptic feedback for swipe interactions
 */
import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';
export const SwipeCardActions = ({ onLike, onPass, onSuperLike, hapticFeedback = true, soundEffects = true, premiumEffects = true, }) => {
    // Haptic feedback function
    const triggerHapticFeedback = (type = 'medium') => {
        if (!hapticFeedback || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
            return;
        }
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [50, 10, 50],
        };
        navigator.vibrate(patterns[type]);
    };
    // Sound effects function
    const playSound = (type) => {
        if (!soundEffects || typeof window === 'undefined') {
            return;
        }
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = {
            like: [523.25, 659.25, 783.99], // C5, E5, G5
            pass: [261.63, 220.0, 196.0], // C4, A3, G3
            superlike: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
        };
        const freq = frequencies[type];
        freq.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
    };
    const handleAction = (action, callback) => {
        triggerHapticFeedback(action === 'superlike' ? 'heavy' : 'medium');
        playSound(action);
        callback();
    };
    return (<div className="flex justify-center space-x-6 mt-4">
      {/* Pass Button */}
      <motion.button onClick={() => handleAction('pass', onPass)} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}>
        <XMarkIcon className="w-8 h-8"/>
      </motion.button>

      {/* Super Like Button */}
      <motion.button onClick={() => handleAction('superlike', onSuperLike)} className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
        <SparklesIcon className="w-8 h-8"/>
      </motion.button>

      {/* Like Button */}
      <motion.button onClick={() => handleAction('like', onLike)} className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}>
        <HeartIcon className="w-8 h-8"/>
      </motion.button>
    </div>);
};
//# sourceMappingURL=SwipeCardActions.jsx.map
//# sourceMappingURL=SwipeCardActions.jsx.map