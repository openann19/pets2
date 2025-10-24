import React from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { EliteButton } from '../components/EliteButton';
import { GlowContainer } from '../components/GlowContainer';
import { GlassContainer } from '../components/GlassContainer';
import { GradientText } from '../components/GradientText';
import { PremiumBody } from '../components/PremiumBody';
import { Pet } from '../types/api';
import { tokens } from '@pawfectmatch/design-tokens';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeCardProps {
  pet: Pet;
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation;
  likeOpacity: Animated.AnimatedInterpolation;
  nopeOpacity: Animated.AnimatedInterpolation;
  panHandlers: any;
}

export function SwipeCard({ 
  pet, 
  position, 
  rotate, 
  likeOpacity, 
  nopeOpacity, 
  panHandlers 
}: SwipeCardProps) {
  const primaryPhoto = pet.photos.find((p) => p.isPrimary) || pet.photos[0];
  const ageText = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;

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
      ]}
      {...panHandlers}
    >
      {/* Premium Like/Nope Indicators */}
      <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
        <GlowContainer color="success" intensity="heavy" animated={true}>
          <GradientText gradient="success" size="lg" weight="bold" glow={true}>
            LIKE
          </GradientText>
        </GlowContainer>
      </Animated.View>
      <Animated.View style={[styles.nopeIndicator, { opacity: nopeOpacity }]}>
        <GlowContainer color="error" intensity="heavy" animated={true}>
          <GradientText gradient="error" size="lg" weight="bold" glow={true}>
            NOPE
          </GradientText>
        </GlowContainer>
      </Animated.View>

      {/* Pet Photo with Glass Effect */}
      <GlassContainer intensity="light" transparency="light" border="light" shadow="medium">
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
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.infoOverlay}
      >
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <GradientText gradient="primary" size="2xl" weight="bold" glow={true}>
              {pet.name}
            </GradientText>
            <PremiumBody size="lg" weight="semibold" gradient="secondary">
              {ageText}
            </PremiumBody>
          </View>
          <PremiumBody size="base" weight="medium" gradient="primary">
            {pet.breed}
          </PremiumBody>
          <PremiumBody size="sm" weight="regular">
            {pet.distance} km away
          </PremiumBody>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'absolute',
  },
  petImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ffd700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#66d7a2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ff4458',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
  },
  petInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
});
