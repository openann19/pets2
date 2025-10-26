import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { EliteButton, ScaleIn, FadeInUp } from "../EliteComponents";
import { HolographicContainer, ParticleEffect } from "../HolographicEffects";
import { GlowContainer } from "../GlowShadowSystem";
import PremiumTypography from "../PremiumTypography";
import type { Pet } from "../../types/api";
import { Dimensions } from "react-native";

const { PremiumHeading, PremiumBody } = PremiumTypography;

const { width: screenWidth } = Dimensions.get("window");

interface MatchModalProps {
  matchedPet: Pet;
  onKeepSwiping: () => void;
  onSendMessage: () => void;
}

export function MatchModal({
  matchedPet,
  onKeepSwiping,
  onSendMessage,
}: MatchModalProps) {
  return (
    <View style={styles.matchModal}>
      <ParticleEffect count={20} variant="rainbow" speed="fast" />
      <HolographicContainer
        variant="rainbow"
        speed="fast"
        animated={true}
        shimmer={true}
        glow={true}
        style={styles.matchModalContent}
      >
        <ScaleIn delay={0}>
          <PremiumHeading
            level={1}
            gradient="holographic"
            animated={true}
            glow={true}
          >
            It's a Match! 🎉
          </PremiumHeading>
        </ScaleIn>

        <FadeInUp delay={200}>
          <View style={styles.matchPhotos}>
            <GlowContainer color="primary" intensity="medium" animated={true}>
              <Image
                source={{ uri: matchedPet.photos[0]?.url }}
                style={styles.matchPhoto}
              />
            </GlowContainer>
            <GlowContainer color="secondary" intensity="medium" animated={true}>
              <Image
                source={{ uri: "https://via.placeholder.com/100" }}
                style={styles.matchPhoto}
              />
            </GlowContainer>
          </View>
        </FadeInUp>

        <FadeInUp delay={400}>
          <PremiumBody size="lg" weight="semibold" gradient="primary">
            You and {matchedPet.name} liked each other!
          </PremiumBody>
        </FadeInUp>

        <FadeInUp delay={600}>
          <View style={styles.matchButtons}>
            <EliteButton
              title="Keep Swiping"
              variant="glass"
              size="lg"
              ripple={true}
              onPress={onKeepSwiping}
            />
            <EliteButton
              title="Send Message"
              variant="primary"
              size="lg"
              icon="chatbubble"
              ripple={true}
              glow={true}
              shimmer={true}
              onPress={onSendMessage}
            />
          </View>
        </FadeInUp>
      </HolographicContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  matchModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  matchModalContent: {
    width: screenWidth - 40,
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
  },
  matchPhotos: {
    flexDirection: "row",
    marginBottom: 30,
  },
  matchPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  matchButtons: {
    flexDirection: "row",
    gap: 15,
  },
});
