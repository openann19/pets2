/**
 * 🎨 UNIFIED PREMIUM STYLE SYSTEM
 * Centralized configuration for premium UI styling across all screens
 * Configurable via admin panel
 */

import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';

export interface PremiumStyleConfig {
  // Animation Settings
  animations: {
    enabled: boolean;
    reducedMotion: boolean;
    springConfig: {
      stiffness: number;
      damping: number;
      mass: number;
    };
    entranceDelay: number;
    staggerDelay: number;
  };

  // Card Variants
  card: {
    variant: 'elevated' | 'glass' | 'neon' | 'minimal' | 'holographic';
    enableGlow: boolean;
    enableShimmer: boolean;
    enableTilt: boolean;
    enableMagnetic: boolean;
    blurIntensity: number;
    shadowIntensity: number;
  };

  // Button Variants
  button: {
    variant: 'primary' | 'secondary' | 'premium' | 'glass' | 'neon';
    enableRipple: boolean;
    enableMagnetic: boolean;
    enableGlow: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
  };

  // Typography
  typography: {
    enableGradientText: boolean;
    enableKineticTypography: boolean;
    enableScrollReveal: boolean;
    gradientSpeed: number;
    kineticVariant: 'bounce' | 'wave' | 'pulse' | 'slide';
  };

  // Effects
  effects: {
    enableParallax: boolean;
    enableParticles: boolean;
    enableConfetti: boolean;
    parallaxLayers: number;
    particleCount: number;
  };

  // Colors
  colors: {
    enableNeonAccents: boolean;
    neonIntensity: number;
    enableHDR: boolean;
    enableDynamicColors: boolean;
    enableGradientMeshes: boolean;
  };

  // Scroll
  scroll: {
    enableParallax: boolean;
    enableSticky: boolean;
    enableMomentum: boolean;
    parallaxIntensity: number;
    stickyTransform: boolean;
  };

  // Performance
  performance: {
    enableGPUAcceleration: boolean;
    enableLazyLoading: boolean;
    maxFPS: number;
    qualityTier: 'auto' | 'low' | 'medium' | 'high' | 'ultra';
  };
}

export const DEFAULT_PREMIUM_CONFIG: PremiumStyleConfig = {
  animations: {
    enabled: true,
    reducedMotion: false,
    springConfig: {
      stiffness: 100,
      damping: 10,
      mass: 1,
    },
    entranceDelay: 0,
    staggerDelay: 100,
  },
  card: {
    variant: 'glass',
    enableGlow: true,
    enableShimmer: true,
    enableTilt: true,
    enableMagnetic: false,
    blurIntensity: 20,
    shadowIntensity: 0.3,
  },
  button: {
    variant: 'premium',
    enableRipple: true,
    enableMagnetic: false,
    enableGlow: true,
    hapticFeedback: true,
    soundEffects: false,
  },
  typography: {
    enableGradientText: true,
    enableKineticTypography: false,
    enableScrollReveal: true,
    gradientSpeed: 3000,
    kineticVariant: 'wave',
  },
  effects: {
    enableParallax: true,
    enableParticles: false,
    enableConfetti: true,
    parallaxLayers: 3,
    particleCount: 50,
  },
  colors: {
    enableNeonAccents: true,
    neonIntensity: 50,
    enableHDR: false,
    enableDynamicColors: false,
    enableGradientMeshes: true,
  },
  scroll: {
    enableParallax: true,
    enableSticky: true,
    enableMomentum: true,
    parallaxIntensity: 0.5,
    stickyTransform: true,
  },
  performance: {
    enableGPUAcceleration: true,
    enableLazyLoading: true,
    maxFPS: 60,
    qualityTier: 'auto',
  },
};

/**
 * Premium Style Context
 * Provides unified style configuration across the app
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useReduceMotion } from '@/hooks/useReducedMotion';

interface PremiumStyleContextValue {
  config: PremiumStyleConfig;
  updateConfig: (updates: Partial<PremiumStyleConfig>) => void;
  resetConfig: () => void;
  theme: AppTheme;
}

const PremiumStyleContext = createContext<PremiumStyleContextValue | null>(null);

export const PremiumStyleProvider: React.FC<{
  children: React.ReactNode;
  initialConfig?: Partial<PremiumStyleConfig>;
}> = ({ children, initialConfig }) => {
  const reduceMotion = useReduceMotion();
  const [config, setConfig] = useState<PremiumStyleConfig>(() => ({
    ...DEFAULT_PREMIUM_CONFIG,
    ...initialConfig,
    animations: {
      ...DEFAULT_PREMIUM_CONFIG.animations,
      ...initialConfig?.animations,
      reducedMotion: reduceMotion,
    },
  }));

  // Load config from admin API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // TODO: Load from admin API
        // const response = await fetch('/api/admin/ui-config');
        // const adminConfig = await response.json();
        // setConfig(prev => ({ ...prev, ...adminConfig }));
      } catch (error) {
        console.warn('Failed to load admin UI config, using defaults', error);
      }
    };
    loadConfig();
  }, []);

  const updateConfig = (updates: Partial<PremiumStyleConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
      animations: {
        ...prev.animations,
        ...updates.animations,
      },
    }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_PREMIUM_CONFIG);
  };

  const theme = useTheme();

  return (
    <PremiumStyleContext.Provider value={{ config, updateConfig, resetConfig, theme }}>
      {children}
    </PremiumStyleContext.Provider>
  );
};

export const usePremiumStyle = (): PremiumStyleContextValue => {
  const context = useContext(PremiumStyleContext);
  if (!context) {
    throw new Error('usePremiumStyle must be used within PremiumStyleProvider');
  }
  return context;
};

/**
 * Premium Screen Wrapper
 * Applies consistent premium styling to all screens
 */
import { View, StyleSheet, ScrollView, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface PremiumScreenWrapperProps {
  children: React.ReactNode;
  enableBackgroundGradient?: boolean;
  enableBlur?: boolean;
  scrollable?: boolean;
  entranceAnimation?: 'fade' | 'fadeDown' | 'none';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const PremiumScreenWrapper: React.FC<PremiumScreenWrapperProps> = ({
  children,
  enableBackgroundGradient = true,
  enableBlur = false,
  scrollable = false,
  entranceAnimation = 'fadeDown',
  style,
  contentContainerStyle,
}) => {
  const { config, theme } = usePremiumStyle();
  const insets = useSafeAreaInsets();

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        contentContainerStyle: [
          styles.contentContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          contentContainerStyle,
        ],
        showsVerticalScrollIndicator: false,
      }
    : {
        style: [
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          style,
        ],
      };

  const entering =
    entranceAnimation === 'fade'
      ? FadeIn.duration(300)
      : entranceAnimation === 'fadeDown'
        ? FadeInDown.duration(400).delay(config.animations.entranceDelay)
        : undefined;

  const content = entranceAnimation !== 'none' && entering ? (
    <Animated.View entering={entering} style={styles.animatedContainer}>
      {enableBackgroundGradient && config.colors.enableGradientMeshes ? (
        <LinearGradient
          colors={[
            theme.colors.bg,
            theme.colors.surface,
            theme.colors.bg,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]} />
      )}
      {enableBlur && config.card.blurIntensity > 0 && (
        <BlurView intensity={config.card.blurIntensity} style={StyleSheet.absoluteFill} />
      )}
      {children}
    </Animated.View>
  ) : (
    <View style={styles.animatedContainer}>
      {children}
    </View>
  );

  return (
    <Container {...containerProps}>
      {content}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  animatedContainer: {
    flex: 1,
  },
});

export default {
  DEFAULT_PREMIUM_CONFIG,
  PremiumStyleProvider,
  usePremiumStyle,
  PremiumScreenWrapper,
};

