import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  View,
  type GestureResponderHandlers,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { EliteButton } from "../EliteComponents";
import { GlowContainer } from "../GlowShadowSystem";
import { GlassContainer } from "../GlassMorphism";
import { GradientText, PremiumBody } from "../PremiumTypography";
import type { Pet } from "../../types/api";
import { tokens } from "@pawfectmatch/design-tokens";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface SwipeCardProps {
  pet: Pet;
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<number>;
  likeOpacity: Animated.AnimatedInterpolation<number>;
  nopeOpacity: Animated.AnimatedInterpolation<number>;
  panHandlers: GestureResponderHandlers;
}

export function SwipeCard({
  pet,
  position,
  rotate,
  likeOpacity,
  nopeOpacity,
  panHandlers,
}: SwipeCardProps) {
  const primaryPhoto = pet.photos.find((p) => p.isPrimary) || pet.photos[0];
  const ageText =
    pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;

  return (
    <Animated.View
      style={StyleSheet.flatten([
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ])}
      {...panHandlers}
    >
      {/* Premium Like/Nope Indicators */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.likeIndicator,
          { opacity: likeOpacity },
        ])}
      >
        <GlowContainer color="primary" intensity="heavy" animated={true}>
          <GradientText gradient="primary" size="lg" weight="bold" glow={true}>
            LIKE
          </GradientText>
        </GlowContainer>
      </Animated.View>
      <Animated.View
        style={StyleSheet.flatten([
          styles.nopeIndicator,
          { opacity: nopeOpacity },
        ])}
      >
        <GlowContainer color="secondary" intensity="heavy" animated={true}>
          <GradientText
            gradient="secondary"
            size="lg"
            weight="bold"
            glow={true}
          >
            NOPE
          </GradientText>
        </GlowContainer>
      </Animated.View>

      {/* Pet Photo with Glass Effect */}
      <GlassContainer
        intensity="light"
        transparency="light"
        border="light"
        shadow="medium"
      >
        <Image source={{ uri: primaryPhoto?.url }} style={styles.petImage} />
      </GlassContainer>

      {/* Premium Featured Badge */}
      {pet.featured?.isFeatured && (
        <GlowContainer color="neon" intensity="medium" animated={true}>
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={16} color="#fff" />
            <GradientText gradient="neon" size="sm" weight="bold" glow={true}>
              Featured
            </GradientText>
          </View>
        </GlowContainer>
      )}

      {/* Premium Pet Info Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.infoOverlay}
      >
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <GradientText
              gradient="primary"
              size="2xl"
              weight="bold"
              glow={true}
            >
              {pet.name}
            </GradientText>
            <PremiumBody size="lg" weight="semibold" gradient="secondary">
              {ageText}
            </PremiumBody>
          </View>
          <PremiumBody size="base" weight="medium" gradient="primary">
            {pet.breed}
          </PremiumBody>
          {pet.location?.coordinates && (
            <PremiumBody size="sm" weight="regular">
              Location available
            </PremiumBody>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: "absolute",
  },
  petImage: {
    width: "100%",
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: "cover",
  },
  featuredBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#ffd700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likeIndicator: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#66d7a2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  nopeIndicator: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#ff4458",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "flex-end",
  },
  petInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
});
