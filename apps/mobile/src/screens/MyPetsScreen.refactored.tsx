/**
 * MyPetsScreen (Refactored)
 * Uses useMyPetsScreen hook and extracted MyPetCard component
 */

import { Ionicons } from '@expo/vector-icons';
import type { Pet } from '@pawfectmatch/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { useTheme } from '@/theme';
import { useMyPetsScreen } from '../hooks/screens/useMyPetsScreen';
import { useDoubleTapMetrics, usePinchMetrics } from '../hooks/useInteractionMetrics';
import type { RootStackScreenProps } from '../navigation/types';
import { logger } from '../services/logger';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { useTabStatePreservation } from '../hooks/navigation';
import { EmptyStates } from '../components/common';
import { ListSkeleton } from '../components/skeletons';
import { MyPetCard } from '../components/pets/MyPetCard';

const { width: _screenWidth } = Dimensions.get('window');

type MyPetsScreenProps = RootStackScreenProps<'MyPets'>;

export default function MyPetsScreen({ navigation }: MyPetsScreenProps) {
  const listRef = useRef<FlatList<Pet>>(null);
  const theme = useTheme();

  const {
    pets,
    isLoading,
    refreshing,
    loadPets,
    onRefresh,
    getSpeciesEmoji,
    getIntentColor,
    getIntentLabel,
    handleDeletePet,
  } = useMyPetsScreen();

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      loadPets();
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

  // Tab state preservation
  const { updateScrollOffset, restoreState } = useTabStatePreservation({
    tabName: 'MyPets',
    scrollRef: listRef as any,
    preserveScroll: true,
  });

  // Restore state when screen gains focus
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  const { startInteraction: startDoubleTap, endInteraction: endDoubleTap } = useDoubleTapMetrics();
  const { startInteraction: startPinch, endInteraction: endPinch } = usePinchMetrics();
  const reducedMotion = useReduceMotion();

  const handleAddPet = useCallback(() => {
    haptic.confirm();
    navigation.navigate('CreatePet');
  }, [navigation]);

  const handlePetLike = useCallback((pet: Pet) => {
    haptic.confirm();
    startDoubleTap('petLike', { petId: pet.id, petName: pet.name });
    logger.info('Pet like action', { petId: pet.id, petName: pet.name });
    endDoubleTap('petLike', true);
  }, [startDoubleTap, endDoubleTap]);

  const handleNavigateToPetDetails = useCallback((pet: Pet) => {
    haptic.tap();
    navigation.navigate('PetDetails', { petId: pet.id, pet: pet });
  }, [navigation]);

  const handleViewPet = useCallback((pet: Pet) => {
    haptic.tap();
    navigation.navigate('PetDetails', { petId: pet.id, pet: pet });
  }, [navigation]);

  const handleEditPet = useCallback((pet: Pet) => {
    haptic.confirm();
    navigation.navigate('EditPet', { petId: pet.id, pet: pet });
  }, [navigation]);

  const handlePinchStart = useCallback((petId: string) => {
    startPinch('petPhoto', { petId });
  }, [startPinch]);

  const handlePinchEnd = useCallback(() => {
    endPinch('petPhoto', true);
  }, [endPinch]);

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const renderPetCard = useCallback(
    ({ item, index }: { item: Pet; index: number }) => (
      <MyPetCard
        pet={item}
        index={index}
        reducedMotion={reducedMotion}
        getSpeciesEmoji={getSpeciesEmoji}
        getIntentColor={getIntentColor}
        getIntentLabel={getIntentLabel}
        onPress={handleNavigateToPetDetails}
        onLike={handlePetLike}
        onView={handleViewPet}
        onEdit={handleEditPet}
        onDelete={handleDeletePet}
        onPinchStart={handlePinchStart}
        onPinchEnd={handlePinchEnd}
      />
    ),
    [
      reducedMotion,
      getSpeciesEmoji,
      getIntentColor,
      getIntentLabel,
      handleNavigateToPetDetails,
      handlePetLike,
      handleViewPet,
      handleEditPet,
      handleDeletePet,
      handlePinchStart,
      handlePinchEnd,
    ],
  );

  // Handle scroll to preserve position
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offset = event.nativeEvent.contentOffset.y;
      updateScrollOffset(offset);
    },
    [updateScrollOffset],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        listContainer: {
          padding: theme.spacing.lg,
          paddingBottom: 100,
        },
        listHeader: {
          marginBottom: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        listHeaderText: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  // Loading state
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'My Pets',
              rightButtons: [
                {
                  type: 'add',
                  onPress: handleAddPet,
                  variant: 'primary',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <ListSkeleton count={3} />
      </ScreenShell>
    );
  }

  // Offline state
  if (isOffline && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'My Pets',
              rightButtons: [
                {
                  type: 'add',
                  onPress: handleAddPet,
                  variant: 'primary',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <EmptyStates.Offline
          title="You're offline"
          message="Connect to the internet to see your pets"
        />
      </ScreenShell>
    );
  }

  // Error state
  if (errorHandlingError && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'My Pets',
              rightButtons: [
                {
                  type: 'add',
                  onPress: handleAddPet,
                  variant: 'primary',
                  haptic: 'light',
                },
              ],
            })}
          />
        }
      >
        <EmptyStates.Error
          title="Unable to load pets"
          message={errorHandlingError?.userMessage || 'Please check your connection and try again'}
          actionLabel="Retry"
          onAction={() => {
            clearError();
            retry();
          }}
        />
      </ScreenShell>
    );
  }

  const renderEmptyState = () => (
    <EmptyStates.NoPets
      title="No Pets Yet"
      message="Start building your pet's profile to find amazing matches and new friends!"
      actionLabel="Create Your First Pet Profile"
      onAction={() => {
        haptic.confirm();
        navigation.navigate('CreatePet');
      }}
    />
  );

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: 'My Pets',
            rightButtons: [
              {
                type: 'add',
                onPress: handleAddPet,
                variant: 'primary',
                haptic: 'light',
              },
            ],
          })}
        />
      }
    >
      <FlatList
        ref={listRef}
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (isOnline) {
                onRefresh();
              }
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Animated.View entering={FadeInDown.duration(220)}>{renderEmptyState()}</Animated.View>
          ) : null
        }
        ListHeaderComponent={
          pets.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(200)}>
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {pets.length} pet{pets.length !== 1 ? 's' : ''} profile
                  {pets.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </Animated.View>
          ) : null
        }
      />
    </ScreenShell>
  );
}

