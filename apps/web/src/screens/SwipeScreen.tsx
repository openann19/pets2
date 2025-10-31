/**
 * SwipeScreen - WEB VERSION
 * Main swipe screen matching mobile SwipeScreen exactly
 * Includes drag gestures, card stack, and swipe actions
 */

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/layout/AdvancedHeader';
import { useTheme } from '@/theme';
import { useSwipeData } from '@/hooks/useSwipeData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import MobileSwipeCard from '@/components/UI/MobileSwipeCard';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { PeopleIcon } from '@heroicons/react/24/outline';

export default function SwipeScreen() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      refreshPets();
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

  // Swipe data management
  const {
    pets,
    isLoading,
    error,
    currentIndex,
    handleSwipe,
    handleButtonSwipe,
    refreshPets,
  } = useSwipeData();

  const currentPet = pets[currentIndex];

  // Swipe handlers
  const handleSwipeRight = useCallback(
    async (pet: any) => {
      try {
        await handleSwipe('like');
      } catch (err) {
        console.error('Failed to like pet:', err);
      }
    },
    [handleSwipe]
  );

  const handleSwipeLeft = useCallback(
    async (pet: any) => {
      try {
        await handleSwipe('pass');
      } catch (err) {
        console.error('Failed to pass on pet:', err);
      }
    },
    [handleSwipe]
  );

  const handleSwipeUp = useCallback(
    async (pet: any) => {
      try {
        await handleSwipe('superlike');
      } catch (err) {
        console.error('Failed to superlike pet:', err);
      }
    },
    [handleSwipe]
  );

  const handleButtonLike = useCallback(() => {
    if (currentPet) {
      handleSwipeRight(currentPet);
    }
  }, [currentPet, handleSwipeRight]);

  const handleButtonPass = useCallback(() => {
    if (currentPet) {
      handleSwipeLeft(currentPet);
    }
  }, [currentPet, handleSwipeLeft]);

  const handleButtonSuperlike = useCallback(() => {
    if (currentPet) {
      handleSwipeUp(currentPet);
    }
  }, [currentPet, handleSwipeUp]);

  // Show loading state
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title') || 'Swipe',
              showBackButton: true,
              onBackPress: () => navigate(-1),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigate('/matches'),
                  variant: 'glass',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
            minHeight: '60vh',
          }}
        >
          <div
            className="animate-spin rounded-full border-4 border-t-transparent"
            style={{
              width: 48,
              height: 48,
              borderColor: theme.colors.primary,
              borderTopColor: 'transparent',
              marginBottom: theme.spacing.md,
            }}
          />
          <p
            style={{
              color: theme.colors.onMuted,
              fontSize: theme.typography.body.size,
            }}
          >
            {t('swipe.loading_pets') || 'Loading pets...'}
          </p>
        </div>
      </ScreenShell>
    );
  }

  // Show offline state
  if (isOffline && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title') || 'Swipe',
              showBackButton: true,
              onBackPress: () => navigate(-1),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigate('/matches'),
                  variant: 'glass',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
            minHeight: '60vh',
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.h2.size,
              fontWeight: 'bold',
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            {t('swipe.offline.title') || "You're offline"}
          </h3>
          <p
            style={{
              color: theme.colors.onMuted,
              fontSize: theme.typography.body.size,
              textAlign: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            {t('swipe.offline.message') || 'Connect to the internet to see pets'}
          </p>
        </div>
      </ScreenShell>
    );
  }

  // Show error state
  if ((error || errorHandlingError) && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title') || 'Swipe',
              showBackButton: true,
              onBackPress: () => navigate(-1),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigate('/matches'),
                  variant: 'glass',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
            minHeight: '60vh',
          }}
        >
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              <h3
                style={{
                  fontSize: theme.typography.h2.size,
                  fontWeight: 'bold',
                  color: theme.colors.onSurface,
                  marginBottom: theme.spacing.md,
                }}
              >
                {t('swipe.error.title') || 'Unable to load pets'}
              </h3>
              <p
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {errorHandlingError?.message || error || t('swipe.error.message') || 'Please check your connection and try again'}
              </p>
              <Button
                title={t('swipe.error.retry') || 'Retry'}
                variant="primary"
                onPress={() => {
                  clearError();
                  retry();
                }}
              />
            </div>
          </Card>
        </div>
      </ScreenShell>
    );
  }

  // Show no pets state
  if (!currentPet && !isLoading) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title') || 'Swipe',
              showBackButton: true,
              onBackPress: () => navigate(-1),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigate('/matches'),
                  variant: 'glass',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
            minHeight: '60vh',
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.h2.size,
              fontWeight: 'bold',
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            {t('swipe.no_more_pets') || 'No more pets'}
          </h3>
          <p
            style={{
              color: theme.colors.onMuted,
              fontSize: theme.typography.body.size,
              textAlign: 'center',
            }}
          >
            {t('swipe.check_back_later') || 'Check back later for more pets!'}
          </p>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('swipe.title') || 'Swipe',
            ...(pets.length > 0 && {
              subtitle: `${pets.length} ${t('swipe.petsAvailable') || 'pets nearby'}`,
            }),
            showBackButton: true,
            onBackPress: () => navigate(-1),
            rightButtons: [
              {
                type: 'custom',
                icon: 'people-outline',
                onPress: () => navigate('/matches'),
                variant: 'glass',
                haptic: 'light',
              },
            ],
          })}
        />
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.lg,
          minHeight: '70vh',
          position: 'relative',
        }}
      >
        {/* Card Stack */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            height: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentPet && (
            <MobileSwipeCard
              pet={currentPet}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onSwipeUp={handleSwipeUp}
              disabled={isLoading}
              showActions={false}
            />
          )}
        </div>

        {/* Action Buttons */}
        {currentPet && (
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              marginTop: theme.spacing.xl,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handleButtonPass}
              disabled={isLoading}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: theme.colors.danger,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Pass on this pet"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={handleButtonSuperlike}
              disabled={isLoading}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: theme.colors.info,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Super like this pet"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>

            <button
              onClick={handleButtonLike}
              disabled={isLoading}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: theme.colors.success,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Like this pet"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
