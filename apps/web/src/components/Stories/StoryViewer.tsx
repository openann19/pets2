'use client';
/**
 * StoryViewer Component
 *
 * Full-screen story viewer with tap navigation, auto-advance, and interactions.
 *
 * Features:
 * - Tap left/right to navigate stories
 * - Auto-advance based on duration (5s photos, video.duration)
 * - Progress bars for multiple stories
 * - View count display for own stories
 * - Reply with swipe-up gesture
 * - Pause on hold
 * - Mute toggle
 * - Close button
 */
import { useSocket } from '@/hooks/useSocket';
import http from '@/lib/http';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MessageCircle, Send, Volume2, VolumeX, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StoryProgress } from './StoryProgress';
export function StoryViewer({ storyGroups, initialGroupIndex, onClose, currentUserId }) {
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [viewCount, setViewCount] = useState(0);
    const videoRef = useRef(null);
    const timerRef = useRef(null);
    const { socket } = useSocket();
    const currentGroup = storyGroups[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];
    const isOwnStory = currentStory?.userId === currentUserId;
    // Mark story as viewed
    const viewStoryMutation = useMutation({
        mutationFn: async (storyId) => {
            const response = await http.post(`/api/stories/${storyId}/view`);
            return response;
        },
        onSuccess: (data) => {
            setViewCount(data.viewCount);
        },
    });
    // Reply to story
    const replyMutation = useMutation({
        mutationFn: async ({ storyId, message }) => {
            const response = await http.post(`/api/stories/${storyId}/reply`, { message });
            return response;
        },
        onSuccess: () => {
            setReplyText('');
            setShowReplyInput(false);
            // Optionally show success toast
        },
    });
    // Auto-advance timer
    const startTimer = useCallback(() => {
        if (!currentStory || isPaused)
            return;
        const duration = currentStory.duration * 1000; // Convert to ms
        timerRef.current = setTimeout(() => {
            goToNextStory();
        }, duration);
    }, [currentStory, isPaused]);
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);
    // Navigation
    const goToNextStory = useCallback(() => {
        if (!currentGroup)
            return;
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            // Next story in same group
            setCurrentStoryIndex(prev => prev + 1);
        }
        else if (currentGroupIndex < storyGroups.length - 1) {
            // Next group
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        }
        else {
            // End of all stories
            onClose();
        }
    }, [currentGroup, currentStoryIndex, currentGroupIndex, storyGroups.length, onClose]);
    const goToPreviousStory = useCallback(() => {
        if (currentStoryIndex > 0) {
            // Previous story in same group
            setCurrentStoryIndex(prev => prev - 1);
        }
        else if (currentGroupIndex > 0) {
            // Previous group (last story)
            const prevGroupIndex = currentGroupIndex - 1;
            const prevGroup = storyGroups[prevGroupIndex];
            if (prevGroup) {
                setCurrentGroupIndex(prevGroupIndex);
                setCurrentStoryIndex(prevGroup.stories.length - 1);
            }
        }
    }, [currentStoryIndex, currentGroupIndex, storyGroups]);
    // Tap to navigate
    const handleTap = useCallback((e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        if (x < width / 3) {
            goToPreviousStory();
        }
        else if (x > (width * 2) / 3) {
            goToNextStory();
        }
    }, [goToPreviousStory, goToNextStory]);
    // Mark story as viewed on load
    useEffect(() => {
        if (currentStory && !isOwnStory) {
            viewStoryMutation.mutate(currentStory._id);
        }
    }, [currentStory?._id]);
    // Timer management
    useEffect(() => {
        clearTimer();
        if (!isPaused) {
            startTimer();
        }
        return clearTimer;
    }, [currentStory, isPaused, startTimer, clearTimer]);
    // Video controls
    useEffect(() => {
        if (videoRef.current) {
            if (isPaused) {
                videoRef.current.pause();
            }
            else {
                videoRef.current.play().catch(() => {
                    // Auto-play failed, user needs to interact first
                });
            }
            videoRef.current.muted = isMuted;
        }
    }, [isPaused, isMuted, currentStory]);
    // Socket.io - real-time view updates for own stories
    useEffect(() => {
        if (!socket || !isOwnStory)
            return;
        const handleStoryViewed = (data) => {
            if (data.storyId === currentStory._id) {
                setViewCount(data.viewCount);
            }
        };
        socket.on('story:viewed', handleStoryViewed);
        return () => {
            socket.off('story:viewed', handleStoryViewed);
        };
    }, [socket, isOwnStory, currentStory?._id]);
    // Handle reply submission
    const handleReplySubmit = () => {
        if (!replyText.trim() || !currentStory)
            return;
        replyMutation.mutate({
            storyId: currentStory._id,
            message: replyText.trim(),
        });
    };
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
            if (e.key === 'ArrowLeft')
                goToPreviousStory();
            if (e.key === 'ArrowRight')
                goToNextStory();
            if (e.key === ' ')
                setIsPaused(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToPreviousStory, goToNextStory]);
    if (!currentGroup || !currentStory)
        return null;
    return (<AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={handleTap}>
                {/* Story Content */}
                <div className="relative w-full h-full max-w-[500px] flex flex-col">
                    {/* Progress Bars */}
                    <div className="absolute top-0 left-0 right-0 z-20 p-4">
                        <StoryProgress stories={currentGroup.stories} currentIndex={currentStoryIndex} isPaused={isPaused}/>
                    </div>

                    {/* Header */}
                    <div className="absolute top-12 left-0 right-0 z-20 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src={currentGroup.user.profilePhoto || '/default-avatar.png'} alt={currentGroup.user.name} width={40} height={40} className="rounded-full border-2 border-white"/>
                            <div>
                                <p className="text-white font-semibold text-sm">
                                    {currentGroup.user.username}
                                </p>
                                <p className="text-white/80 text-xs">
                                    {new Date(currentStory.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Count (own stories only) */}
                            {isOwnStory && (<div className="flex items-center gap-1 text-white bg-black/30 px-2 py-1 rounded-full">
                                    <Eye size={16}/>
                                    <span className="text-xs font-medium">{viewCount}</span>
                                </div>)}

                            {/* Mute Toggle (videos only) */}
                            {currentStory.mediaType === 'video' && (<button onClick={(e) => {
                e.stopPropagation();
                setIsMuted(prev => !prev);
            }} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition">
                                    {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                                </button>)}

                            {/* Close Button */}
                            <button onClick={(e) => {
            e.stopPropagation();
            onClose();
        }} className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition">
                                <X size={20}/>
                            </button>
                        </div>
                    </div>

                    {/* Media Content */}
                    <div className="flex-1 flex items-center justify-center relative" onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                        {currentStory.mediaType === 'photo' ? (<Image src={currentStory.mediaUrl} alt="Story" fill className="object-contain" priority/>) : (<video ref={videoRef} src={currentStory.mediaUrl} className="w-full h-full object-contain" autoPlay playsInline muted={isMuted} onEnded={goToNextStory}/>)}

                        {/* Caption */}
                        {currentStory.caption && (<div className="absolute bottom-20 left-0 right-0 px-4">
                                <p className="text-white text-center bg-black/50 px-4 py-2 rounded-full">
                                    {currentStory.caption}
                                </p>
                            </div>)}
                    </div>

                    {/* Reply Section (not for own stories) */}
                    {!isOwnStory && (<div className="absolute bottom-4 left-0 right-0 px-4">
                            {!showReplyInput ? (<button onClick={(e) => {
                    e.stopPropagation();
                    setShowReplyInput(true);
                }} className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition">
                                    <MessageCircle size={20}/>
                                    <span className="text-sm font-medium">Send a message</span>
                                </button>) : (<motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter')
                        handleReplySubmit();
                    if (e.key === 'Escape')
                        setShowReplyInput(false);
                }} placeholder="Reply to story..." className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30" autoFocus/>
                                    <button onClick={handleReplySubmit} disabled={!replyText.trim() || replyMutation.isPending} className="p-3 bg-purple-500 rounded-full text-white hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Send size={20}/>
                                    </button>
                                </motion.div>)}
                        </div>)}
                </div>
            </motion.div>
        </AnimatePresence>);
}
//# sourceMappingURL=StoryViewer.jsx.map