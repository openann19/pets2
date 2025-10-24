/**
 * 💍 STORY RING COMPONENT
 * Instagram-style story ring around pet avatar when unseen stories exist
 */
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
const SIZE_VARIANTS = {
    sm: {
        container: 'w-12 h-12',
        avatar: 'w-10 h-10',
        ring: 'w-12 h-12',
        count: 'w-5 h-5 text-xs'
    },
    md: {
        container: 'w-16 h-16',
        avatar: 'w-14 h-14',
        ring: 'w-16 h-16',
        count: 'w-6 h-6 text-xs'
    },
    lg: {
        container: 'w-20 h-20',
        avatar: 'w-18 h-18',
        ring: 'w-20 h-20',
        count: 'w-7 h-7 text-sm'
    },
    xl: {
        container: 'w-24 h-24',
        avatar: 'w-22 h-22',
        ring: 'w-24 h-24',
        count: 'w-8 h-8 text-sm'
    }
};
export default function StoryRing({ petId, petName, petAvatar, hasUnseenStories, storyCount, onClick, size = 'md', className = '', showCount = true }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const sizes = SIZE_VARIANTS[size];
    // Trigger animation when stories are added
    useEffect(() => {
        if (hasUnseenStories) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
        }
    }, [hasUnseenStories, storyCount]);
    return (<div className={`relative ${sizes.container} ${className}`}>
      <motion.button onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative w-full h-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        {/* Story ring */}
        <div className={`absolute inset-0 ${sizes.ring} rounded-full`}>
          {hasUnseenStories ? (<motion.div className="w-full h-full rounded-full" animate={isAnimating ? {
                scale: [1, 1.1, 1],
                rotate: [0, 360]
            } : {}} transition={{
                duration: 1,
                ease: "easeInOut"
            }} style={{
                background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #f093fb 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 3s ease infinite'
            }}/>) : (<div className="w-full h-full rounded-full bg-neutral-300 dark:bg-neutral-600"/>)}
          
          {/* Inner ring */}
          <div className="absolute inset-1 rounded-full bg-white dark:bg-neutral-900"/>
        </div>

        {/* Avatar */}
        <div className={`absolute inset-0 flex items-center justify-center ${sizes.avatar} rounded-full overflow-hidden`}>
          <Image src={petAvatar} alt={petName} width={size === 'sm' ? 40 : size === 'md' ? 56 : size === 'lg' ? 72 : 88} height={size === 'sm' ? 40 : size === 'md' ? 56 : size === 'lg' ? 72 : 88} className="w-full h-full object-cover"/>
        </div>

        {/* Story count badge */}
        <AnimatePresence>
          {showCount && storyCount > 0 && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className={`
                absolute -top-1 -right-1 ${sizes.count}
                bg-primary-500 text-white rounded-full
                flex items-center justify-center
                font-bold shadow-lg
                border-2 border-white dark:border-neutral-900
              `}>
              {storyCount > 99 ? '99+' : storyCount}
            </motion.div>)}
        </AnimatePresence>

        {/* Hover effect */}
        <AnimatePresence>
          {isHovered && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 rounded-full bg-primary-500/20"/>)}
        </AnimatePresence>

        {/* Pulse effect for unseen stories */}
        <AnimatePresence>
          {hasUnseenStories && (<motion.div initial={{ opacity: 0, scale: 1 }} animate={{
                opacity: [0, 0.6, 0],
                scale: [1, 1.2, 1]
            }} exit={{ opacity: 0, scale: 1 }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }} className="absolute inset-0 rounded-full bg-primary-500/30"/>)}
        </AnimatePresence>
      </motion.button>

      {/* Pet name */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {petName}
        </p>
        {hasUnseenStories && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary-500 font-semibold">
            New story
          </motion.p>)}
      </div>
    </div>);
}
export function StoriesRow({ stories, onStoryClick, className = '' }) {
    return (<div className={`flex space-x-4 overflow-x-auto pb-4 ${className}`}>
      {stories.map((story) => (<StoryRing key={story.petId} petId={story.petId} petName={story.petName} petAvatar={story.petAvatar} hasUnseenStories={story.hasUnseenStories} storyCount={story.storyCount} onClick={() => onStoryClick(story.petId)} size="md" showCount={true}/>))}
    </div>);
}
// Hook for managing story rings
export function useStoryRings() {
    const [storyRings, setStoryRings] = useState([]);
    const updateStoryRing = useCallback((petId, updates) => {
        setStoryRings(prev => prev.map(ring => ring.petId === petId
            ? { ...ring, ...updates }
            : ring));
    }, []);
    const markStoriesAsSeen = useCallback((petId) => {
        updateStoryRing(petId, { hasUnseenStories: false });
    }, [updateStoryRing]);
    const addStoryRing = useCallback((ring) => {
        setStoryRings(prev => {
            const exists = prev.find(r => r.petId === ring.petId);
            if (exists) {
                return prev.map(r => r.petId === ring.petId
                    ? { ...r, ...ring, storyCount: (r.storyCount || 0) + 1, hasUnseenStories: true }
                    : r);
            }
            return [...prev, { ...ring, hasUnseenStories: true, storyCount: 1 }];
        });
    }, []);
    return {
        storyRings,
        updateStoryRing,
        markStoriesAsSeen,
        addStoryRing
    };
}
// Add CSS for gradient animation
const STORY_RING_CSS = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .story-ring-gradient {
    background: linear-gradient(45deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #f093fb 100%);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
  }
`;
// Inject CSS
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = STORY_RING_CSS;
    document.head.appendChild(style);
}
//# sourceMappingURL=StoryRing.jsx.map