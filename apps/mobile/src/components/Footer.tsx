import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useEffect } from 'react';
import { Linking, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { getExtendedColors } from '../theme/adapters';
import AnimatedButton from './AnimatedButton';
import { springs } from '@/foundation/motion';

interface FooterProps {
  showCopyright?: boolean;
  showLegal?: boolean;
  showVersion?: boolean;
  showSupport?: boolean;
  variant?: 'default' | 'minimal' | 'premium';
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Footer({
  showCopyright = true,
  showLegal = true,
  showVersion = false,
  showSupport = true,
  variant = 'default',
  style,
  accessibilityLabel = 'App footer with legal links and support information',
  accessibilityHint = 'Contains links to terms of service, privacy policy, and support contact',
}: FooterProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(300, withSpring(0, springs.gentle));
  }, [opacity.value, translateY.value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleLinkPress = async (url: string): Promise<void> => {
    try {
      // Haptic feedback
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      logger.error('Error opening link:', { error });
    }
  };

  const handleSupportPress = (): void => {
    handleLinkPress('mailto:support@pawfectmatch.com?subject=Mobile App Support');
  };

  const handleTermsPress = (): void => {
    handleLinkPress('https://pawfectmatch.com/terms');
  };

  const handlePrivacyPress = (): void => {
    handleLinkPress('https://pawfectmatch.com/privacy');
  };

  const styles = StyleSheet.create({
    // Default Footer Styles
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    content: {
      alignItems: 'center',
    },
    brandSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    logoContainer: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    logoEmoji: {
      fontSize: 18,
    },
    brandText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    brandName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    tagline: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginTop: 2,
    },
    legalSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    legalLink: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      backgroundColor: 'transparent',
    },
    legalLinkText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    separator: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onMuted,
    },
    linksSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.md,
    },
    linkButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.surface,
    },
    linkText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    copyrightSection: {
      alignItems: 'center',
    },
    copyrightText: {
      fontSize: 11,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: 4,
    },
    versionText: {
      fontSize: 10,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    supportButtonText: {
      fontSize: 12,
      color: theme.colors.onPrimary,
      fontWeight: '600',
      marginLeft: 4,
    },

    // Minimal Footer Styles
    minimalContainer: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    minimalContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    minimalBrand: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    minimalCopyright: {
      fontSize: 12,
      color: theme.colors.onMuted,
    },

    // Premium Footer Styles
    premiumContainer: {
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    premiumContent: {
      alignItems: 'center',
    },
    premiumBrandSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    premiumBrandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    premiumLogoContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.primary,
    },
    premiumLogoEmoji: {
      fontSize: 20,
    },
    premiumBrandText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    premiumTagline: {
      fontSize: 13,
      color: theme.colors.onMuted,
      marginTop: 4,
    },
    premiumLinksSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.lg,
    },
    premiumLinkButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.sm,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    premiumLinkText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    premiumCopyrightSection: {
      alignItems: 'center',
    },
    premiumCopyrightText: {
      fontSize: 12,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: 6,
    },
    premiumVersionText: {
      fontSize: 11,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    premiumSupportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.primary,
      marginTop: theme.spacing.md,
      shadowColor: theme.utils.alpha(theme.colors.primary, 0.3),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    premiumSupportButtonText: {
      fontSize: 13,
      color: theme.colors.onPrimary,
      fontWeight: '700',
      marginLeft: 6,
    },
    // Support section styles (used in default footer)
    supportSection: {
      width: '100%',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    supportContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    supportText: {
      fontSize: 12,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    // Premium footer additional styles
    premiumBlur: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
    },
    premiumBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    premiumBrandName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    premiumLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.md,
    },
    premiumLink: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginHorizontal: theme.spacing.xs,
    },
    premiumCopyright: {
      fontSize: 12,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
  });

  const renderDefaultFooter = (): React.ReactElement => (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.onPrimary },
        style,
        animatedStyle as AnimatedStyle<ViewStyle>,
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.content}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandContainer}>
            <View
              style={StyleSheet.flatten([
                styles.logoContainer,
                { backgroundColor: colors.primary },
              ])}
            >
              <Text style={styles.logoEmoji}>🐾</Text>
            </View>
            <Text
              style={StyleSheet.flatten([styles.brandName, { color: theme.palette.neutral[800] }])}
            >
              PawfectMatch
            </Text>
          </View>

          {showVersion ? (
            <Text
              style={StyleSheet.flatten([
                styles.versionText,
                { color: theme.palette.neutral[500] },
              ])}
            >
              Version 1.0.0
            </Text>
          ) : null}
        </View>

        {/* Legal Links */}
        {showLegal ? (
          <View style={styles.legalSection}>
            <AnimatedButton
              onPress={handleTermsPress}
              style={styles.legalLink}
              textStyle={[styles.legalLinkText, { color: colors.primary }]}
              accessibilityLabel="Terms of Service"
              accessibilityHint="Opens Terms of Service in browser"
              accessibilityRole="link"
            >
              Terms of Service
            </AnimatedButton>

            <Text
              style={StyleSheet.flatten([styles.separator, { color: theme.palette.neutral[400] }])}
            >
              •
            </Text>

            <AnimatedButton
              onPress={handlePrivacyPress}
              style={styles.legalLink}
              textStyle={[styles.legalLinkText, { color: colors.primary }]}
              accessibilityLabel="Privacy Policy"
              accessibilityHint="Opens Privacy Policy in browser"
              accessibilityRole="link"
            >
              Privacy Policy
            </AnimatedButton>
          </View>
        ) : null}

        {/* Support Section */}
        {showSupport ? (
          <AnimatedButton
            onPress={handleSupportPress}
            style={styles.supportSection}
            accessibilityLabel="Contact Support"
            accessibilityHint="Opens email client to contact support"
            accessibilityRole="button"
          >
            <View style={styles.supportContent}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={theme.palette.neutral[500]}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.supportText,
                  { color: theme.palette.neutral[500] },
                ])}
              >
                Need Help? Contact Support
              </Text>
            </View>
          </AnimatedButton>
        ) : null}

        {/* Copyright */}
        {showCopyright ? (
          <View style={styles.copyrightSection}>
            <Text
              style={StyleSheet.flatten([
                styles.copyrightText,
                { color: theme.palette.neutral[500] },
              ])}
            >
              © {new Date().getFullYear()} PawfectMatch Inc. All rights reserved.
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderMinimalFooter = (): React.ReactElement => (
    <Animated.View
      style={[
        styles.minimalContainer,
        { backgroundColor: colors.onPrimary },
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.minimalContent}>
        <Text
          style={StyleSheet.flatten([styles.minimalBrand, { color: theme.palette.neutral[600] }])}
        >
          🐾 PawfectMatch
        </Text>
        {showCopyright ? (
          <Text
            style={StyleSheet.flatten([
              styles.minimalCopyright,
              { color: theme.palette.neutral[500] },
            ])}
          >
            © {new Date().getFullYear()}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderPremiumFooter = (): React.ReactElement => (
    <Animated.View style={[animatedStyle, style]}>
      <LinearGradient
        colors={[
          theme.utils.alpha(theme.colors.primary, 0.1),
          theme.utils.alpha(theme.colors.info, 0.1),
        ] as [string, string]}
        style={StyleSheet.flatten([styles.premiumContainer, style])}
      >
        <BlurView
          intensity={20}
          style={styles.premiumBlur}
        >
          <View style={styles.premiumContent}>
            <View style={styles.premiumBrand}>
              <View style={styles.premiumLogoContainer}>
                <Text style={styles.premiumLogoEmoji}>💎</Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.premiumBrandName,
                  { color: theme.palette.neutral[800] },
                ])}
              >
                PawfectMatch Premium
              </Text>
            </View>

            <View style={styles.premiumLinksSection}>
              <AnimatedButton
                onPress={handleTermsPress}
                style={styles.premiumLinkButton}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Terms
              </AnimatedButton>

              <Text
                style={StyleSheet.flatten([
                  styles.separator,
                  { color: theme.palette.neutral[400] },
                ])}
              >
                •
              </Text>

              <AnimatedButton
                onPress={handlePrivacyPress}
                style={styles.premiumLinkButton}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Privacy
              </AnimatedButton>

              <Text
                style={StyleSheet.flatten([
                  styles.separator,
                  { color: theme.palette.neutral[400] },
                ])}
              >
                •
              </Text>

              <AnimatedButton
                onPress={handleSupportPress}
                style={styles.premiumLinkButton}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Support
              </AnimatedButton>
            </View>

            {showCopyright ? (
              <Text
                style={StyleSheet.flatten([
                  styles.premiumCopyright,
                  { color: theme.palette.neutral[500] },
                ])}
              >
                © {new Date().getFullYear()} PawfectMatch Inc.
              </Text>
            ) : null}
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimalFooter();
    case 'premium':
      return renderPremiumFooter();
    default:
      return renderDefaultFooter();
  }
}
