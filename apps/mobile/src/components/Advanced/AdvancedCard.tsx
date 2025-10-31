/**
 * 🚀 ADVANCED CARD COMPONENT - MOBILE
 * Professional card with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { logger } from '@pawfectmatch/core';
import React, { useCallback, useMemo } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

import { AdvancedButton } from './AdvancedInteractionSystem';
import { useCardAnimations, type CardInteraction } from './Card/CardAnimations';
import {
  getCardStyles,
  getSizeStyles,
  getPaddingValue,
  getMarginValue,
  type CardVariant,
  type CardSize,
} from './Card/CardVariants';
import { CardBackground } from './Card/CardBackground';

// Re-export types for backward compatibility
export type { CardVariant, CardSize, CardInteraction };

interface CardAction {
  icon?: string;
  title?: string;
  onPress?: () => void | Promise<void>;
  apiAction?: () => Promise<unknown>;
  variant?: 'primary' | 'secondary' | 'danger' | 'minimal';
  haptic?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  loading?: boolean;
}

interface AdvancedCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  variant?: CardVariant;
  size?: CardSize;
  interactions?: CardInteraction[];
  haptic?: 'light' | 'medium' | 'heavy';
  onPress?: () => void | Promise<void>;
  onLongPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  glowColor?: string | undefined;
  gradientColors?: string[];
  blurIntensity?: number;
  padding?: CardSize;
  margin?: CardSize;
  actions?: CardAction[];
  badge?: {
    text: string;
    color?: string;
    backgroundColor?: string;
  };
  status?: {
    text: string;
    color?: string;
    backgroundColor?: string;
  };
  apiAction?: () => Promise<unknown>;
  apiActions?: {
    [key: string]: () => Promise<unknown>;
  };
}

export const AdvancedCard: React.FC<AdvancedCardProps> = ({
  children,
  title,
  subtitle,
  description,
  image,
  variant = 'default',
  size = 'md',
  interactions = ['hover', 'press'],
  haptic = 'light',
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  glowColor,
  gradientColors,
  blurIntensity = 20,
  padding = 'md',
  margin = 'sm',
  actions = [],
  badge,
  status,
  apiActions = {},
}) => {
  const theme: AppTheme = useTheme();
  const defaultGlowColor = glowColor ?? theme.colors.primary;
  const defaultGradientColors = gradientColors ?? [...theme.palette.gradients.primary];

  // Use modular card animations hook
  const {
    scale,
    opacity,
    glow,
    elevation,
    shimmer,
    isLoading,
    triggerHaptic,
    animatePress,
    setIsLoading,
  } = useCardAnimations({
    disabled,
    loading,
    interactions,
    haptic,
  });

  // Note: Haptic and animation logic moved to useCardAnimations hook

  // Handle Press
  const handlePress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    setIsLoading(true);
    await triggerHaptic('medium');

    try {
      if (onPress) {
        await onPress();
      }
    } catch (error: unknown) {
      logger.error('Card action failed:', { error });
      await triggerHaptic('heavy');
    } finally {
      setIsLoading(false);
    }
  }, [disabled, loading, isLoading, onPress, triggerHaptic, setIsLoading]);

  // Handle Long Press
  const handleLongPress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    await triggerHaptic('heavy');

    if (onLongPress) {
      await onLongPress();
    }
  }, [disabled, loading, isLoading, onLongPress, triggerHaptic]);

  // Handle Action Press
  const handleActionPress = useCallback(
    async (action: CardAction) => {
      if (action.disabled || action.loading) return;

      setIsLoading(true);

      try {
        if (action.haptic) {
          await triggerHaptic(action.haptic);
        }

        if (action.apiAction) {
          await action.apiAction();
        }

        if (action.onPress) {
          await action.onPress();
        }

        if (apiActions[action.title || '']) {
          await apiActions[action.title || ''];
        }
      } catch (error: unknown) {
        logger.error('Card action failed:', { error });
        await triggerHaptic('heavy');
      } finally {
        setIsLoading(false);
      }
    },
    [apiActions, triggerHaptic, setIsLoading],
  );

  // Note: Card styling moved to CardVariants module
  const cardStyles = useMemo(
    () =>
      getCardStyles({
        variant,
        glowColor: defaultGlowColor,
      }),
    [variant, defaultGlowColor],
  );
  const sizeStyles = useMemo(() => getSizeStyles({ size }), [size]);

  // Background rendering moved to CardBackground module

  // Render Content
  const renderContent = () => {
    return (
      <View
        style={StyleSheet.flatten([
          styles.content,
          { padding: getPaddingValue({ padding }) },
          contentStyle,
        ])}
      >
        {/* Badge */}
        {badge && (
          <View
            style={StyleSheet.flatten([
              styles.badge,
              { backgroundColor: badge.backgroundColor ?? theme.colors.danger },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.badgeText,
                { color: badge.color ?? theme.colors.onPrimary },
              ])}
            >
              {badge.text}
            </Text>
          </View>
        )}

        {/* Status */}
        {status && (
          <View
            style={StyleSheet.flatten([
              styles.status,
              { backgroundColor: status.backgroundColor ?? theme.colors.success },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.statusText,
                { color: status.color ?? theme.colors.onPrimary },
              ])}
            >
              {status.text}
            </Text>
          </View>
        )}

        {/* Image */}
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Title */}
        {title && (
          <Text style={StyleSheet.flatten([styles.title(theme), titleStyle])}>{title}</Text>
        )}

        {/* Subtitle */}
        {subtitle && (
          <Text style={StyleSheet.flatten([styles.subtitle(theme), subtitleStyle])}>
            {subtitle}
          </Text>
        )}

        {/* Description */}
        {description && (
          <Text style={StyleSheet.flatten([styles.description(theme), descriptionStyle])}>
            {description}
          </Text>
        )}

        {/* Children */}
        {children}

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <AdvancedButton
                key={index}
                {...(action.icon ? { icon: action.icon } : {})}
                title={action.title ?? ''}
                variant={(action.variant || 'minimal') as 'minimal' | 'primary' | 'secondary'}
                size="sm"
                interactions={['hover', 'press']}
                haptic={action.haptic || 'light'}
                onPress={() => handleActionPress(action)}
                {...(action.disabled !== undefined ? { disabled: action.disabled } : {})}
                {...(action.loading !== undefined ? { loading: action.loading } : {})}
                style={styles.actionButton}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Note: Shimmer animation handled by useCardAnimations hook

  const cardStyle = [
    cardStyles,
    sizeStyles,
    {
      margin: getMarginValue({ margin }),
      transform: [{ scale }],
      opacity: disabled ? 0.6 : opacity,
      elevation,
      shadowColor: defaultGlowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.3],
      }),
      shadowRadius: glow.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 12],
      }),
    },
    style,
  ];

  return (
    <Animated.View style={cardStyle}>
      {/* Background */}
      <CardBackground
        variant={variant}
        gradientColors={defaultGradientColors}
        blurIntensity={blurIntensity}
      />

      {/* Glow Overlay */}
      {interactions.includes('glow') && (
        <Animated.View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: defaultGlowColor,
              opacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              borderRadius: 12,
            },
          ])}
          pointerEvents="none"
        />
      )}

      {/* Shimmer Overlay */}
      {(loading || isLoading) && (
        <Animated.View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              opacity: shimmer.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ])}
          pointerEvents="none"
        />
      )}

      {/* Content */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={() => {
          animatePress(true);
        }}
        onPressOut={() => {
          animatePress(false);
        }}
        disabled={disabled || loading || isLoading}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};
// Predefined Card Configurations
export const CardConfigs = {
  // Default card
  default: (props: Partial<AdvancedCardProps>) => ({
    variant: 'default' as CardVariant,
    interactions: ['hover', 'press'] as CardInteraction[],
    ...props,
  }),

  // Glass morphism card
  glass: (props: Partial<AdvancedCardProps>) => ({
    variant: 'glass' as CardVariant,
    interactions: ['hover', 'press', 'glow'] as CardInteraction[],
    blurIntensity: 20,
    ...props,
  }),

  // Gradient card
  gradient: (props: Partial<AdvancedCardProps>) => ({
    variant: 'gradient' as CardVariant,
    interactions: ['hover', 'press', 'glow'] as CardInteraction[],
    gradientColors: undefined, // Will use theme defaults
    ...props,
  }),

  // Premium card
  premium: (props: Partial<AdvancedCardProps>) => ({
    variant: 'premium' as CardVariant,
    interactions: ['hover', 'press', 'glow', 'bounce'] as CardInteraction[],
    glowColor: undefined, // Will use theme defaults
    ...props,
  }),

  // Minimal card
  minimal: (props: Partial<AdvancedCardProps>) => ({
    variant: 'minimal' as CardVariant,
    interactions: ['hover', 'press'] as CardInteraction[],
    ...props,
  }),

  // Neon card
  neon: (props: Partial<AdvancedCardProps>) => ({
    variant: 'neon' as CardVariant,
    interactions: ['hover', 'press', 'glow', 'bounce'] as CardInteraction[],
    glowColor: undefined, // Will use theme defaults
    ...props,
  }),

  // Holographic card
  holographic: (props: Partial<AdvancedCardProps>) => ({
    variant: 'holographic' as CardVariant,
    interactions: ['hover', 'press', 'glow', 'tilt'] as CardInteraction[],
    ...props,
  }),

  // Floating card
  floating: (props: Partial<AdvancedCardProps>) => ({
    variant: 'floating' as CardVariant,
    interactions: ['hover', 'press', 'bounce'] as CardInteraction[],
    ...props,
  }),
};

// Styles
const styles = {
  touchable: StyleSheet.create({
    touchable: {
      flex: 1,
    },
  }).touchable,
  content: StyleSheet.create({
    content: {
      flex: 1,
      position: 'relative',
    },
  }).content,
  badge: StyleSheet.create({
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 1,
    },
  }).badge,
  badgeText: StyleSheet.create({
    badgeText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  }).badgeText,
  status: StyleSheet.create({
    status: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 1,
    },
  }).status,
  statusText: StyleSheet.create({
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  }).statusText,
  image: StyleSheet.create({
    image: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      marginBottom: 12,
    },
  }).image,
  title: (theme: AppTheme) => ({
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.onSurface,
    marginBottom: 4,
  }),
  subtitle: (theme: AppTheme) => ({
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.colors.onMuted,
    marginBottom: 8,
  }),
  description: (theme: AppTheme) => ({
    fontSize: 14,
    color: theme.colors.onMuted,
    lineHeight: 20,
    marginBottom: 12,
  }),
  actionsContainer: StyleSheet.create({
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 12,
    },
  }).actionsContainer,
  actionButton: StyleSheet.create({
    actionButton: {
      marginLeft: 8,
    },
  }).actionButton,
};

export default AdvancedCard;