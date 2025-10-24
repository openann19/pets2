import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import type { Pet } from "@pawfectmatch/core";
import { logger } from "@pawfectmatch/core";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface SwipeCardProps {
  pet: Pet;
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation;
  likeOpacity: Animated.AnimatedInterpolation;
  nopeOpacity: Animated.AnimatedInterpolation;
  panHandlers: any;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  isPremium?: boolean;
  showCompatibility?: boolean;
}

export function SwipeCard({
  pet,
  position,
  rotate,
  likeOpacity,
  nopeOpacity,
  panHandlers,
  onLike,
  onPass,
  onSuperLike,
  onUndo,
  isPremium = false,
  showCompatibility = true,
}: SwipeCardProps) {
  const primaryPhoto = pet.photos?.find((p) => p.isPrimary) || pet.photos?.[0];
  const ageText =
    pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;

  // Animation refs for premium effects
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start premium animations
  useEffect(() => {
    if (isPremium) {
      // Shimmer effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Pulse effect for featured pets
      if (pet.featured?.isFeatured) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    }
  }, [isPremium, pet.featured?.isFeatured, shimmerAnim, glowAnim, pulseAnim]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logger.info("Swipe action: Like", { petId: pet.id, petName: pet.name });
    onLike?.();
  }, [onLike, pet.id, pet.name]);

  const handlePass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logger.info("Swipe action: Pass", { petId: pet.id, petName: pet.name });
    onPass?.();
  }, [onPass, pet.id, pet.name]);

  const handleSuperLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    logger.info("Swipe action: Super Like", {
      petId: pet.id,
      petName: pet.name,
    });
    onSuperLike?.();
  }, [onSuperLike, pet.id, pet.name]);

  const handleUndo = useCallback(() => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Undo swipe is a premium feature. Upgrade to PawfectMatch Premium to unlock this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () =>
              logger.info("User wants to upgrade for undo feature"),
          },
        ],
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    logger.info("Swipe action: Undo", { petId: pet.id, petName: pet.name });
    onUndo?.();
  }, [onUndo, pet.id, pet.name, isPremium]);

  const shimmerStyle = {
    opacity: shimmerAnim,
    transform: [
      {
        translateX: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-screenWidth, screenWidth],
        }),
      },
    ],
  };

  const glowStyle = {
    opacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    transform: [
      {
        scale: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  const pulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
        pet.featured?.isFeatured && pulseStyle,
      ]}
      {...panHandlers}
    >
      {/* Premium Shimmer Effect */}
      {isPremium && (
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}

      {/* Like/Nope Indicators with Premium Effects */}
      <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
        <View style={styles.likeBadge}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.badgeGradient}
          >
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.likeText}>LIKE</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View style={[styles.nopeIndicator, { opacity: nopeOpacity }]}>
        <View style={styles.nopeBadge}>
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.badgeGradient}
          >
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.nopeText}>NOPE</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Pet Photo with Premium Glass Effect */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: primaryPhoto?.url || "https://via.placeholder.com/300x400",
          }}
          style={styles.petImage}
          resizeMode="cover"
        />

        {/* Premium Glass Overlay */}
        {isPremium && (
          <BlurView intensity={20} tint="light" style={styles.glassOverlay} />
        )}

        {/* Featured Badge with Premium Effects */}
        {pet.featured?.isFeatured && (
          <Animated.View style={[styles.featuredBadge, glowStyle]}>
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              style={styles.featuredGradient}
            >
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={["#ec4899", "#be185d"]}
              style={styles.premiumGradient}
            >
              <Ionicons name="diamond" size={12} color="#fff" />
              <Text style={styles.premiumText}>Premium</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Pet Info Overlay with Premium Design */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.infoOverlay}
      >
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petAge}>{ageText}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#ec4899" />
              <Text style={styles.petLocation}>
                {pet.location?.city || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Premium Compatibility Score */}
          {showCompatibility && pet.compatibilityScore && (
            <View style={styles.compatibilityContainer}>
              <Text style={styles.compatibilityLabel}>Compatibility</Text>
              <View style={styles.compatibilityBar}>
                <LinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.compatibilityFill,
                    { width: `${pet.compatibilityScore}%` },
                  ]}
                />
              </View>
              <Text style={styles.compatibilityScore}>
                {pet.compatibilityScore}%
              </Text>
            </View>
          )}

          {/* Premium Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.passButton}
              onPress={handlePass}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.superLikeButton}
              onPress={handleSuperLike}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#3b82f6", "#1d4ed8"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="star" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="heart" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Premium Undo Button */}
            {isPremium && (
              <TouchableOpacity
                style={styles.undoButton}
                onPress={handleUndo}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#6b7280", "#4b5563"]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="arrow-undo" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  shimmerGradient: {
    flex: 1,
    width: screenWidth,
  },
  likeIndicator: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
  },
  nopeIndicator: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
  likeBadge: {
    borderRadius: 25,
    overflow: "hidden",
  },
  nopeBadge: {
    borderRadius: 25,
    overflow: "hidden",
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  likeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  nopeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  featuredBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  featuredGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featuredText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  premiumBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  petInfo: {
    gap: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  petAge: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ec4899",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petBreed: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  petLocation: {
    fontSize: 14,
    color: "#ec4899",
    marginLeft: 4,
  },
  compatibilityContainer: {
    gap: 8,
  },
  compatibilityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  compatibilityBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  compatibilityFill: {
    height: "100%",
    borderRadius: 3,
  },
  compatibilityScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ec4899",
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  passButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  undoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
