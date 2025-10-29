import { Ionicons } from "@expo/vector-icons";
import type { Pet } from "@pawfectmatch/core";
import { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from "@/theme";

import type { RootStackScreenProps } from "../navigation/types";
import { useMyPetsScreen } from "../hooks/screens/useMyPetsScreen";
import { DoubleTapLikePlus } from "../components/Gestures/DoubleTapLikePlus";
import { PinchZoomPro } from "../components/Gestures/PinchZoomPro";
import { useDoubleTapMetrics, usePinchMetrics } from "../hooks/useInteractionMetrics";
import { logger } from '../services/logger';

const { width: _screenWidth } = Dimensions.get("window");

type MyPetsScreenProps = RootStackScreenProps<"MyPets">;

export default function MyPetsScreen({ navigation }: MyPetsScreenProps) {
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
  const { startInteraction: startDoubleTap, endInteraction: endDoubleTap } = useDoubleTapMetrics();
  const { startInteraction: startPinch, endInteraction: endPinch } = usePinchMetrics();

  const theme = useTheme();

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
    return (
      <Animated.View entering={FadeInDown.duration(220).delay(index * 50)}>
        <TouchableOpacity
          style={styles.petCard}
           testID="MyPetsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => { handleNavigateToPetDetails(item); }}
        >
        {/* Pet Photo with Gestures */}
        <View style={styles.petImageContainer}>
          {item.photos && item.photos.length > 0 ? (
            <DoubleTapLikePlus
              onDoubleTap={() => { handlePetLike(item); }}
              heartColor={theme.colors.danger}
              particles={4}
              haptics={{ enabled: true, style: "light" }}
            >
              <PinchZoomPro
                source={{
                  uri:
                    item.photos.find((p) => p.isPrimary)?.url ??
                    item.photos[0]?.url ??
                    "",
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
              <Text style={styles.petImageEmoji}>
                {getSpeciesEmoji(item.species)}
              </Text>
            </View>
          )}

          {/* Status badge */}
          <View
            style={StyleSheet.flatten([
              styles.statusBadge,
              { backgroundColor: getIntentColor(item.intent) },
            ])}
          >
            <Text style={styles.statusBadgeText}>
              {getIntentLabel(item.intent)}
            </Text>
          </View>

          {/* Photo count */}
          {item.photos && item.photos.length > 1 ? (
            <View style={styles.photoCountBadge}>
              <Ionicons name="camera" size={12} color={theme.colors.bg} />
              <Text style={styles.photoCountText}>{item.photos.length}</Text>
            </View>
          ) : null}
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petSpecies}>
              {getSpeciesEmoji(item.species)}
            </Text>
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
              <Ionicons name="eye" size={14} color={theme.colors.onMuted} />
              <Text style={styles.statText}>{item.analytics.views}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="heart" size={14} color={theme.colors.danger} />
              <Text style={styles.statText}>{item.analytics.likes}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people" size={14} color={theme.colors.primary[500]} />
              <Text style={styles.statText}>{item.analytics.matches}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.petActions}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.viewButton,
              ])}
               testID="MyPetsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                haptic.tap();
                navigation.navigate("PetDetails", {
                  petId: item.id,
                  pet: item,
                });
              }}
            >
              <Ionicons name="eye" size={16} color={theme.colors.onMuted} />
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.editButton,
              ])}
               testID="MyPetsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                haptic.confirm();
                navigation.navigate("EditPet", { petId: item.id, pet: item });
              }}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.bg} />
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.deleteButton,
              ])}
               testID="MyPetsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                haptic.error();
                handleDeletePet(item._id);
              }}
            >
              <Ionicons name="trash" size={16} color={theme.colors.bg} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🐾</Text>
      <Text style={styles.emptyTitle}>No Pets Yet</Text>
      <Text style={styles.emptyText}>
        Start building your pet&apos;s profile to find amazing matches and new
        friends!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
         testID="MyPetsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
          haptic.confirm();
          navigation.navigate("CreatePet");
        }}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.bg} />
        <Text style={styles.emptyButtonText}>
          Create Your First Pet Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleBackPress = () => {
    haptic.tap();
    navigation.goBack();
  };
  
  const handleAddPet = () => {
    haptic.confirm();
    navigation.navigate("CreatePet");
  };
  
  const handleNavigateToPetDetails = (item: Pet) => {
    haptic.tap();
    navigation.navigate("PetDetails", { petId: item.id, pet: item });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitle: {
          fontSize: 20,
          fontWeight: "600",
          color: theme.colors.onSurface,
        },
        headerRight: {
          width: 32,
        },
        listContainer: {
          padding: 20,
          paddingBottom: 100,
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
          overflow: "hidden",
        },
        petImageContainer: {
          position: "relative",
          width: "100%",
          height: 200,
        },
        petImagePlaceholder: {
          width: "100%",
          height: 200,
          backgroundColor: theme.colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        petImageEmoji: {
          fontSize: 48,
        },
        statusBadge: {
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: theme.colors.primary,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
        },
        statusBadgeText: {
          fontSize: 10,
          fontWeight: "600",
          color: theme.colors.onPrimary,
        },
        photoCountBadge: {
          position: "absolute",
          bottom: 12,
          left: 12,
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },
        photoCountText: {
          fontSize: 10,
          fontWeight: "600",
          color: theme.colors.onPrimary,
        },
        petInfo: {
          padding: 16,
        },
        petHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        },
        petName: {
          fontSize: 18,
          fontWeight: "600",
          color: theme.colors.onSurface,
        },
        petSpecies: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        petDetails: {
          marginBottom: 12,
        },
        petDetail: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        petStats: {
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 16,
        },
        stat: {
          alignItems: "center",
          gap: 4,
        },
        statText: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.colors.onMuted,
        },
        petActions: {
          flexDirection: "row",
          gap: 8,
        },
        actionButton: {
          flex: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
        },
        viewButton: {
          backgroundColor: theme.colors.primary[500],
        },
        viewButtonText: {
          fontSize: 14,
          fontWeight: "600",
          color: theme.colors.background.primary,
        },
        editButton: {
          backgroundColor: theme.colors.background.secondary,
        },
        deleteButton: {
          backgroundColor: theme.colors.danger,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        },
        emptyIcon: {
          marginBottom: 16,
          opacity: 0.5,
        },
        emptyTitle: {
          fontSize: 24,
          fontWeight: "600",
          color: theme.colors.text.primary,
          textAlign: "center",
          marginBottom: 8,
        },
        emptyText: {
          fontSize: 16,
          color: theme.colors.text.secondary,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 32,
        },
        emptyButton: {
          backgroundColor: theme.colors.primary[500],
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        emptyButtonText: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.colors.background.primary,
        },
        loadingOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.primary + "F0",
          justifyContent: "center",
          alignItems: "center",
        },
        loadingContent: {
          backgroundColor: theme.colors.background.primary,
          borderRadius: 16,
          padding: 24,
          alignItems: "center",
          shadowColor: theme.colors.text.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        loadingText: {
          marginTop: 12,
          fontSize: 16,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
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
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={!isLoading ? (
          <Animated.View entering={FadeInDown.duration(220)}>
            {renderEmptyState()}
          </Animated.View>
        ) : null}
        ListHeaderComponent={
          pets.length > 0 ? (
            <Animated.View entering={FadeInDown.duration(200)}>
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {pets.length} pet{pets.length !== 1 ? "s" : ""} profile
                  {pets.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </Animated.View>
          ) : null
        }
      />

      {/* Loading Overlay */}
      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Ionicons
              name="sync"
              size={32}
              color={theme.colors.primary[500]}
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text style={styles.loadingText}>Loading pets...</Text>
          </View>
        </View>
      )}
    </ScreenShell>
  );
}
