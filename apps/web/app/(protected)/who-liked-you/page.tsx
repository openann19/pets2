/**
 * Who Liked You Page
 * Premium feature showing users who liked your pets
 * Matches mobile WhoLikedYouScreen structure
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { likesAPI } from '@/services/likesAPI';
import type { ReceivedLike } from '@/services/likesAPI';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

export default function WhoLikedYouPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const hasPremium = user?.premium?.isActive ?? false;
  const hasFeature = user?.premium?.features?.seeWhoLiked ?? false;
  const [likes, setLikes] = useState<ReceivedLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'mutual'>('received');

  useEffect(() => {
    if (!hasPremium || !hasFeature) {
      router.push('/premium?feature=seeWhoLiked');
      return;
    }

    const fetchLikes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = activeTab === 'received' 
          ? await likesAPI.getReceivedLikes()
          : await likesAPI.getMutualLikes();
        
        setLikes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load likes');
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [activeTab, hasPremium, hasFeature, router]);

  if (!hasPremium || !hasFeature) {
    return null; // Redirecting to premium
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.colors.bg,
        color: theme.colors.onSurface,
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: theme.colors.onSurface }}
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" style={{ color: theme.colors.primary }} />
                <h1 className="text-xl font-bold" style={{ color: theme.colors.onSurface }}>
                  Who Liked You
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'received'
                  ? 'border-b-2'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                color: activeTab === 'received' ? theme.colors.primary : theme.colors.onMuted,
                borderBottomColor: activeTab === 'received' ? theme.colors.primary : 'transparent',
              }}
            >
              Received Likes
            </button>
            <button
              onClick={() => setActiveTab('mutual')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'mutual'
                  ? 'border-b-2'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                color: activeTab === 'mutual' ? theme.colors.primary : theme.colors.onMuted,
                borderBottomColor: activeTab === 'mutual' ? theme.colors.primary : 'transparent',
              }}
            >
              Mutual Likes
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
                style={{ borderColor: theme.colors.primary }} />
              <p style={{ color: theme.colors.onMuted }}>Loading likes...</p>
            </div>
          </div>
        ) : error ? (
          <div 
            className="rounded-lg p-6 text-center"
            style={{ 
              backgroundColor: theme.colors.surface,
              color: theme.colors.danger,
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => {
                setActiveTab('received');
                setError(null);
              }}
              className="mt-4 px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }}
            >
              Retry
            </button>
          </div>
        ) : likes.length === 0 ? (
          <div 
            className="rounded-xl p-12 text-center"
            style={{ 
              backgroundColor: theme.colors.surface,
            }}
          >
            <HeartIcon className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.colors.onMuted }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.onSurface }}>
              No {activeTab === 'received' ? 'Likes' : 'Mutual Likes'} Yet
            </h2>
            <p style={{ color: theme.colors.onMuted }}>
              {activeTab === 'received' 
                ? 'Keep swiping to see who liked your pets!'
                : 'No mutual likes at the moment. Keep exploring!'}
            </p>
            <Link
              href="/swipe"
              className="inline-block mt-6 px-6 py-3 rounded-lg font-medium"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }}
            >
              Start Swiping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {likes.map((like) => (
              <motion.div
                key={like.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                }}
                onClick={() => router.push(`/profile?userId=${like.userId}`)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    {like.profilePicture ? (
                      <img 
                        src={like.profilePicture} 
                        alt={like.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8" style={{ color: theme.colors.onMuted }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: theme.colors.onSurface }}>
                      {like.name}
                    </h3>
                    {like.location && (
                      <p className="text-sm" style={{ color: theme.colors.onMuted }}>
                        {like.location}
                      </p>
                    )}
                  </div>
                  {like.isSuperLike && (
                    <SparklesIcon className="w-6 h-6" style={{ color: theme.colors.primary }} />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: theme.colors.onMuted }}>
                    Liked {like.petsLiked.length} {like.petsLiked.length === 1 ? 'pet' : 'pets'}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.onMuted }}>
                    {new Date(like.likedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

