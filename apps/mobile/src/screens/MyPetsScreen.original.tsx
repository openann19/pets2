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

import { useTheme } from '@mobile/theme';

import { DoubleTapLikePlus } from '../components/Gestures/DoubleTapLikePlus';
import { PinchZoomPro } from '../components/Gestures/PinchZoomPro';
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
      // Refetch pets when connection restored
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

  const handlePetLike = (pet: Pet) => {
    haptic.confirm();
    startDoubleTap('petLike', { petId: pet.id, petName: pet.name });
    // Add some love for the pet
    logger.info('Pet like action', { petId: pet.id, petName: pet.name });
    endDoubleTap('petLike', true);
  };

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const renderPetCard = ({ item, index }: { item: Pet; index: number }) => {
    return reducedMotion ? (
      <TouchableOpacity
        style={styles.petCard}
        testID={`pet-card-${item._id}`}
        accessibilityLabel={`Pet profile for ${item.name}, ${item.breed}`}
        accessibilityRole="button"
        onPress={() => {
          handleNavigateToPetDetails(item);
        }}
      >
        {/* Pet Photo with Gestures */}
        <View style={styles.petImageContainer}>
          {item.photos && item.photos.length > 0 ? (
            <DoubleTapLikePlus
              onDoubleTap={() => {
                handlePetLike(item);
              }}
              heartColor={theme.colors.danger}
              particles={4}
              haptics={{ enabled: true, style: 'light' }}
            >
              <PinchZoomPro
                source={{
                  uri: item.photos.find((p) => p.isPrimary)?.url ?? item.photos[0]?.url ?? '',
                }}
                width={120}
                height={120}
                minScale={1}
                maxScale={2.5}
                enableMomentum={false}
                haptics={true}
                onScaleChange={(scale) => {
                  if (scale > 1.1) {
                    startPinch('petPhoto', { petId: item.id });
                  } else {
                    endPinch('petPhoto', true);
                  }
                }}
                backgroundColor={theme.colors.surface}
              />
            </DoubleTapLikePlus>
          ) : (
            <View style={styles.petImagePlaceholder}>
              <Text style={styles.petImageEmoji}>{getSpeciesEmoji(item.species)}</Text>
            </View>
          )}

          {/* Status badge */}
          <View
            style={StyleSheet.flatten([
              styles.statusBadge,
              { backgroundColor: getIntentColor(item.intent) },
            ])}
          >
            <Text style={styles.statusBadgeText}>{getIntentLabel(item.intent)}</Text>
          </View>

          {/* Photo count */}
          {item.photos && item.photos.length > 1 ? (
            <View style={styles.photoCountBadge}>
              <Ionicons
                name="camera"
                size={12}
                color={theme.colors.bg}
              />
              <Text style={styles.photoCountText}>{item.photos.length}</Text>
            </View>
          ) : null}
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petSpecies}>{getSpeciesEmoji(item.species)}</Text>
          </View>

          <Text style={styles.petBreed}>{item.breed}</Text>

          <View style={styles.petDetails}>
            <Text style={styles.petDetail}>
              {item.age} years • {item.gender} • {item.size}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.petStats}>
            <View style={styles.stat}>
              <Ionicons
                name="eye"
                size={14}
                color={theme.colors.onMuted}
              />
              <Text style={styles.statText}>{item.analytics.views}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons
                name="heart"
                size={14}
                color={theme.colors.danger}
              />
              <Text style={styles.statText}>{item.analytics.likes}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons
                name="people"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.statText}>{item.analytics.matches}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.petActions}>
            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.viewButton])}
              testID="MyPetsScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                haptic.tap();
                navigation.navigate('PetDetails', {
                  petId: item.id,
                  pet: item,
                });
              }}
            >
              <Ionicons
                name="eye"
                size={16}
                color={theme.colors.onMuted}
              />
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.editButton])}
              testID="MyPetsScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                haptic.confirm();
                navigation.navigate('EditPet', { petId: item.id, pet: item });
              }}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={theme.colors.bg}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.deleteButton])}
              testID="MyPetsScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                haptic.error();
                handleDeletePet(item._id);
              }}
            >
              <Ionicons
                name="trash"
                size={16}
                color={theme.colors.bg}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    ) : (
      <Animated.View entering={FadeInDown.duration(220).delay(index * 50)}>
        <TouchableOpacity
          style={styles.petCard}
          testID={`pet-card-${item._id}`}
          accessibilityLabel={`Pet profile for ${item.name}, ${item.breed}`}
          accessibilityRole="button"
          onPress={() => {
            handleNavigateToPetDetails(item);
          }}
        >
          {/* Pet Photo with Gestures */}
          <View style={styles.petImageContainer}>
            {item.photos && item.photos.length > 0 ? (
              <DoubleTapLikePlus
                onDoubleTap={() => {
                  handlePetLike(item);
                }}
                heartColor={theme.colors.danger}
                particles={4}
                haptics={{ enabled: true, style: 'light' }}
              >
                <PinchZoomPro
                  source={{
                    uri: item.photos.find((p) => p.isPrimary)?.url ?? item.photos[0]?.url ?? '',
                  }}
                  width={120}
                  height={120}
                  minScale={1}
                  maxScale={2.5}
                  enableMomentum={false}
                  haptics={true}
                  onScaleChange={(scale) => {
                    if (scale > 1.1) {
                      startPinch('petPhoto', { petId: item.id });
                    } else {
                      endPinch('petPhoto', true);
                    }
                  }}
                  backgroundColor={theme.colors.surface}
                />
              </DoubleTapLikePlus>
            ) : (
              <View style={styles.petImagePlaceholder}>
                <Text style={styles.petImageEmoji}>{getSpeciesEmoji(item.species)}</Text>
              </View>
            )}

            {/* Status badge */}
            <View
              style={StyleSheet.flatten([
                styles.statusBadge,
                { backgroundColor: getIntentColor(item.intent) },
              ])}
            >
              <Text style={styles.statusBadgeText}>{getIntentLabel(item.intent)}</Text>
            </View>

            {/* Photo count */}
            {item.photos && item.photos.length > 1 ? (
              <View style={styles.photoCountBadge}>
                <Ionicons
                  name="camera"
                  size={12}
                  color={theme.colors.bg}
                />
                <Text style={styles.photoCountText}>{item.photos.length}</Text>
              </View>
            ) : null}
          </View>

          {/* Pet Info */}
          <View style={styles.petInfo}>
            <View style={styles.petHeader}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petSpecies}>{getSpeciesEmoji(item.species)}</Text>
            </View>

            <Text style={styles.petBreed}>{item.breed}</Text>

            <View style={styles.petDetails}>
              <Text style={styles.petDetail}>
                {item.age} years • {item.gender} • {item.size}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.petStats}>
              <View style={styles.stat}>
                <Ionicons
                  name="eye"
                  size={14}
                  color={theme.colors.onMuted}
                />
                <Text style={styles.statText}>{item.analytics.views}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name="heart"
                  size={14}
                  color={theme.colors.danger}
                />
                <Text style={styles.statText}>{item.analytics.likes}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name="people"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.statText}>{item.analytics.matches}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.petActions}>
              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.viewButton])}
                testID={`view-button-${item._id}`}
                accessibilityLabel={`View details for ${item.name}`}
                accessibilityRole="button"
                onPress={() => {
                  haptic.tap();
                  navigation.navigate('PetDetails', {
                    petId: item.id,
                    pet: item,
                  });
                }}
              >
                <Ionicons
                  name="eye"
                  size={16}
                  color={theme.colors.onMuted}
                />
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.editButton])}
                testID={`edit-button-${item._id}`}
                accessibilityLabel={`Edit ${item.name}`}
                accessibilityRole="button"
                onPress={() => {
                  haptic.confirm();
                  navigation.navigate('EditPet', { petId: item.id, pet: item });
                }}
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color={theme.colors.bg}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.deleteButton])}
                testID={`delete-button-${item._id}`}
                accessibilityLabel={`Delete ${item.name}`}
                accessibilityRole="button"
                onPress={() => {
                  haptic.error();
                  handleDeletePet(item._id);
                }}
              >
                <Ionicons
                  name="trash"
                  size={16}
                  color={theme.colors.bg}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Handle scroll to preserve position
  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offset = event.nativeEvent.contentOffset.y;
    updateScrollOffset(offset);
  };

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

  const handleNavigateToPetDetails = (item: Pet) => {
    haptic.tap();
    navigation.navigate('PetDetails', { petId: item.id, pet: item });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitle: {
          fontSize: 20,
          fontWeight: '600',
          color: theme.colors.onSurface,
        },
        headerRight: {
          width: 32,
        },
        listContainer: {
          padding: 20,
          paddingBottom: 100,
        },
        listHeader: {
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        listHeaderText: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onMuted,
        },
        petCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          marginBottom: 16,
          shadowColor: theme.colors.onSurface,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          overflow: 'hidden',
        },
        petImageContainer: {
          position: 'relative',
          width: '100%',
          height: 200,
        },
        petImagePlaceholder: {
          width: '100%',
          height: 200,
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          alignItems: 'center',
        },
        petImageEmoji: {
          fontSize: 48,
        },
        statusBadge: {
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: theme.colors.primary,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
        },
        statusBadgeText: {
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.onPrimary,
        },
        photoCountBadge: {
          position: 'absolute',
          bottom: 12,
          left: 12,
          backgroundColor: theme.colors.overlay || `${theme.palette.neutral[950]}B3`,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        photoCountText: {
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.onPrimary,
        },
        petInfo: {
          padding: 16,
        },
        petHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        petName: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.onSurface,
        },
        petSpecies: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        petBreed: {
          fontSize: 16,
          fontWeight: '500',
          color: theme.colors.onSurface,
          marginBottom: 8,
        },
        petDetails: {
          marginBottom: 12,
        },
        petDetail: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        petStats: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 16,
        },
        stat: {
          alignItems: 'center',
          gap: 4,
        },
        statText: {
          fontSize: 12,
          fontWeight: '500',
          color: theme.colors.onMuted,
        },
        petActions: {
          flexDirection: 'row',
          gap: 8,
        },
        actionButton: {
          flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
        },
        viewButton: {
          backgroundColor: theme.colors.primary,
        },
        viewButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.colors.onPrimary,
        },
        editButton: {
          backgroundColor: theme.colors.surface,
        },
        deleteButton: {
          backgroundColor: theme.colors.danger,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        },
        emptyEmoji: {
          fontSize: 64,
          marginBottom: 16,
        },
        emptyIcon: {
          marginBottom: 16,
          opacity: 0.5,
        },
        emptyTitle: {
          fontSize: 24,
          fontWeight: '600',
          color: theme.colors.onSurface,
          textAlign: 'center',
          marginBottom: 8,
        },
        emptyText: {
          fontSize: 16,
          color: theme.colors.onMuted,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32,
        },
        emptyButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        emptyButtonText: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onPrimary,
        },
        loadingOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.overlay || `${theme.colors.bg}F0`,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingContent: {
          backgroundColor: theme.colors.bg,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          shadowColor: theme.palette.neutral[950],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        loadingText: {
          marginTop: 12,
          fontSize: 16,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
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
      {/* Content */}
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
