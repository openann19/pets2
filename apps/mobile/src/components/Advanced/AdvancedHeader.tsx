/**
 * 🚀 ADVANCED HEADER COMPONENT - MOBILE
 * Professional header with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { matchesAPI } from '../../services/api';

import { AdvancedButton } from './AdvancedInteractionSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  apiAction?: () => Promise<any>;
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
    [key: string]: () => Promise<any>;
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
  backgroundColor = Theme.colors.neutral[0],
  textColor = Theme.colors.text.primary,
  blurIntensity = 20,
  gradientColors = [Theme.colors.primary[500], Theme.colors.primary[600]],
  style,
  titleStyle,
  subtitleStyle,
  floating = false,
  transparent = false,
  apiActions = {},
}) => {
  // Animation Values
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const titleScale = useRef(new Animated.Value(1)).current;

  // State
  const [isScrolled, setIsScrolled] = useState(false);
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
      } catch (error) {
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
        title={button.title}
        variant={variant}
        size="sm"
        interactions={['hover', 'press', 'glow']}
        haptic={button.haptic || 'light'}
        onPress={() => handleButtonPress(button)}
        disabled={button.disabled}
        loading={button.loading || isLoading}
        style={StyleSheet.flatten([
          styles.headerButton,
          isLeft ? styles.leftButton : styles.rightButton,
        ])}
        glowColor={variant === 'primary' ? Theme.colors.primary[500] : Theme.colors.neutral[500]}
      >
        {button.badge && button.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{button.badge > 99 ? '99+' : button.badge}</Text>
          </View>
        )}
      </AdvancedButton>
    );
  };

  // Get Header Styles
  const getHeaderStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
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
          backgroundColor: transparent ? 'transparent' : backgroundColor,
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
          borderBottomColor: Theme.colors.neutral[100],
        };
      case 'floating':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : backgroundColor,
          borderRadius: 12,
          marginHorizontal: 16,
          marginTop: 8,
          shadowColor: Theme.colors.neutral[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : backgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: Theme.colors.neutral[200],
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
              glowColor="Theme.colors.neutral[500]"
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
              <Text style={StyleSheet.flatten([styles.title, { color: textColor }, titleStyle])}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={StyleSheet.flatten([styles.subtitle, { color: textColor }, subtitleStyle])}
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        floating && styles.floatingContainer,
        transparent && styles.transparentContainer,
      ])}
    >
      <StatusBar
        barStyle={variant === 'glass' || variant === 'gradient' ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : backgroundColor}
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
    textColor: Theme.colors.neutral[0],
    ...props,
  }),

  // Gradient header
  gradient: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'gradient' as HeaderVariant,
    showBackButton: true,
    gradientColors: [Theme.colors.primary[500], Theme.colors.primary[600]],
    textColor: Theme.colors.neutral[0],
    ...props,
  }),

  // Premium header
  premium: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'premium' as HeaderVariant,
    showBackButton: true,
    textColor: '#8b5cf6',
    ...props,
  }),

  // Minimal header
  minimal: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'minimal' as HeaderVariant,
    showBackButton: true,
    textColor: Theme.colors.neutral[500],
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
const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.neutral[0],
  },
  floatingContainer: {
    backgroundColor: 'transparent',
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  headerWrapper: {
    position: 'relative',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 4,
  },
  headerButton: {
    minWidth: 40,
    minHeight: 40,
  },
  leftButton: {
    marginRight: 8,
  },
  rightButton: {
    marginLeft: 8,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Theme.colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.neutral[0],
  },
  badgeText: {
    color: Theme.colors.neutral[0],
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AdvancedHeader;
