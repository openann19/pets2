/**
 * 🚀 ADVANCED HEADER COMPONENT - MOBILE
 * Professional header with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useCallback } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { AdvancedButton } from './AdvancedInteractionSystem';

// Header Variants
export type HeaderVariant = 'default' | 'glass' | 'gradient' | 'premium' | 'minimal' | 'floating';

export type HeaderButtonType =
  | 'back'
  | 'close'
  | 'menu'
  | 'search'
  | 'filter'
  | 'settings'
  | 'profile'
  | 'add'
  | 'edit'
  | 'share'
  | 'more'
  | 'custom';

interface HeaderButton {
  type: HeaderButtonType;
  icon?: string;
  title?: string;
  onPress?: () => void | Promise<void>;
  apiAction?: () => Promise<unknown>;
  variant?: 'primary' | 'secondary' | 'glass' | 'minimal';
  haptic?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  customComponent?: React.ReactNode;
}

interface AdvancedHeaderProps {
  title?: string;
  subtitle?: string;
  variant?: HeaderVariant;
  leftButtons?: HeaderButton[];
  rightButtons?: HeaderButton[];
  onBackPress?: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  textColor?: string;
  blurIntensity?: number;
  gradientColors?: string[];
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  floating?: boolean;
  transparent?: boolean;
  apiActions?: {
    [key: string]: () => Promise<unknown>;
  };
}

export const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  leftButtons = [],
  rightButtons = [],
  onBackPress,
  showBackButton = true,
  backgroundColor,
  textColor,
  blurIntensity = 20,
  gradientColors,
  style,
  titleStyle,
  subtitleStyle,
  floating = false,
  transparent = false,
  apiActions = {},
}) => {
  const theme = useTheme() as AppTheme;
  const resolvedBackgroundColor = backgroundColor ?? theme.colors.bg;
  const resolvedTextColor = textColor ?? theme.colors.onSurface;
  const resolvedGradientColors = gradientColors ?? theme.palette.gradients.primary;
  
  // Animation Values
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(1)).current;

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Handle Back Press
  const handleBackPress = useCallback(async () => {
    if (onBackPress) {
      await onBackPress();
    }
  }, [onBackPress]);

  // Handle Button Press
  const handleButtonPress = useCallback(
    async (button: HeaderButton) => {
      if (button.disabled || button.loading) return;

      setIsLoading(true);

      try {
        // Trigger haptic feedback
        if (button.haptic) {
          await Haptics.impactAsync(
            button.haptic === 'light'
              ? Haptics.ImpactFeedbackStyle.Light
              : button.haptic === 'medium'
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Heavy,
          );
        }

        // Execute API action if provided
        if (button.apiAction) {
          await button.apiAction();
        }

        // Execute custom onPress
        if (button.onPress) {
          await button.onPress();
        }

        // Execute API action from props
        const action = apiActions?.[button.type];
        if (action) {
          await action();
        }
      } catch (error: unknown) {
        logger.error('Header button action failed:', { error });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiActions],
  );

  // Get Button Icon
  const getButtonIcon = (type: HeaderButtonType, customIcon?: string): string => {
    if (customIcon) return customIcon;

    switch (type) {
      case 'back':
        return 'arrow-back';
      case 'close':
        return 'close';
      case 'menu':
        return 'menu';
      case 'search':
        return 'search';
      case 'filter':
        return 'options-outline';
      case 'settings':
        return 'settings-outline';
      case 'profile':
        return 'person-outline';
      case 'add':
        return 'add';
      case 'edit':
        return 'create-outline';
      case 'share':
        return 'share-outline';
      case 'more':
        return 'ellipsis-vertical';
      default:
        return 'ellipsis-vertical';
    }
  };

  // Get Button Variant
  const getButtonVariant = (
    button: HeaderButton,
  ): 'primary' | 'secondary' | 'glass' | 'minimal' => {
    if (button.variant) return button.variant;

    switch (button.type) {
      case 'back':
      case 'close':
        return 'minimal';
      case 'search':
      case 'filter':
        return 'glass';
      case 'add':
      case 'edit':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Render Button
  const renderButton = (button: HeaderButton, isLeft = true) => {
    if (button.customComponent) {
      return button.customComponent;
    }

    const icon = getButtonIcon(button.type, button.icon);
    const variant = getButtonVariant(button);

    return (
      <AdvancedButton
        icon={icon}
        {...(button.title ? { title: button.title } : {})}
        variant={variant}
        size="sm"
        interactions={['hover', 'press', 'glow']}
        haptic={button.haptic || 'light'}
        onPress={() => handleButtonPress(button)}
        disabled={button.disabled ?? false}
        loading={(button.loading ?? false) || isLoading}
        style={StyleSheet.flatten([
          styles.headerButton,
          isLeft ? styles.leftButton : styles.rightButton,
        ])}
        glowColor={variant === 'primary' ? theme.colors.primary : theme.colors.onMuted}
      >
        {button.badge && button.badge > 0 ? (
          <View style={styles.badge(theme)}>
            <Text style={styles.badgeText(theme)}>{button.badge > 99 ? '99+' : button.badge}</Text>
          </View>
        ) : null}
      </AdvancedButton>
    );
  };

  // Get Header Styles
  const getHeaderStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 56,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        };
      case 'gradient':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : resolvedBackgroundColor,
        };
      case 'premium':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(139, 92, 246, 0.2)',
        };
      case 'minimal':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        };
      case 'floating':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : resolvedBackgroundColor,
          borderRadius: theme.radii.lg,
          marginHorizontal: theme.spacing.md,
          marginTop: theme.spacing.sm,
          shadowColor: theme.colors.onSurface,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : resolvedBackgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        };
    }
  };

  // Render Header Content
  const renderHeaderContent = () => {
    const headerStyle = [getHeaderStyles(), style];

    return (
      <Animated.View
        style={StyleSheet.flatten([
          headerStyle,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ])}
      >
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <AdvancedButton
              icon="arrow-back"
              variant="minimal"
              size="sm"
              interactions={['hover', 'press', 'glow']}
              haptic="light"
              onPress={handleBackPress}
              style={styles.backButton}
              glowColor={theme.colors.onMuted}
            />
          )}
          {leftButtons.map((button, index) => (
            <View
              key={index}
              style={styles.buttonContainer}
            >
              {renderButton(button, true)}
            </View>
          ))}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Animated.View
            style={{
              transform: [{ scale: titleScale }],
            }}
          >
            {title && (
              <Text style={StyleSheet.flatten([styles.title, { color: resolvedTextColor }, titleStyle])}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={StyleSheet.flatten([styles.subtitle, { color: resolvedTextColor }, subtitleStyle])}
              >
                {subtitle}
              </Text>
            )}
          </Animated.View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightButtons.map((button, index) => (
            <View
              key={index}
              style={styles.buttonContainer}
            >
              {renderButton(button, false)}
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Render Background
  const renderBackground = () => {
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
            colors={resolvedGradientColors}
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container(theme),
        floating && styles.floatingContainer,
        transparent && styles.transparentContainer,
      ])}
    >
      <StatusBar
        barStyle={variant === 'glass' || variant === 'gradient' ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : resolvedBackgroundColor}
        translucent={transparent}
      />

      <View style={styles.headerWrapper}>
        {renderBackground()}
        {renderHeaderContent()}
      </View>
    </SafeAreaView>
  );
};

// Predefined Header Configurations
export const HeaderConfigs = {
  // Default header with back button
  default: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'default' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Glass morphism header
  glass: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'glass' as HeaderVariant,
    showBackButton: true,
    blurIntensity: 20,
    ...props,
  }),

  // Gradient header
  gradient: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'gradient' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Premium header
  premium: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'premium' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Minimal header
  minimal: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'minimal' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Floating header
  floating: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'floating' as HeaderVariant,
    showBackButton: true,
    floating: true,
    ...props,
  }),
};

// Styles
const styles = {
  container: (theme: AppTheme) => ({
    backgroundColor: theme.colors.bg,
  }),
  floatingContainer: StyleSheet.create({
    floatingContainer: {
      backgroundColor: 'transparent',
    },
  }).floatingContainer,
  transparentContainer: StyleSheet.create({
    transparentContainer: {
      backgroundColor: 'transparent',
    },
  }).transparentContainer,
  headerWrapper: StyleSheet.create({
    headerWrapper: {
      position: 'relative',
    },
  }).headerWrapper,
  leftSection: StyleSheet.create({
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
  }).leftSection,
  centerSection: StyleSheet.create({
    centerSection: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }).centerSection,
  rightSection: StyleSheet.create({
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },
  }).rightSection,
  buttonContainer: StyleSheet.create({
    buttonContainer: {
      marginHorizontal: 4,
    },
  }).buttonContainer,
  headerButton: StyleSheet.create({
    headerButton: {
      minWidth: 40,
      minHeight: 40,
    },
  }).headerButton,
  leftButton: StyleSheet.create({
    leftButton: {
      marginRight: 8,
    },
  }).leftButton,
  rightButton: StyleSheet.create({
    rightButton: {
      marginLeft: 8,
    },
  }).rightButton,
  backButton: StyleSheet.create({
    backButton: {
      marginRight: 8,
    },
  }).backButton,
  title: StyleSheet.create({
    title: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
  }).title,
  subtitle: StyleSheet.create({
    subtitle: {
      fontSize: 14,
      fontWeight: '400',
      textAlign: 'center',
      marginTop: 2,
      opacity: 0.8,
    },
  }).subtitle,
  badge: (theme: AppTheme) => ({
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: theme.colors.bg,
  }),
  badgeText: (theme: AppTheme) => ({
    color: theme.colors.bg,
    fontSize: 10,
    fontWeight: 'bold' as const,
  }),
};

export default AdvancedHeader;

