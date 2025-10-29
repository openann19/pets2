/**
 * 🚀 ADVANCED CARD COMPONENT - MOBILE
 * Professional card with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import React, { useCallback } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Re-export types for backward compatibility
export type { CardVariant, CardSize, CardInteraction };

interface CardAction {
  icon?: string;
  title?: string;
  onPress?: () => void | Promise<void>;
  apiAction?: () => Promise<any>;
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
  glowColor?: string;
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
  apiAction?: () => Promise<any>;
  apiActions?: {
    [key: string]: () => Promise<any>;
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
  glowColor = Theme.colors.primary[500],
  gradientColors = [Theme.colors.primary[500], Theme.colors.primary[600]],
  blurIntensity = 20,
  padding = 'md',
  margin = 'sm',
  actions = [],
  badge,
  status,
  apiActions = {},
}) => {
  // Use modular card animations hook
  const {
    scale,
    opacity,
    glow,
    elevation,
    shimmer,
    isPressed,
    isHovered,
    isLoading,
    triggerHaptic,
    animatePress,
    animateHover,
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
    } catch (error) {
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
      } catch (error) {
        logger.error('Card action failed:', { error });
        await triggerHaptic('heavy');
      } finally {
        setIsLoading(false);
      }
    },
    [apiActions, triggerHaptic, setIsLoading],
  );

  // Note: Card styling moved to CardVariants module
  const cardStyles = getCardStyles({ variant, glowColor });
  const sizeStyles = getSizeStyles({ size });

  // Note: Padding and margin helpers moved to CardVariants module

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
              { backgroundColor: badge.backgroundColor || Theme.colors.status.error },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.badgeText,
                { color: badge.color || Theme.colors.neutral[0] },
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
              { backgroundColor: status.backgroundColor || Theme.colors.status.success },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.statusText,
                { color: status.color || Theme.colors.neutral[0] },
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
        {title && <Text style={StyleSheet.flatten([styles.title, titleStyle])}>{title}</Text>}

        {/* Subtitle */}
        {subtitle && (
          <Text style={StyleSheet.flatten([styles.subtitle, subtitleStyle])}>{subtitle}</Text>
        )}

        {/* Description */}
        {description && (
          <Text style={StyleSheet.flatten([styles.description, descriptionStyle])}>
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
                icon={action.icon}
                title={action.title}
                variant={(action.variant || 'minimal') as 'minimal' | 'primary' | 'secondary'}
                size="sm"
                interactions={['hover', 'press']}
                haptic={action.haptic || 'light'}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
                loading={action.loading}
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
      shadowColor: glowColor,
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
        gradientColors={gradientColors}
        blurIntensity={blurIntensity}
      />

      {/* Glow Overlay */}
      {interactions.includes('glow') && (
        <Animated.View
          style={StyleSheet.flatten([
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: glowColor,
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
    gradientColors: [Theme.colors.primary[500], Theme.colors.primary[600]],
    ...props,
  }),

  // Premium card
  premium: (props: Partial<AdvancedCardProps>) => ({
    variant: 'premium' as CardVariant,
    interactions: ['hover', 'press', 'glow', 'bounce'] as CardInteraction[],
    glowColor: '#8b5cf6',
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
    glowColor: '#00ffff',
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
const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[500],
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default AdvancedCard;
