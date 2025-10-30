/**
 * 🎨 CARD BACKGROUND COMPONENT
 * Renders card background based on variant
 */

import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardVariant } from './CardVariants';

interface CardBackgroundProps {
  variant: CardVariant;
  gradientColors: string[];
  blurIntensity?: number;
}

export function CardBackground({
  variant,
  gradientColors,
  blurIntensity = 20,
}: CardBackgroundProps) {
  switch (variant) {
    case 'glass':
      return (
        <BlurView
          intensity={blurIntensity}
          style={StyleSheet.absoluteFillObject}
        />
      );
    case 'gradient':
      return (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    case 'premium':
      return (
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    case 'holographic':
      return (
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      );
    default:
      return null;
  }
}
