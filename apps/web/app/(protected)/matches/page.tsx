/**
 * MatchesScreen - Web Version
 * Identical to mobile MatchesScreen structure
 */

'use client';

import React, { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { EmptyStates } from '@/components/common/EmptyStates';
import { useMatchesData } from '@/hooks/useMatchesData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MatchesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const listRef = useRef<HTMLDivElement>(null);

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      refetch();
    },
  });

  // Error handling with retry
  const {
    error: errorHandlingError,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false,
    logError: true,
  });

  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    isLoading,
    error,
    onRefresh,
    refetch,
    setSelectedTab,
    handleScroll,
  } = useMatchesData();

  // Calculate unread message count from matches
  const unreadMessages = matches.reduce((sum, match) => sum + (match.unreadCount || 0), 0);

  const handleMatchPress = useCallback((matchId: string, petName: string) => {
    router.push(`/chat/${matchId}`);
  }, [router]);

  const handleFilterPress = useCallback(() => {
    // Filter functionality
  }, []);

  const handleSearchPress = useCallback(() => {
    // Search functionality
  }, []);

  const currentData = selectedTab === 'matches' ? matches : likedYou;
  const isEmpty = !isLoading && currentData.length === 0;

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">
                {t('matches.title', 'Matches')}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleFilterPress}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Filter"
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSearchPress}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setSelectedTab('matches')}
          className={`flex-1 px-4 py-2 text-center font-medium ${
            selectedTab === 'matches'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          {t('matches.matches', 'Matches')} ({matches.length})
        </button>
        <button
          onClick={() => setSelectedTab('likedYou')}
          className={`flex-1 px-4 py-2 text-center font-medium ${
            selectedTab === 'likedYou'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          {t('matches.liked_you', 'Liked You')} ({likedYou.length})
        </button>
      </div>

      {/* Content */}
      {isLoading && currentData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : isOffline ? (
        <EmptyStates.Offline
          title={t('matches.offline.title') || "You're offline"}
          message={t('matches.offline.message') || 'Connect to the internet to see your matches'}
          actionLabel={t('matches.offline.retry') || 'Retry'}
          onAction={() => {
            clearError();
            if (isOnline) {
              refetch();
            }
          }}
        />
      ) : error || errorHandlingError ? (
        <EmptyStates.Error
          title={t('matches.error.title') || 'Unable to load matches'}
          message={errorHandlingError?.userMessage || error?.message || t('matches.error.message') || 'Please check your connection and try again'}
          actionLabel={t('matches.error.retry') || 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      ) : isEmpty ? (
        selectedTab === 'matches' ? (
          <EmptyStates.NoMatches
            title={t('matches.empty.title') || 'No matches yet'}
            message={t('matches.empty.subtitle') || 'Start swiping to find your perfect match!'}
            actionLabel={t('matches.empty.action') || 'Go to Swipe'}
            onAction={() => router.push('/swipe')}
          />
        ) : (
          <EmptyStates.NoData
            title={t('matches.empty.liked_you.title') || 'No one liked you yet'}
            message={t('matches.empty.liked_you.subtitle') || 'Keep swiping and people will start liking you!'}
          />
        )
      ) : (
        <div
          ref={listRef}
          className="space-y-4 overflow-y-auto"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            handleScroll(target.scrollTop);
          }}
        >
          {currentData.map((match, index) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/chat/${match._id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleMatchPress(match._id, match.petName);
                }}
                className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={match.petPhoto || '/placeholder-pet.jpg'}
                    alt={match.petName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{match.petName}</h3>
                    <p className="text-sm text-gray-600">
                      {match.petBreed} • {match.petAge} years old
                    </p>
                    {match.lastMessage?.content && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {match.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {match.unreadCount > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {match.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </ScreenShell>
  );
}
