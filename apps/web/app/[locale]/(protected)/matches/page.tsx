'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, PhoneIcon, VideoCameraIcon, HeartIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import SafeImage from '@/components/UI/SafeImage';
import { MatchCardSkeleton } from '@/components/UI/LoadingSkeleton';
import { NoMatchesEmptyState } from '@/components/UI/EmptyState';
import { formatLastSeen } from '@/utils/dateHelpers';
import { useMatches } from '@/hooks/api-hooks';

export default function MatchesPage() {
  const router = useRouter();
  const { data: matches, isLoading, error, refetch } = useMatches();

  // Window scroll position memory
  useEffect(() => {
    const key = 'matches_window_scrollY';
    // Restore
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        window.scrollTo(0, Number(saved));
      }
    } catch {}

    const onScroll = () => {
      try { sessionStorage.setItem(key, String(window.scrollY)); } catch {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Animated Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Your Matches
              </span>
            </h1>
            <p className="text-white/70 text-lg">Finding your perfect pet companions...</p>
          </motion.div>

          {/* Skeleton Loading */}
          <MatchCardSkeleton count={6} />
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
              <p className="text-white/70">We couldn't load your matches. Please try again.</p>
            </div>
            <PremiumButton
              onClick={() => refetch()}
              variant="primary"
              size="lg"
              glow
              magneticEffect
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl"
            >
              Try Again
            </PremiumButton>
          </motion.div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Elite Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Your Matches
                </span>
              </h1>
              <p className="text-white/70 text-lg">
                {matches && matches.length > 0 
                  ? `You have ${matches.length} perfect ${matches.length === 1 ? 'match' : 'matches'}!`
                  : 'Your matches will appear here'
                }
              </p>
            </div>
            
            {/* Quick Actions */}
            {matches && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="./swipe">
                  <PremiumButton
                    variant="outline"
                    size="md"
                    icon={<HeartIcon className="w-5 h-5" />}
                    className="bg-white/10 border-2 border-white/30 hover:bg-white/20 hover:border-white/50 font-semibold"
                  >
                    Find More Matches
                  </PremiumButton>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Matches Grid or Empty State */}
        <AnimatePresence mode="wait">
          {matches && matches.length > 0 ? (
            <motion.div
              key="matches-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {matches.map((match: any, index: number) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-pink-500/20 transition-all duration-500">
                    {/* Hero Image with Gradient Overlay */}
                    <div className="relative h-64 overflow-hidden">
                      <SafeImage
                        src={match?.petPhoto || match?.pet?.photo}
                        alt={match?.petName || match?.pet?.name || 'Pet'}
                        fallbackType="pet"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                          className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
                        >
                          <HeartSolidIcon className="w-4 h-4 text-pink-500" />
                          <span className="text-xs font-bold text-gray-800">Match</span>
                        </motion.div>
                      </div>
                      
                      {/* Pet Name Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                          {match?.petName || match?.pet?.name || 'Unknown'}
                        </h3>
                        <p className="text-white/90 text-sm font-medium drop-shadow-md">
                          {match?.pet?.breed || 'Mixed Breed'}, {match?.pet?.age || '?'} years
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      {/* Owner Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {(match?.ownerName || match?.owner?.name || 'U')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {match?.ownerName || match?.owner?.name || 'Unknown Owner'}
                          </p>
                          <div className="flex items-center gap-1 text-white/60 text-xs">
                            <MapPinIcon className="w-3 h-3" />
                            <span className="truncate">{match?.location || match?.owner?.location || 'Location unknown'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Last Message Preview */}
                      {match?.lastMessage && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-white/80 text-sm line-clamp-2">
                            "{match.lastMessage}"
                          </p>
                        </div>
                      )}

                      {/* Match Date */}
                      <div className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <SparklesIcon className="w-4 h-4" />
                        <span>Matched {formatLastSeen(match?.matchedAt || new Date())}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`./chat/${match.id}`}
                          className="flex-1"
                        >
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            <span>Chat</span>
                          </button>
                        </Link>
                        
                        <button 
                          onClick={() => {
                            // Navigate to video call
                            window.location.href = `./video-call/${match.id}`;
                          }}
                          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 group/btn"
                          title="Call"
                          aria-label="Start video call"
                        >
                          <PhoneIcon className="w-5 h-5 text-green-400 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        
                        <button 
                          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300 group/btn"
                          title="Video Call"
                        >
                          <VideoCameraIcon className="w-5 h-5 text-blue-400 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <NoMatchesEmptyState onAction={() => router.push('/swipe')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}
