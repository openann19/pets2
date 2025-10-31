/**
 * SwipeScreen - Web Version
 * Identical to mobile SwipeScreen structure
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { EmptyStates } from '@/components/common/EmptyStates';
import { useSwipeData } from '@/hooks/useSwipeData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useTranslation } from 'react-i18next';
import { SwipeCardV2 } from '@/components/Pet/SwipeCardV2';
import { MatchModal } from '@/components/Pet/MatchModal';
import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline';
import type { PetCardData } from '@/components/Pet/SwipeCardV2';

function normalizeSize(s: any): PetCardData['size'] {
  const v = String(s || 'medium').toLowerCase();
  if (['tiny', 'small', 'medium', 'large', 'extra-large'].includes(v)) return v as PetCardData['size'];
  if (v === 'xl' || v === 'xlarge' || v === 'extra_large') return 'extra-large';
  return 'medium';
}

function toCardData(pet: any): PetCardData {
  return {
    id: pet.id || pet._id,
    name: pet.name,
    breed: pet.breed || 'Mixed',
    age: typeof pet.age === 'number' ? pet.age : 0,
    size: normalizeSize(pet.size),
    distanceKm: pet.owner?.location ? 5 : 0,
    bio: pet.description || pet.bio || '',
    photos: Array.isArray(pet.photos) ? pet.photos.map((ph: any) => ph?.url || ph).filter(Boolean) : [],
    compatibility: pet.compatibilityScore,
    gender: pet.gender,
    species: pet.species,
  };
}

export default function SwipePage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitData, setLimitData] = useState<{
    usedToday: number;
    limit: number;
  } | null>(null);

  // Data management hook
  const { pets, isLoading, error, currentIndex, handleSwipe, handleButtonSwipe, refreshPets } =
    useSwipeData();

  // Wrapper for handleSwipe that catches limit errors
  const handleSwipeWithLimit = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      try {
        await handleSwipe(action);
      } catch (err: unknown) {
        const errorData = err as any;
        if (errorData?.code === 'SWIPE_LIMIT_EXCEEDED') {
          setLimitData({
            usedToday: errorData.usedToday || 5,
            limit: errorData.currentLimit || 5,
          });
          setShowLimitModal(true);
        } else {
          throw err;
        }
      }
    },
    [handleSwipe],
  );

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      refreshPets();
    },
  });

  // Error handling with retry
  const {
    error: errorHandlingError,
    executeWithRetry,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false,
    logError: true,
  });

  const currentPet = pets[currentIndex];

  // Show loading state
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    aria-label="Back"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{t('swipe.title', 'Swipe')}</h1>
                </div>
                <button
                  onClick={() => router.push('/matches')}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Matches"
                >
                  <UsersIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">{t('swipe.loading_pets')}</p>
        </div>
      </ScreenShell>
    );
  }

  // Show offline state
  if (isOffline && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{t('swipe.title')}</h1>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmptyStates.Offline
          title={t('swipe.offline.title') || "You're offline"}
          message={t('swipe.offline.message') || 'Connect to the internet to see pets'}
        />
      </ScreenShell>
    );
  }

  // Show error state
  if ((error || errorHandlingError) && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{t('swipe.title')}</h1>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmptyStates.Error
          title={t('swipe.error.title') || 'Unable to load pets'}
          message={errorHandlingError?.userMessage || error || t('swipe.error.message') || 'Please check your connection and try again'}
          actionLabel={t('swipe.error.retry') || 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      </ScreenShell>
    );
  }

  // Show no pets state
  if (!currentPet) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-900">{t('swipe.title')}</h1>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <EmptyStates.NoMatches
          title={t('swipe.no_more_pets') || 'No more pets'}
          message={t('swipe.check_back_later') || 'Check back later for more matches'}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">{t('swipe.title')}</h1>
                {pets.length > 0 && (
                  <span className="text-sm text-gray-600">{pets.length} {t('swipe.petsAvailable', 'pets nearby')}</span>
                )}
              </div>
              <button
                onClick={() => router.push('/matches')}
                className="p-2 text-gray-600 hover:text-gray-800"
                aria-label="Matches"
              >
                <UsersIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg">
          {currentPet && (
            <div className="relative">
              <SwipeCardV2
                pet={toCardData(currentPet)}
                onSwipe={(action) => handleSwipeWithLimit(action)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              onClick={() => handleSwipeWithLimit('pass')}
              className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Pass"
            >
              <span className="text-2xl">✕</span>
            </button>
            <button
              onClick={() => handleSwipeWithLimit('like')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center transition-colors"
              aria-label="Like"
            >
              <span className="text-white text-2xl">♥</span>
            </button>
            <button
              onClick={() => handleSwipeWithLimit('superlike')}
              className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
              aria-label="Super Like"
            >
              <span className="text-white text-3xl">⭐</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match Modal would go here if match occurs */}
      {limitData && showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Swipe Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You've used {limitData.usedToday} of {limitData.limit} swipes today.
            </p>
            <button
              onClick={() => {
                setShowLimitModal(false);
                setLimitData(null);
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </ScreenShell>
  );
}
