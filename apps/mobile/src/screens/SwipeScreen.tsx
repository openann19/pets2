/**
 * SWIPE SCREEN (FULLY MODULARIZED)
 *
 * Completely decomposed swipe screen with:
 * - useSwipeData for data fetching
 * - useSwipeGestures for gesture handling
 * - useSwipeAnimations for animations
 * - SwipeCard component for presentational UI
 * - SwipeActions component for action buttons
 */

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import { useSwipeData } from '../hooks/useSwipeData';
import { useTabDoublePress } from '../hooks/navigation/useTabDoublePress';
import { useSwipeUndo } from '../hooks/useSwipeUndo';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { useSwipeAnimations } from '../hooks/useSwipeAnimations';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { usePrefetching } from '../hooks/optimization/usePrefetching';
import UndoPill from '../components/feedback/UndoPill';
import { SwipeCard, SwipeActions } from '../components/swipe';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { useHeaderWithCounts } from '../hooks/useHeaderWithCounts';
import { SwipeLimitModal } from '../components/modals/SwipeLimitModal';
import { usePremiumGate } from '../components/Premium/PremiumGate';
import { useFeatureGate } from '../hooks/domains/premium/useFeatureGate';

const { width: screenWidth } = Dimensions.get('window');

type SwipeScreenProps = RootStackScreenProps<'Swipe'>;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const reducedMotion = useReduceMotion();
  const { PremiumGateComponent } = usePremiumGate();

  // Feature gate for swipe limits
  const swipeLimitGate = useFeatureGate({
    feature: 'swipesPerDay',
    showGateOnDeny: false, // We'll handle limit modal ourselves
    navigation,
  });

  // Swipe limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitData, setLimitData] = useState<{
    usedToday: number;
    limit: number;
  } | null>(null);

  // Data management hook
  const { pets, isLoading, error, currentIndex, handleSwipe, handleButtonSwipe, refreshPets } =
    useSwipeData();

  // Prefetching for images and routes
  const { prefetchSwipeImages, prefetchNextRoutes } = usePrefetching({
    wifiOnly: false, // Prefetch on any connection
    enableImagePrefetch: true,
    enableRoutePrefetch: true,
  });

  // Prefetch images for next 5 pets
  React.useEffect(() => {
    if (pets.length > 0 && currentIndex < pets.length) {
      prefetchSwipeImages(
        pets.slice(currentIndex, currentIndex + 5).map((pet) => ({
          images: (pet.photos || []).map((photo) => 
            typeof photo === 'string' ? photo : photo.url || ''
          ).filter(Boolean),
        })),
        0,
      );
    }
  }, [pets, currentIndex, prefetchSwipeImages]);

  // Prefetch likely next routes
  React.useEffect(() => {
    prefetchNextRoutes('Swipe');
  }, [prefetchNextRoutes]);

  // Wrapper for handleSwipe that checks limits proactively and catches limit errors
  const handleSwipeWithLimit = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      // Proactive check: Verify user has swipes remaining before attempting swipe
      const hasAccess = await swipeLimitGate.checkAccess();
      
      if (!hasAccess && swipeLimitGate.limit !== undefined && swipeLimitGate.remaining !== undefined) {
        // Show limit modal if limit reached
        setLimitData({
          usedToday: swipeLimitGate.limit - (swipeLimitGate.remaining || 0),
          limit: swipeLimitGate.limit,
        });
        setShowLimitModal(true);
        return;
      }

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
          // Re-throw other errors
          throw err;
        }
      }
    },
    [handleSwipe, swipeLimitGate],
  );

  // Update SmartHeader
  useHeaderWithCounts({
    title: t('swipe.title', 'Swipe'),
    ...(pets.length > 0 && {
      subtitle: `${pets.length} ${t('swipe.petsAvailable', 'pets nearby')}`,
    }),
    fetchCounts: true,
  });

  // Handle double-tap to refresh pets
  useTabDoublePress(() => {
    refreshPets();
  });

  // Undo functionality
  const { capture, undo } = useSwipeUndo();

  // Animation hook
  const { position, rotate, swipeRight, swipeLeft, snapBack, resetPosition } = useSwipeAnimations();

  // Capture swipe with undo support
  const onSwipeWithCapture = useCallback(
    async (
      gestureDir: 'left' | 'right',
      actionDir: 'like' | 'pass' | 'superlike',
      petId: string,
      index: number,
    ) => {
      if (actionDir === 'like') {
        haptic.confirm();
      } else if (actionDir === 'superlike') {
        haptic.super();
      } else {
        haptic.tap();
      }
      capture({ petId, direction: gestureDir, index });
      await handleSwipeWithLimit(actionDir);
      resetPosition();
    },
    [capture, handleSwipeWithLimit, resetPosition],
  );

  // Gesture handlers for swipe actions
  const handleGestureSwipeRight = useCallback(
    async (petId: string, index: number) => {
      await swipeRight(async () => {
        await onSwipeWithCapture('right', 'like', petId, index);
      });
    },
    [swipeRight, onSwipeWithCapture],
  );

  const handleGestureSwipeLeft = useCallback(
    async (petId: string, index: number) => {
      await swipeLeft(async () => {
        await onSwipeWithCapture('left', 'pass', petId, index);
      });
    },
    [swipeLeft, onSwipeWithCapture],
  );

  // Pan responder with gestures
  const currentPet = pets[currentIndex];
  const { panHandlers } = useSwipeGestures({
    currentPetId: currentPet?._id,
    currentIndex,
    onSwipeRight: handleGestureSwipeRight,
    onSwipeLeft: handleGestureSwipeLeft,
  });

  const styles = StyleSheet.create({
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: 32,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      // Refetch pets when connection restored
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

  // Show loading state with skeleton
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigation.navigate('Matches'),
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={styles.emptySubtitle}>{t('swipe.loading_pets')}</Text>
        </View>
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
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigation.navigate('Matches'),
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t('swipe.offline.title') || 'You\'re offline'}</Text>
          <Text style={styles.emptySubtitle}>
            {t('swipe.offline.message') || 'Connect to the internet to see pets'}
          </Text>
        </View>
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
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigation.navigate('Matches'),
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {t('swipe.error.title') || 'Unable to load pets'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {errorHandlingError?.userMessage || error || t('swipe.error.message') || 'Please check your connection and try again'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              clearError();
              retry();
            }}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
              {t('swipe.error.retry') || 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenShell>
    );
  }

  // Show no pets state
  if (!currentPet) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'people-outline',
                  onPress: () => navigation.navigate('Matches'),
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t('swipe.no_more_pets')}</Text>
          <Text style={styles.emptySubtitle}>{t('swipe.check_back_later')}</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('swipe.title'),
            showBackButton: true,
            onBackPress: () => {
              haptic.tap();
              navigation.goBack();
            },
            rightButtons: [
              {
                type: 'custom',
                icon: 'people-outline',
                onPress: () => {
                  haptic.tap();
                  navigation.navigate('Matches');
                },
                variant: 'glass',
                haptic: 'light',
                customComponent: undefined,
              },
            ],
          })}
        />
      }
    >
      <View
        style={styles.cardContainer}
        testID="swipe-card-container"
        accessibilityLabel="Swipeable pet cards"
      >
        <SwipeCard
          pet={currentPet}
          panHandlers={panHandlers}
          testID={`swipe-card-${currentIndex}`}
          style={{
            transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
          }}
        />
      </View>

      <SwipeActions
        onPass={() => {
          haptic.tap();
          void handleSwipeWithLimit('pass');
        }}
        onLike={() => {
          haptic.confirm();
          void handleSwipeWithLimit('like');
        }}
        onSuperlike={() => {
          haptic.super();
          void handleSwipeWithLimit('superlike');
        }}
      />

      <UndoPill
        onUndo={async () => {
          haptic.selection();
          const restoredPet = await undo();
          if (restoredPet) {
            // put the card back to front of stack
            // Note: This would require updating pets state
            // You'd need to add this capability to useSwipeData
          }
        }}
        testID="undo-pill"
      />

      {limitData && (
        <SwipeLimitModal
          visible={showLimitModal}
          usedToday={limitData.usedToday}
          limit={limitData.limit}
          onClose={() => {
            setShowLimitModal(false);
            setLimitData(null);
          }}
          navigation={navigation}
        />
      )}

      {/* Premium Gate Modal */}
      <PremiumGateComponent />
    </ScreenShell>
  );
}
