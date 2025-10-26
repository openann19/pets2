import { Ionicons } from "@expo/vector-icons";
import type { Pet } from "@pawfectmatch/core";
import { useEffect } from "react";
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
          onPress={() => handleNavigateToPetDetails(item)}
        >
        {/* Pet Photo with Gestures */}
        <View style={styles.petImageContainer}>
          {item.photos && item.photos.length > 0 ? (
            <DoubleTapLikePlus
              onDoubleTap={() => handlePetLike(item)}
              heartColor="#ff6b6b"
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
                backgroundColor="#f0f0f0"
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
              <Ionicons name="camera" size={12} color="#FFFFFF" />
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
              <Ionicons name="eye" size={14} color="#6B7280" />
              <Text style={styles.statText}>{item.analytics.views}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="heart" size={14} color="#EF4444" />
              <Text style={styles.statText}>{item.analytics.likes}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people" size={14} color="#8B5CF6" />
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
              onPress={() => {
                haptic.tap();
                navigation.navigate("PetDetails", {
                  petId: item.id,
                  pet: item,
                });
              }}
            >
              <Ionicons name="eye" size={16} color="#6B7280" />
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.editButton,
              ])}
              onPress={() => {
                haptic.confirm();
                navigation.navigate("EditPet", { petId: item.id, pet: item });
              }}
            >
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.deleteButton,
              ])}
              onPress={() => {
                haptic.error();
                handleDeletePet(item._id);
              }}
            >
              <Ionicons name="trash" size={16} color="#FFFFFF" />
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
        onPress={() => {
          haptic.confirm();
          navigation.navigate("CreatePet");
        }}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
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
            colors={["#8B5CF6"]}
            tintColor="#8B5CF6"
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
              color="#8B5CF6"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text style={styles.loadingText}>Loading pets...</Text>
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 16,
  },
  listHeaderText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  petImageContainer: {
    height: 200,
    position: "relative",
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  petImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  petImageEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  photoCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "bold",
  },
  petInfo: {
    padding: 16,
  },
  petHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  petSpecies: {
    fontSize: 24,
  },
  petBreed: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  petDetails: {
    marginBottom: 12,
  },
  petDetail: {
    fontSize: 12,
    color: "#6B7280",
  },
  petStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 4,
    fontWeight: "600",
  },
  petActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: "#F3F4F6",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#8B5CF6",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    fontWeight: "500",
  },
});