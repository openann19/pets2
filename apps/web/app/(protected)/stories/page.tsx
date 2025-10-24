'use client';

/**
 * Stories Page
 * 
 * Displays stories feed with viewer and uploader functionality.
 */

import { StoriesBar, StoryUploader, StoryViewer } from '@/components/Stories';
import { useAuthStore } from '@/lib/auth-store';
import http from '@/lib/http';
import type { StoriesFeedResponse, StoryGroup } from '@pawfectmatch/core';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StoriesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
    const [showUploader, setShowUploader] = useState(false);

    // Fetch stories feed
    const { data: storyGroups, isLoading, error } = useQuery({
        queryKey: ['stories-feed'],
        queryFn: async () => {
            const response = await http.get<StoriesFeedResponse>('/api/stories');
            return response.stories;
        },
        staleTime: 30 * 1000,
    });

    const handleStoryClick = (_group: StoryGroup, index: number) => {
        setSelectedGroupIndex(index);
    };

    const handleCloseViewer = () => {
        setSelectedGroupIndex(null);
    };

    const handleCreateClick = () => {
        setShowUploader(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Stories
                            </h1>
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition font-medium"
                        >
                            <Plus size={20} />
                            <span>Create</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                    </div>
                )}

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500 dark:text-red-400">
                            Failed to load stories. Please try again.
                        </p>
                    </div>
                )}

                {!isLoading && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Stories Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Stories Feed
                            </h2>
                            <StoriesBar
                                onStoryClick={handleStoryClick}
                                onCreateClick={handleCreateClick}
                            />
                        </div>

                        {/* Empty State */}
                        {storyGroups && storyGroups.length === 0 && (
                            <div className="mt-8 text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                                    <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No stories yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Be the first to share your pet's adventures!
                                </p>
                                <button
                                    onClick={handleCreateClick}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition font-medium"
                                >
                                    <Plus size={20} />
                                    <span>Create Your First Story</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Story Viewer Modal */}
            {selectedGroupIndex !== null && storyGroups && user && (
                <StoryViewer
                    storyGroups={storyGroups}
                    initialGroupIndex={selectedGroupIndex}
                    onClose={handleCloseViewer}
                    currentUserId={user._id}
                />
            )}

            {/* Story Uploader Modal */}
            {showUploader && (
                <StoryUploader
                    onSuccess={() => setShowUploader(false)}
                    onCancel={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
