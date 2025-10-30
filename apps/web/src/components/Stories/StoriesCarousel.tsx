/**
 * 📱 STORIES CAROUSEL COMPONENT
 * Instagram-style stories with 15-sec photo/video clips and swipe up to reply
 */
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { XMarkIcon, HeartIcon, ChatBubbleLeftRightIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
const STORY_DURATION = 15; // 15 seconds per story
const PROGRESS_BAR_HEIGHT = 3;
export default function StoriesCarousel({ stories, currentStoryIndex, onClose, onStoryChange, onReply, onReaction, onShare, className = '' }) {
    const [currentStory, setCurrentStory] = useState(stories[currentStoryIndex]);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [reactions, setReactions] = useState([]);
    const progressInterval = useRef();
    const videoRef = useRef(null);
    const inputRef = useRef(null);
    // Progress bar animation
    const progressBarWidth = useTransform(useMotionValue(progress), [0, 100], ['0%', '100%']);
    // Gesture handling for swipe up to reply
    const { onTouchStart, onTouchMove, onTouchEnd } = useAdvancedGestures({ swipeThreshold: 50 }, {
        onSwipe: (event) => {
            if (event.delta && event.delta.y < -50) {
                // Swipe up to reply
                setShowReplyInput(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    });
    // Story progress management
    useEffect(() => {
        if (isPlaying && !isPaused) {
            progressInterval.current = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + (100 / (STORY_DURATION * 10)); // 10 updates per second
                    if (newProgress >= 100) {
                        // Move to next story
                        const nextIndex = (currentStoryIndex + 1) % stories.length;
                        onStoryChange(nextIndex);
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);
        }
        else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPlaying, isPaused, currentStoryIndex, stories.length, onStoryChange]);
    // Update current story when index changes
    useEffect(() => {
        setCurrentStory(stories[currentStoryIndex]);
        setProgress(0);
        setIsPlaying(true);
        setIsPaused(false);
        setShowReactions(false);
        setShowReplyInput(false);
        setReactions([]);
    }, [currentStoryIndex, stories]);
    // Video handling
    useEffect(() => {
        if (currentStory.type === 'video' && videoRef.current) {
            if (isPlaying && !isPaused) {
                videoRef.current.play();
            }
            else {
                videoRef.current.pause();
            }
        }
    }, [currentStory.type, isPlaying, isPaused]);
    const handleStoryTap = (side) => {
        if (side === 'left') {
            // Previous story
            const prevIndex = currentStoryIndex > 0 ? currentStoryIndex - 1 : stories.length - 1;
            onStoryChange(prevIndex);
        }
        else {
            // Next story
            const nextIndex = (currentStoryIndex + 1) % stories.length;
            onStoryChange(nextIndex);
        }
    };
    const handlePause = () => {
        setIsPaused(!isPaused);
        setIsPlaying(!isPaused);
    };
    const handleReaction = (reaction) => {
        setReactions(prev => [...prev, reaction]);
        onReaction(currentStory.id, reaction);
        setShowReactions(false);
    };
    const handleReply = () => {
        if (replyMessage.trim()) {
            onReply(currentStory.id, replyMessage);
            setReplyMessage('');
            setShowReplyInput(false);
        }
    };
    const handleShare = () => {
        onShare(currentStory.id);
    };
    if (!currentStory || !stories.length)
        return null;
    return (<div className={`fixed inset-0 z-50 bg-black ${className}`}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex space-x-1">
          {stories.map((_, index) => (<div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div className="h-full bg-white rounded-full" style={{
                width: index < currentStoryIndex
                    ? '100%'
                    : index === currentStoryIndex
                        ? progressBarWidth
                        : '0%'
            }} transition={{ duration: 0.1 }}/>
            </div>))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image src={currentStory.petAvatar} alt={currentStory.petName} width={40} height={40} className="w-full h-full object-cover"/>
            </div>
            <div>
              <h3 className="text-white font-semibold">{currentStory.petName}</h3>
              <p className="text-white/70 text-sm">
                {currentStory.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>
      </div>

      {/* Story content */}
      <div className="absolute inset-0 flex items-center justify-center" onTouchStart={(e) => onTouchStart(e.nativeEvent)} onTouchMove={(e) => onTouchMove(e.nativeEvent)} onTouchEnd={(e) => onTouchEnd(e.nativeEvent)} onClick={handlePause}>
        <div className="relative w-full h-full max-w-md mx-auto">
          {currentStory.type === 'photo' ? (<Image src={currentStory.url} alt={`${currentStory.petName}'s story`} fill className="object-cover" priority/>) : (<video ref={videoRef} src={currentStory.url} className="w-full h-full object-cover" muted loop={false} onEnded={() => {
                const nextIndex = (currentStoryIndex + 1) % stories.length;
                onStoryChange(nextIndex);
            }}/>)}

          {/* Pause overlay */}
          <AnimatePresence>
            {isPaused && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"/>
                </div>
              </motion.div>)}
          </AnimatePresence>

          {/* Swipe up indicator */}
          <AnimatePresence>
            {!showReplyInput && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/80 text-sm mb-2">
                  👆 Swipe up to reply
                </motion.div>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation areas */}
      <div className="absolute inset-0 flex">
        {/* Left side - previous story */}
        <div className="flex-1 cursor-pointer" onClick={() => { handleStoryTap('left'); }}/>
        
        {/* Right side - next story */}
        <div className="flex-1 cursor-pointer" onClick={() => { handleStoryTap('right'); }}/>
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-center space-x-8">
          {/* Like */}
          <button onClick={() => { handleReaction('❤️'); }} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <HeartIcon className="w-6 h-6"/>
          </button>

          {/* Reply */}
          <button onClick={() => setShowReplyInput(true)} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ChatBubbleLeftRightIcon className="w-6 h-6"/>
          </button>

          {/* Share */}
          <button onClick={handleShare} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <ShareIcon className="w-6 h-6"/>
          </button>

          {/* More options */}
          <button onClick={() => setShowReactions(!showReactions)} className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <EllipsisHorizontalIcon className="w-6 h-6"/>
          </button>
        </div>
      </div>

      {/* Reply input */}
      <AnimatePresence>
        {showReplyInput && (<motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <input ref={inputRef} type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Reply to story..." className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500" onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleReply();
                }
            }}/>
              <button onClick={handleReply} disabled={!replyMessage.trim()} className="px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Send
              </button>
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Reaction picker */}
      <AnimatePresence>
        {showReactions && (<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-4 p-4 bg-black/80 backdrop-blur-sm rounded-full">
              {['❤️', '😂', '😍', '😮', '😢', '😡'].map((emoji) => (<button key={emoji} onClick={() => { handleReaction(emoji); }} className="text-2xl hover:scale-110 transition-transform">
                  {emoji}
                </button>))}
            </div>
          </motion.div>)}
      </AnimatePresence>

      {/* Recent reactions */}
      <AnimatePresence>
        {reactions.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
            <div className="flex flex-col space-y-2">
              {reactions.slice(-3).map((reaction, index) => (<motion.div key={index} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-2xl">
                  {reaction}
                </motion.div>))}
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
// Hook for managing stories
export function useStories() {
    const [stories, setStories] = useState([]);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const openStories = (storyIndex = 0) => {
        setCurrentStoryIndex(storyIndex);
        setIsOpen(true);
    };
    const closeStories = () => {
        setIsOpen(false);
        setCurrentStoryIndex(0);
    };
    const nextStory = () => {
        setCurrentStoryIndex(prev => (prev + 1) % stories.length);
    };
    const prevStory = () => {
        setCurrentStoryIndex(prev => prev > 0 ? prev - 1 : stories.length - 1);
    };
    const addStory = (story) => {
        const newStory = {
            ...story,
            id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            isViewed: false,
            views: 0,
            reactions: 0,
            replies: 0
        };
        setStories(prev => [newStory, ...prev]);
        return newStory.id;
    };
    const markAsViewed = (storyId) => {
        setStories(prev => prev.map(story => story.id === storyId
            ? { ...story, isViewed: true, views: story.views + 1 }
            : story));
    };
    const addReaction = (storyId) => {
        setStories(prev => prev.map(story => story.id === storyId
            ? { ...story, reactions: story.reactions + 1 }
            : story));
    };
    const addReply = (storyId) => {
        setStories(prev => prev.map(story => story.id === storyId
            ? { ...story, replies: story.replies + 1 }
            : story));
    };
    return {
        stories,
        currentStoryIndex,
        isOpen,
        openStories,
        closeStories,
        nextStory,
        prevStory,
        addStory,
        markAsViewed,
        addReaction,
        addReply,
        setCurrentStoryIndex
    };
}
//# sourceMappingURL=StoriesCarousel.jsx.map