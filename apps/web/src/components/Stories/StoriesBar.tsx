'use client';
/**
 * StoriesBar Component
 *
 * Horizontal scrollable bar displaying story avatars with gradient ring indicators.
 * Shows unseen stories first with purple gradient, seen stories with gray ring.
 *
 * Features:
 * - Real-time Socket.io updates for new stories
 * - Smooth scroll with fade edges
 * - Gradient ring indicators (purple = unseen, gray = seen)
 * - Click to open StoryViewer
 * - Own story shows "+" icon for creation
 */
import { useSocket } from '@/hooks/useSocket';
import http from '@/lib/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
export function StoriesBar({ onStoryClick, onCreateClick }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const scrollRef = useRef(null);
    const { socket } = useSocket();
    // Fetch stories feed
    const { data, isLoading, error } = useQuery({
        queryKey: ['stories-feed'],
        queryFn: async () => {
            const response = await http.get('/api/stories');
            return response.stories;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
    });
    // Real-time updates via Socket.io
    useEffect(() => {
        if (!socket)
            return;
        const handleStoryCreated = () => {
            // Invalidate and refetch stories feed
            queryClient.invalidateQueries({ queryKey: ['stories-feed'] });
        };
        const handleStoryDeleted = () => {
            queryClient.invalidateQueries({ queryKey: ['stories-feed'] });
        };
        socket.on('story:created', handleStoryCreated);
        socket.on('story:deleted', handleStoryDeleted);
        return () => {
            socket.off('story:created', handleStoryCreated);
            socket.off('story:deleted', handleStoryDeleted);
        };
    }, [socket, queryClient]);
    const handleStoryClick = (group, index) => {
        if (onStoryClick) {
            onStoryClick(group, index);
        }
        else {
            router.push(`/stories/${group.userId}`);
        }
    };
    const handleCreateStory = () => {
        if (onCreateClick) {
            onCreateClick();
        }
        else {
            router.push('/stories/create');
        }
    };
    if (isLoading) {
        return (<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"/>
                        <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
                    </div>))}
            </div>);
    }
    if (error) {
        return (<div className="text-sm text-red-500 dark:text-red-400">
                Failed to load stories
            </div>);
    }
    if (!data || data.length === 0) {
        return (<div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No stories yet. Be the first to share!</p>
            </div>);
    }
    return (<div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"/>
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"/>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-4">
                <AnimatePresence mode="popLayout">
                    {data.map((group, index) => (<motion.div key={group.userId} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.05,
            }} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={() => { handleStoryClick(group, index); }}>
                            {/* Story Avatar with Ring */}
                            <div className="relative">
                                {/* Gradient Ring */}
                                <div className={`absolute inset-0 rounded-full p-[2px] ${group.hasUnseen
                ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500'
                : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900"/>
                                </div>

                                {/* Avatar Image */}
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 transform transition-transform duration-200 group-hover:scale-105">
                                    <Image src={group.user.profilePhoto || '/default-avatar.png'} alt={group.user.name} fill className="object-cover" sizes="64px"/>
                                </div>

                                {/* Story Count Badge */}
                                {group.storyCount > 1 && (<div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-900">
                                        {group.storyCount}
                                    </div>)}
                            </div>

                            {/* Username */}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[64px] truncate">
                                {group.user.username}
                            </span>
                        </motion.div>))}
                </AnimatePresence>

                {/* Create Story Button */}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            delay: data.length * 0.05,
        }} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={handleCreateStory}>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center transform transition-transform duration-200 group-hover:scale-105">
                        <Plus className="w-8 h-8 text-white" strokeWidth={3}/>
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Create
                    </span>
                </motion.div>
            </div>
        </div>);
}
//# sourceMappingURL=StoriesBar.jsx.map